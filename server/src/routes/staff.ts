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

export default router;
