import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/auth.js';

const prisma = new PrismaClient();

describe('Comments API (Issue #38)', () => {
  let staffToken: string;
  let requesterToken: string;
  let testTicketId: number;

  beforeAll(async () => {
    const category = await prisma.category.create({ data: { name: 'Comments Test Cat' } });
    const relatedSystem = await prisma.relatedSystem.create({ data: { name: 'Comments Test Sys' } });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const staff = await prisma.user.create({
      data: { name: 'Staff User', email: 'staffcomments@test.com', passwordHash: hash, role: 'IT_STAFF' }
    });

    const req = await prisma.user.create({
      data: { name: 'Req User', email: 'reqcomments@test.com', passwordHash: hash, role: 'REQUESTER' }
    });

    staffToken = generateToken({ id: staff.id, role: staff.role });
    requesterToken = generateToken({ id: req.id, role: req.role });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TEST-200',
        summary: 'Comment Test Ticket',
        description: 'Test',
        requestedPriority: 'HIGH',
        categoryId: category.id,
        relatedSystemId: relatedSystem.id,
        requesterId: req.id
      }
    });
    testTicketId = ticket.id;

    // Seed an internal note and a public comment
    await prisma.comment.create({
      data: { content: 'Internal note', isInternal: true, authorId: staff.id, ticketId: testTicketId }
    });
    await prisma.comment.create({
      data: { content: 'Public note', isInternal: false, authorId: req.id, ticketId: testTicketId }
    });
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({ where: { ticketId: testTicketId } });
    await prisma.ticket.deleteMany({ where: { id: testTicketId } });
    await prisma.category.deleteMany({ where: { name: 'Comments Test Cat' } });
    await prisma.relatedSystem.deleteMany({ where: { name: 'Comments Test Sys' } });
    await prisma.user.deleteMany({ where: { email: { in: ['staffcomments@test.com', 'reqcomments@test.com'] } } });
    await prisma.$disconnect();
  });

  it('GET /api/tickets/:id/comments hides internal notes from REQUESTER', async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicketId}/comments`)
      .set('Cookie', `token=${requesterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].isInternal).toBe(false);
  });

  it('GET /api/tickets/:id/comments shows internal notes to IT_STAFF', async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicketId}/comments`)
      .set('Cookie', `token=${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('POST /api/tickets/:id/comments prevents REQUESTER from creating internal notes', async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/comments`)
      .set('Cookie', `token=${requesterToken}`)
      .send({ content: 'I try to be sneaky', isInternal: true });

    expect(res.status).toBe(201);
    // It creates it, but safely forces isInternal to false
    expect(res.body.isInternal).toBe(false);
  });
});
