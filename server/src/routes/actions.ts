import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../utils/auth.js';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// Apply auth middleware to all action routes
router.use(authenticateToken);

// GET /api/tickets/:id/actions - View Actions Taken
router.get('/', async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ error: 'Invalid ticket ID' });
  }

  const user = (req as any).user;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, requesterId: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Requester can only view actions for tickets they own
    if (user.role === 'REQUESTER' && ticket.requesterId !== user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
    }

    const actions = await prisma.actionTaken.findMany({
      where: { ticketId },
      orderBy: { actionDate: 'asc' },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.status(200).json(actions);
  } catch (error) {
    console.error('Failed to fetch actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions taken' });
  }
});

// POST /api/tickets/:id/actions - Create Action Taken
router.post('/', requireRole(['IT_STAFF', 'ADMINISTRATOR']), async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  if (isNaN(ticketId)) {
    return res.status(400).json({ error: 'Invalid ticket ID' });
  }

  const { description, result, actionDate, followUpRequired, followUpNote, attachmentNotes } = req.body;

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Action description is required' });
  }

  if (!result || typeof result !== 'string' || !result.trim()) {
    return res.status(400).json({ error: 'Action result is required' });
  }

  const isFollowUpReq = Boolean(followUpRequired);
  if (isFollowUpReq && (!followUpNote || typeof followUpNote !== 'string' || !followUpNote.trim())) {
    return res.status(400).json({ error: 'Follow-up note is required when follow-up is needed' });
  }

  const user = (req as any).user;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const newAction = await prisma.actionTaken.create({
      data: {
        ticketId,
        actionDate: actionDate ? new Date(actionDate) : new Date(),
        description: description.trim(),
        result: result.trim(),
        performedById: user.id, // Auto-populated from authenticated user
        followUpRequired: isFollowUpReq,
        followUpNote: isFollowUpReq ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes && typeof attachmentNotes === 'string' ? attachmentNotes.trim() : null,
      },
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.status(201).json(newAction);
  } catch (error) {
    console.error('Failed to create action taken:', error);
    res.status(500).json({ error: 'Failed to create action taken' });
  }
});

// PUT /api/tickets/:id/actions/:actionId - Update Action Taken
router.put('/:actionId', requireRole(['IT_STAFF', 'ADMINISTRATOR']), async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id, 10);
  const actionId = parseInt(req.params.actionId, 10);

  if (isNaN(ticketId) || isNaN(actionId)) {
    return res.status(400).json({ error: 'Invalid ticket ID or action ID' });
  }

  const { description, result, actionDate, followUpRequired, followUpNote, attachmentNotes } = req.body;

  try {
    const existingAction = await prisma.actionTaken.findFirst({
      where: { id: actionId, ticketId },
    });

    if (!existingAction) {
      return res.status(404).json({ error: 'Action taken not found for this ticket' });
    }

    const updateData: any = {};

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ error: 'Action description cannot be empty' });
      }
      updateData.description = description.trim();
    }

    if (result !== undefined) {
      if (typeof result !== 'string' || !result.trim()) {
        return res.status(400).json({ error: 'Action result cannot be empty' });
      }
      updateData.result = result.trim();
    }

    if (actionDate !== undefined) {
      updateData.actionDate = new Date(actionDate);
    }

    const finalFollowUpReq = followUpRequired !== undefined ? Boolean(followUpRequired) : existingAction.followUpRequired;
    updateData.followUpRequired = finalFollowUpReq;

    if (finalFollowUpReq) {
      const finalNote = followUpNote !== undefined ? followUpNote : existingAction.followUpNote;
      if (!finalNote || typeof finalNote !== 'string' || !finalNote.trim()) {
        return res.status(400).json({ error: 'Follow-up note is required when follow-up is needed' });
      }
      updateData.followUpNote = finalNote.trim();
    } else {
      updateData.followUpNote = null;
    }

    if (attachmentNotes !== undefined) {
      updateData.attachmentNotes = typeof attachmentNotes === 'string' ? attachmentNotes.trim() : null;
    }

    const updated = await prisma.actionTaken.update({
      where: { id: actionId },
      data: updateData,
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Failed to update action taken:', error);
    res.status(500).json({ error: 'Failed to update action taken' });
  }
});

export default router;
