import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/auth.js';

const prisma = new PrismaClient();

describe('IT Staff / Admin Dashboard API (Lab 4 / Issue #51 / API-07 / FR-07)', () => {
  let staff1Token: string;
  let staff2Token: string;
  let adminToken: string;
  let requesterToken: string;

  let staff1Id: number;
  let staff2Id: number;
  let adminId: number;
  let requesterId: number;
  let categoryId: number;
  let relatedSystemId: number;
  const createdTicketIds: number[] = [];

  beforeAll(async () => {
    // 1. Create categories and related systems
    const category = await prisma.category.create({ data: { name: 'StaffDashCategory' } });
    const relatedSystem = await prisma.relatedSystem.create({ data: { name: 'StaffDashSystem' } });
    categoryId = category.id;
    relatedSystemId = relatedSystem.id;

    // 2. Create users
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const staff1 = await prisma.user.create({
      data: { name: 'Staff One', email: 'staff1_dash@test.com', passwordHash: hash, role: 'IT_STAFF' },
    });
    staff1Id = staff1.id;

    const staff2 = await prisma.user.create({
      data: { name: 'Staff Two', email: 'staff2_dash@test.com', passwordHash: hash, role: 'IT_STAFF' },
    });
    staff2Id = staff2.id;

    const admin = await prisma.user.create({
      data: { name: 'Super Admin', email: 'admin_dash@test.com', passwordHash: hash, role: 'ADMINISTRATOR' },
    });
    adminId = admin.id;

    const requester = await prisma.user.create({
      data: { name: 'Regular Requester', email: 'requester_dash@test.com', passwordHash: hash, role: 'REQUESTER' },
    });
    requesterId = requester.id;

    staff1Token = generateToken({ id: staff1.id, role: staff1.role });
    staff2Token = generateToken({ id: staff2.id, role: staff2.role });
    adminToken = generateToken({ id: admin.id, role: admin.role });
    requesterToken = generateToken({ id: requester.id, role: requester.role });

    // 3. Create tickets with various statuses and assignments
    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-STF-001',
        summary: 'New Unassigned Ticket',
        description: 'New ticket without owner',
        requestedPriority: 'HIGH',
        categoryId,
        relatedSystemId,
        requesterId,
        currentStatus: 'New',
      },
    });

    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-STF-002',
        summary: 'Open Ticket Assigned to Staff 1',
        description: 'Open ticket',
        requestedPriority: 'MEDIUM',
        categoryId,
        relatedSystemId,
        requesterId,
        ownerId: staff1Id,
        currentStatus: 'Open',
      },
    });

    const t3 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-STF-003',
        summary: 'In Progress Assigned to Staff 1',
        description: 'In progress ticket',
        requestedPriority: 'CRITICAL',
        categoryId,
        relatedSystemId,
        requesterId,
        ownerId: staff1Id,
        currentStatus: 'In Progress',
      },
    });

    const t4 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-STF-004',
        summary: 'Waiting for Requester Assigned to Staff 2',
        description: 'Waiting ticket',
        requestedPriority: 'LOW',
        categoryId,
        relatedSystemId,
        requesterId,
        ownerId: staff2Id,
        currentStatus: 'Waiting for Requester',
      },
    });

    createdTicketIds.push(t1.id, t2.id, t3.id, t4.id);
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: { id: { in: createdTicketIds } },
    });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.relatedSystem.deleteMany({ where: { id: relatedSystemId } });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['staff1_dash@test.com', 'staff2_dash@test.com', 'admin_dash@test.com', 'requester_dash@test.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  it('API-07 (FR-07): Returns system-wide queue metrics and staff-specific assigned counts', async () => {
    const res = await request(app)
      .get('/api/dashboards/staff')
      .set('Authorization', `Bearer ${staff1Token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('metrics');
    expect(res.body).toHaveProperty('recentTickets');

    // System-wide counts should be >= our created counts
    expect(res.body.metrics.new).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics.open).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics.inProgress).toBeGreaterThanOrEqual(1);
    expect(res.body.metrics.waitingForRequester).toBeGreaterThanOrEqual(1);

    // Staff 1 is assigned t2 and t3
    expect(res.body.metrics.myAssigned).toBeGreaterThanOrEqual(2);

    expect(Array.isArray(res.body.recentTickets)).toBe(true);
    expect(res.body.recentTickets.length).toBeLessThanOrEqual(5);
  });

  it('API-07 (FR-07): Verifies myAssigned counts are specific to the calling staff member', async () => {
    const res = await request(app)
      .get('/api/dashboards/staff')
      .set('Authorization', `Bearer ${staff2Token}`);

    expect(res.status).toBe(200);
    // Staff 2 is only assigned t4
    expect(res.body.metrics.myAssigned).toBe(1);
  });

  it('Includes userCount metric when requested by an Administrator', async () => {
    const res = await request(app)
      .get('/api/dashboards/staff')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toHaveProperty('userCount');
    expect(typeof res.body.metrics.userCount).toBe('number');
    expect(res.body.metrics.userCount).toBeGreaterThanOrEqual(4);
  });

  it('Rejects unauthenticated request with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/dashboards/staff');
    expect(res.status).toBe(401);
  });

  it('Rejects REQUESTER role with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/dashboards/staff')
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(res.status).toBe(403);
  });
});
