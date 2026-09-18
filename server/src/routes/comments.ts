import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken } from '../utils/auth.js';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

// Apply auth middleware
router.use(authenticateToken);

// GET /api/tickets/:id/comments
router.get('/', async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);

  if (isNaN(ticketId)) {
    return res.status(400).json({ error: 'Invalid ticket ID' });
  }

  const user = (req as any).user;
  
  const where: Prisma.CommentWhereInput = { ticketId };
  if (user.role === 'REQUESTER') {
    where.isInternal = false;
  }

  try {
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/tickets/:id/comments
router.post('/', async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  const { content, isInternal } = req.body;
  
  if (isNaN(ticketId)) {
    return res.status(400).json({ error: 'Invalid ticket ID' });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  const user = (req as any).user;

  // Prevent REQUESTER from creating internal notes
  const safeIsInternal = user.role === 'REQUESTER' ? false : !!isInternal;

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        isInternal: safeIsInternal,
        ticketId,
        authorId: user.id
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

export default router;
