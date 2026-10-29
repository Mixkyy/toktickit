import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken, requireRole } from '../utils/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth and role middleware to all routes in this router
router.use(authenticateToken);
router.use(requireRole(['IT_STAFF', 'ADMINISTRATOR']));

router.get('/tickets', async (req: Request, res: Response) => {
  const { search, status, categoryId, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Build WHERE clause
  const where: Prisma.TicketWhereInput = {};

  if (status) {
    where.currentStatus = String(status);
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId as string);
  }

  if (search) {
    where.OR = [
      { ticketNumber: { contains: String(search), mode: 'insensitive' } },
      { summary: { contains: String(search), mode: 'insensitive' } }
    ];
  }

  // Handle sorting
  let orderBy: any = {};
  const validSortFields = ['createdAt', 'ticketNumber', 'currentStatus', 'requestedPriority', 'itPriority'];
  const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
  const order = sortOrder === 'asc' ? 'asc' : 'desc';
  orderBy[sortField] = order;

  try {
    const [total, data] = await prisma.$transaction([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true, email: true } },
          requester: { select: { id: true, name: true, email: true } }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      data,
      total,
      page: pageNum,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets for staff' });
  }
});

export const PERMITTED_STATUS_TRANSITIONS: Record<string, string[]> = {
  'New': ['Open', 'In Progress', 'Cancelled'],
  'Open': ['In Progress', 'Waiting for Requester', 'Resolved', 'Cancelled'],
  'In Progress': ['Waiting for Requester', 'Resolved', 'Cancelled'],
  'Waiting for Requester': ['In Progress', 'Resolved', 'Cancelled'],
  'Resolved': ['Closed', 'Reopened'],
  'Closed': ['Reopened'],
  'Reopened': ['In Progress', 'Resolved', 'Cancelled'],
  'Cancelled': ['Reopened'],
};

router.put('/tickets/:id', async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  const { ownerId, currentStatus, itPriority, version } = req.body;

  if (isNaN(ticketId)) {
    return res.status(400).json({ error: 'Invalid ticket ID' });
  }

  try {
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, email: true } },
        requester: { select: { id: true, name: true, email: true } }
      }
    });

    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // 1. Optimistic Concurrency Control
    if (version !== undefined && version !== null) {
      const parsedVersion = parseInt(version, 10);
      if (parsedVersion !== existingTicket.version) {
        return res.status(409).json({
          error: 'Conflict: This ticket has been modified by another user. Please refresh and try again.',
          currentVersion: existingTicket.version
        });
      }
    }

    // 2. Status Transition Matrix Enforcement
    if (currentStatus !== undefined && currentStatus !== existingTicket.currentStatus) {
      const allowed = PERMITTED_STATUS_TRANSITIONS[existingTicket.currentStatus] || [];
      if (!allowed.includes(String(currentStatus))) {
        return res.status(400).json({
          error: `Invalid status transition from "${existingTicket.currentStatus}" to "${currentStatus}". Permitted transitions: ${allowed.join(', ') || 'None'}.`
        });
      }
    }

    const dataToUpdate: Prisma.TicketUpdateInput = {
      version: { increment: 1 }
    };

    if (ownerId !== undefined) {
      dataToUpdate.owner = ownerId === null ? { disconnect: true } : { connect: { id: parseInt(ownerId) } };
    }
    if (currentStatus !== undefined) {
      dataToUpdate.currentStatus = String(currentStatus);
    }
    if (itPriority !== undefined) {
      dataToUpdate.itPriority = itPriority as any;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: dataToUpdate,
      include: {
        category: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, email: true } },
        requester: { select: { id: true, name: true, email: true } },
        actions: {
          include: {
            performedBy: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { actionDate: 'asc' }
        }
      }
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Failed to update ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

router.get('/tickets/:id', async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: { select: { id: true, name: true } },
        relatedSystem: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, email: true } },
        requester: { select: { id: true, name: true, email: true } },
        attachments: {
          orderBy: { createdAt: 'desc' }
        },
        actions: {
          include: {
            performedBy: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { actionDate: 'asc' }
        }
      }
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
});

router.get('/staff-members', async (req: Request, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: 'IT_STAFF', isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

export default router;
