import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/auth.js';

const prisma = new PrismaClient();

describe('Actions Taken Foundation API (Lab 4 / Issue #48)', () => {
  let staff1Token: string;
  let staff2Token: string;
  let requesterToken: string;
  let otherRequesterToken: string;

  let staff1Id: number;
  let staff2Id: number;
  let req1Id: number;
  let req2Id: number;

  let testTicketId: number;
  let otherTicketId: number;
  let categoryId: number;
  let relatedSystemId: number;

  beforeAll(async () => {
    // 1. Create categories and related systems
    const category = await prisma.category.create({ data: { name: 'ActionTestCat' } });
    const relatedSystem = await prisma.relatedSystem.create({ data: { name: 'ActionTestSys' } });
    categoryId = category.id;
    relatedSystemId = relatedSystem.id;

    // 2. Create test users
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const staff1 = await prisma.user.create({
      data: { name: 'Staff Member 1', email: 'staff1_act@test.com', passwordHash: hash, role: 'IT_STAFF' },
    });
    staff1Id = staff1.id;

    const staff2 = await prisma.user.create({
      data: { name: 'Staff Member 2', email: 'staff2_act@test.com', passwordHash: hash, role: 'IT_STAFF' },
    });
    staff2Id = staff2.id;

    const req1 = await prisma.user.create({
      data: { name: 'Requester 1', email: 'req1_act@test.com', passwordHash: hash, role: 'REQUESTER' },
    });
    req1Id = req1.id;

    const req2 = await prisma.user.create({
      data: { name: 'Requester 2', email: 'req2_act@test.com', passwordHash: hash, role: 'REQUESTER' },
    });
    req2Id = req2.id;

    staff1Token = generateToken({ id: staff1.id, role: staff1.role });
    staff2Token = generateToken({ id: staff2.id, role: staff2.role });
    requesterToken = generateToken({ id: req1.id, role: req1.role });
    otherRequesterToken = generateToken({ id: req2.id, role: req2.role });

    // 3. Create test tickets
    const ticket1 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-TEST-ACT-001',
        summary: 'Actions Test Ticket 1',
        description: 'Test ticket for actions taken',
        requestedPriority: 'HIGH',
        categoryId: category.id,
        relatedSystemId: relatedSystem.id,
        requesterId: req1.id,
        ownerId: staff1.id,
        currentStatus: 'In Progress',
        version: 1,
      },
    });
    testTicketId = ticket1.id;

    const ticket2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-TEST-ACT-002',
        summary: 'Other Requester Ticket',
        description: 'Other requester ticket',
        requestedPriority: 'LOW',
        categoryId: category.id,
        relatedSystemId: relatedSystem.id,
        requesterId: req2.id,
        currentStatus: 'New',
        version: 1,
      },
    });
    otherTicketId = ticket2.id;
  });

  afterAll(async () => {
    await prisma.actionTaken.deleteMany({
      where: { ticketId: { in: [testTicketId, otherTicketId] } },
    });
    await prisma.ticket.deleteMany({
      where: { id: { in: [testTicketId, otherTicketId] } },
    });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.relatedSystem.deleteMany({ where: { id: relatedSystemId } });
    await prisma.user.deleteMany({
      where: { email: { in: ['staff1_act@test.com', 'staff2_act@test.com', 'req1_act@test.com', 'req2_act@test.com'] } },
    });
    await prisma.$disconnect();
  });

  it('API-03 (AC-01): Create a valid Actions Taken as IT Staff', async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${staff1Token}`)
      .send({
        description: 'Replaced thermal paste and cleaned cooling fan.',
        result: 'Temperature dropped by 18 degrees Celsius.',
        followUpRequired: false,
        attachmentNotes: 'See fan_clean.jpg',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.ticketId).toBe(testTicketId);
    expect(res.body.description).toBe('Replaced thermal paste and cleaned cooling fan.');
    expect(res.body.result).toBe('Temperature dropped by 18 degrees Celsius.');
    expect(res.body.performedById).toBe(staff1Id);
    expect(res.body.performedBy.name).toBe('Staff Member 1');
    expect(res.body.followUpRequired).toBe(false);
    expect(res.body.followUpNote).toBeNull();
    expect(res.body.attachmentNotes).toBe('See fan_clean.jpg');
  });

  it('API-04 (AC-04): Create Action Taken with followUpRequired=true but missing followUpNote returns 400', async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${staff1Token}`)
      .send({
        description: 'Diagnosed motherboard circuit.',
        result: 'Capacitor swollen.',
        followUpRequired: true,
        followUpNote: '   ', // whitespace only
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/follow-up note is required/i);
  });

  it('Create Action Taken rejects missing description or result', async () => {
    const res1 = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${staff1Token}`)
      .send({
        description: '',
        result: 'Success',
      });
    expect(res1.status).toBe(400);

    const res2 = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${staff1Token}`)
      .send({
        description: 'Valid description',
        result: '',
      });
    expect(res2.status).toBe(400);
  });

  it('FR-02: Requester cannot create an Action Taken (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${requesterToken}`)
      .send({
        description: 'Requester trying to record action',
        result: 'Should be rejected',
        followUpRequired: false,
      });

    expect(res.status).toBe(403);
  });

  it('BR-02: Different IT Staff member can record an Action Taken on ticket owned by another staff', async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${staff2Token}`)
      .send({
        description: 'Secondary review performed by staff 2.',
        result: 'All hardware diagnostics passed.',
        followUpRequired: true,
        followUpNote: 'Schedule return to user.',
      });

    expect(res.status).toBe(201);
    expect(res.body.performedById).toBe(staff2Id);
    expect(res.body.performedBy.name).toBe('Staff Member 2');
    expect(res.body.followUpRequired).toBe(true);
    expect(res.body.followUpNote).toBe('Schedule return to user.');
  });

  it('GET /api/tickets/:id/actions: Requester can view Actions Taken for owned ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${requesterToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0].description).toBeDefined();
    expect(res.body[0].performedBy).toBeDefined();
  });

  it('GET /api/tickets/:id/actions: Requester is forbidden from viewing Actions Taken for others ticket', async () => {
    const res = await request(app)
      .get(`/api/tickets/${otherTicketId}/actions`)
      .set('Cookie', `token=${requesterToken}`);

    expect(res.status).toBe(403);
  });

  it('PUT /api/tickets/:id/actions/:actionId: IT Staff can update an existing Action Taken', async () => {
    // First retrieve actions
    const getRes = await request(app)
      .get(`/api/tickets/${testTicketId}/actions`)
      .set('Cookie', `token=${staff1Token}`);

    const targetAction = getRes.body[0];
    expect(targetAction).toBeDefined();

    const updateRes = await request(app)
      .put(`/api/tickets/${testTicketId}/actions/${targetAction.id}`)
      .set('Cookie', `token=${staff1Token}`)
      .send({
        result: 'Updated result: thermal paste replaced and burned in for 2 hours.',
        followUpRequired: false,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.id).toBe(targetAction.id);
    expect(updateRes.body.result).toBe('Updated result: thermal paste replaced and burned in for 2 hours.');
    expect(updateRes.body.followUpRequired).toBe(false);
  });

  it('Unauthenticated requests are rejected with 401', async () => {
    const res = await request(app).get(`/api/tickets/${testTicketId}/actions`);
    expect(res.status).toBe(401);
  });
});
