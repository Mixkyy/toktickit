import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/auth.js';

const prisma = new PrismaClient();

describe('Ticket Workflow and Optimistic Concurrency API (Lab 4 / Issue #50)', () => {
  let staffToken: string;
  let requesterToken: string;

  let staffId: number;
  let requesterId: number;

  let workflowTicketId: number;
  let categoryId: number;
  let relatedSystemId: number;

  beforeAll(async () => {
    // 1. Create test category & system
    const category = await prisma.category.create({ data: { name: 'WorkflowTestCat' } });
    const relatedSystem = await prisma.relatedSystem.create({ data: { name: 'WorkflowTestSys' } });
    categoryId = category.id;
    relatedSystemId = relatedSystem.id;

    // 2. Create users
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const staff = await prisma.user.create({
      data: { name: 'Workflow Staff', email: 'wf_staff@test.com', passwordHash: hash, role: 'IT_STAFF' },
    });
    staffId = staff.id;

    const req = await prisma.user.create({
      data: { name: 'Workflow Requester', email: 'wf_req@test.com', passwordHash: hash, role: 'REQUESTER' },
    });
    requesterId = req.id;

    staffToken = generateToken({ id: staff.id, role: staff.role });
    requesterToken = generateToken({ id: req.id, role: req.role });

    // 3. Create test ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-WF-001',
        summary: 'Workflow Lifecycle Ticket',
        description: 'Testing permitted transitions and concurrency',
        requestedPriority: 'HIGH',
        categoryId: category.id,
        relatedSystemId: relatedSystem.id,
        requesterId: req.id,
        ownerId: staff.id,
        currentStatus: 'New',
        version: 1,
      },
    });
    workflowTicketId = ticket.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { id: workflowTicketId } });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.relatedSystem.deleteMany({ where: { id: relatedSystemId } });
    await prisma.user.deleteMany({
      where: { email: { in: ['wf_staff@test.com', 'wf_req@test.com'] } },
    });
    await prisma.$disconnect();
  });

  it('allows valid status transition: New -> In Progress and increments version', async () => {
    const res = await request(app)
      .put(`/api/staff/tickets/${workflowTicketId}`)
      .set('Cookie', `token=${staffToken}`)
      .send({
        currentStatus: 'In Progress',
        version: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe('In Progress');
    expect(res.body.version).toBe(2);
  });

  it('rejects invalid status transition: In Progress -> Closed directly with 400 Bad Request', async () => {
    const res = await request(app)
      .put(`/api/staff/tickets/${workflowTicketId}`)
      .set('Cookie', `token=${staffToken}`)
      .send({
        currentStatus: 'Closed',
        version: 2,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid status transition/i);
  });

  it('allows valid status transition: In Progress -> Resolved', async () => {
    const res = await request(app)
      .put(`/api/staff/tickets/${workflowTicketId}`)
      .set('Cookie', `token=${staffToken}`)
      .send({
        currentStatus: 'Resolved',
        version: 2,
      });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe('Resolved');
    expect(res.body.version).toBe(3);
  });

  it('allows valid status transition: Resolved -> Closed', async () => {
    const res = await request(app)
      .put(`/api/staff/tickets/${workflowTicketId}`)
      .set('Cookie', `token=${staffToken}`)
      .send({
        currentStatus: 'Closed',
        version: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe('Closed');
    expect(res.body.version).toBe(4);
  });

  it('allows valid status transition: Closed -> Reopened', async () => {
    const res = await request(app)
      .put(`/api/staff/tickets/${workflowTicketId}`)
      .set('Cookie', `token=${staffToken}`)
      .send({
        currentStatus: 'Reopened',
        version: 4,
      });

    expect(res.status).toBe(200);
    expect(res.body.currentStatus).toBe('Reopened');
    expect(res.body.version).toBe(5);
  });

  it('API-05 (FR-05, AC-03): Rejects stale version update with 409 Conflict', async () => {
    // Current version in DB is 5. Submitting with stale version 2 must trigger 409 Conflict.
    const res = await request(app)
      .put(`/api/staff/tickets/${workflowTicketId}`)
      .set('Cookie', `token=${staffToken}`)
      .send({
        currentStatus: 'In Progress',
        version: 2, // Stale!
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/conflict/i);
    expect(res.body.currentVersion).toBe(5);
  });

  it('FR-04 / BR-04: Requester resolution gate prevents Requester from setting status to Resolved or Closed', async () => {
    const res = await request(app)
      .put(`/api/tickets/${workflowTicketId}`)
      .set('Cookie', `token=${requesterToken}`)
      .send({
        currentStatus: 'Resolved',
        version: 5,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/requesters cannot formally resolve or close/i);
  });
});
