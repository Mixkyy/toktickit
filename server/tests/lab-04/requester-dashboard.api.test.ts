import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/auth.js';

const prisma = new PrismaClient();

describe('Requester Dashboard API (Lab 4 / Issue #51 / API-06 / AC-02)', () => {
  let requester1Token: string;
  let requester2Token: string;
  let staffToken: string;

  let req1Id: number;
  let req2Id: number;
  let staffId: number;
  let categoryId: number;
  let relatedSystemId: number;
  const createdTicketIds: number[] = [];

  beforeAll(async () => {
    // 1. Create categories and related systems
    const category = await prisma.category.create({ data: { name: 'ReqDashCategory' } });
    const relatedSystem = await prisma.relatedSystem.create({ data: { name: 'ReqDashSystem' } });
    categoryId = category.id;
    relatedSystemId = relatedSystem.id;

    // 2. Create users
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const req1 = await prisma.user.create({
      data: { name: 'Alice Requester', email: 'alice_req_dash@test.com', passwordHash: hash, role: 'REQUESTER' },
    });
    req1Id = req1.id;

    const req2 = await prisma.user.create({
      data: { name: 'Bob Requester', email: 'bob_req_dash@test.com', passwordHash: hash, role: 'REQUESTER' },
    });
    req2Id = req2.id;

    const staff = await prisma.user.create({
      data: { name: 'Charlie Staff', email: 'charlie_staff_dash@test.com', passwordHash: hash, role: 'IT_STAFF' },
    });
    staffId = staff.id;

    requester1Token = generateToken({ id: req1.id, role: req1.role });
    requester2Token = generateToken({ id: req2.id, role: req2.role });
    staffToken = generateToken({ id: staff.id, role: staff.role });

    // 3. Create tickets for Requester 1
    // 1 New, 1 Open (openTickets = 2), 1 In Progress, 1 Resolved, 2 Closed
    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-001',
        summary: 'Alice Ticket New',
        description: 'New ticket',
        requestedPriority: 'MEDIUM',
        categoryId,
        relatedSystemId,
        requesterId: req1Id,
        currentStatus: 'New',
      },
    });
    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-002',
        summary: 'Alice Ticket Open',
        description: 'Open ticket',
        requestedPriority: 'HIGH',
        categoryId,
        relatedSystemId,
        requesterId: req1Id,
        currentStatus: 'Open',
      },
    });
    const t3 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-003',
        summary: 'Alice Ticket In Progress',
        description: 'In progress ticket',
        requestedPriority: 'LOW',
        categoryId,
        relatedSystemId,
        requesterId: req1Id,
        currentStatus: 'In Progress',
      },
    });
    const t4 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-004',
        summary: 'Alice Ticket Resolved',
        description: 'Resolved ticket',
        requestedPriority: 'HIGH',
        categoryId,
        relatedSystemId,
        requesterId: req1Id,
        currentStatus: 'Resolved',
      },
    });
    const t5 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-005',
        summary: 'Alice Ticket Closed 1',
        description: 'Closed ticket 1',
        requestedPriority: 'LOW',
        categoryId,
        relatedSystemId,
        requesterId: req1Id,
        currentStatus: 'Closed',
      },
    });
    const t6 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-006',
        summary: 'Alice Ticket Closed 2',
        description: 'Closed ticket 2',
        requestedPriority: 'MEDIUM',
        categoryId,
        relatedSystemId,
        requesterId: req1Id,
        currentStatus: 'Closed',
      },
    });

    // 4. Create tickets for Requester 2 (isolation check)
    const t7 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-007',
        summary: 'Bob Ticket Open',
        description: 'Bob open ticket',
        requestedPriority: 'HIGH',
        categoryId,
        relatedSystemId,
        requesterId: req2Id,
        currentStatus: 'Open',
      },
    });
    const t8 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-REQ-008',
        summary: 'Bob Ticket In Progress',
        description: 'Bob in progress ticket',
        requestedPriority: 'CRITICAL',
        categoryId,
        relatedSystemId,
        requesterId: req2Id,
        currentStatus: 'In Progress',
      },
    });

    createdTicketIds.push(t1.id, t2.id, t3.id, t4.id, t5.id, t6.id, t7.id, t8.id);
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: { id: { in: createdTicketIds } },
    });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.relatedSystem.deleteMany({ where: { id: relatedSystemId } });
    await prisma.user.deleteMany({
      where: { email: { in: ['alice_req_dash@test.com', 'bob_req_dash@test.com', 'charlie_staff_dash@test.com'] } },
    });
    await prisma.$disconnect();
  });

  it('API-06 (AC-02): Returns accurate metrics and isolated tickets for authenticated requester', async () => {
    const res = await request(app)
      .get('/api/dashboards/requester')
      .set('Authorization', `Bearer ${requester1Token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('metrics');
    expect(res.body).toHaveProperty('recentTickets');

    // Requester 1: 1 New + 1 Open = 2 openTickets, 1 In Progress, 1 Resolved, 2 Closed
    expect(res.body.metrics.openTickets).toBe(2);
    expect(res.body.metrics.inProgress).toBe(1);
    expect(res.body.metrics.resolved).toBe(1);
    expect(res.body.metrics.closed).toBe(2);

    // Recent tickets should only contain Alice's tickets, up to 5
    expect(Array.isArray(res.body.recentTickets)).toBe(true);
    expect(res.body.recentTickets.length).toBe(5);
    res.body.recentTickets.forEach((ticket: any) => {
      expect(ticket.requesterId).toBe(req1Id);
    });
  });

  it('API-06 (AC-02): Verifies strict metrics isolation across different requesters', async () => {
    const res = await request(app)
      .get('/api/dashboards/requester')
      .set('Authorization', `Bearer ${requester2Token}`);

    expect(res.status).toBe(200);
    // Requester 2: 1 Open, 1 In Progress, 0 Resolved, 0 Closed
    expect(res.body.metrics.openTickets).toBe(1);
    expect(res.body.metrics.inProgress).toBe(1);
    expect(res.body.metrics.resolved).toBe(0);
    expect(res.body.metrics.closed).toBe(0);

    expect(res.body.recentTickets.length).toBe(2);
    res.body.recentTickets.forEach((ticket: any) => {
      expect(ticket.requesterId).toBe(req2Id);
    });
  });

  it('Rejects unauthenticated request with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/dashboards/requester');
    expect(res.status).toBe(401);
  });

  it('Rejects non-requester user (IT_STAFF) with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/dashboards/requester')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
  });
});
