import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../utils/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all dashboard routes
router.use(authenticateToken);

/**
 * GET /api/dashboards/requester
 * Returns metrics and recent tickets isolated to the authenticated requester.
 * Authorization: REQUESTER
 */
router.get('/requester', requireRole(['REQUESTER']), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const requesterId = user.id;

  try {
    const [openTickets, inProgress, resolved, closed, recentTickets] = await Promise.all([
      prisma.ticket.count({
        where: {
          requesterId,
          currentStatus: { in: ['Open', 'New'] },
        },
      }),
      prisma.ticket.count({
        where: {
          requesterId,
          currentStatus: 'In Progress',
        },
      }),
      prisma.ticket.count({
        where: {
          requesterId,
          currentStatus: 'Resolved',
        },
      }),
      prisma.ticket.count({
        where: {
          requesterId,
          currentStatus: 'Closed',
        },
      }),
      prisma.ticket.findMany({
        where: { requesterId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    res.status(200).json({
      metrics: {
        openTickets,
        inProgress,
        resolved,
        closed,
      },
      recentTickets,
    });
  } catch (error) {
    console.error('Failed to fetch requester dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch requester dashboard' });
  }
});

/**
 * GET /api/dashboards/staff
 * Returns system-wide queue metrics, user-assigned counts, and recent tickets.
 * Authorization: IT_STAFF, ADMINISTRATOR
 */
router.get('/staff', requireRole(['IT_STAFF', 'ADMINISTRATOR']), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const staffId = user.id;

  try {
    const [newCount, openCount, inProgressCount, waitingCount, myAssignedCount, totalUsers, recentTickets] =
      await Promise.all([
        prisma.ticket.count({
          where: { currentStatus: 'New' },
        }),
        prisma.ticket.count({
          where: { currentStatus: 'Open' },
        }),
        prisma.ticket.count({
          where: { currentStatus: 'In Progress' },
        }),
        prisma.ticket.count({
          where: { currentStatus: 'Waiting for Requester' },
        }),
        prisma.ticket.count({
          where: { ownerId: staffId },
        }),
        prisma.user.count(),
        prisma.ticket.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            requester: { select: { id: true, name: true, email: true } },
            owner: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true } },
            relatedSystem: { select: { id: true, name: true } },
          },
        }),
      ]);

    const metrics: Record<string, number> = {
      new: newCount,
      open: openCount,
      inProgress: inProgressCount,
      waitingForRequester: waitingCount,
      myAssigned: myAssignedCount,
    };

    if (user.role === 'ADMINISTRATOR') {
      metrics.userCount = totalUsers;
    }

    res.status(200).json({
      metrics,
      recentTickets,
    });
  } catch (error) {
    console.error('Failed to fetch staff dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch staff dashboard' });
  }
});

export default router;
