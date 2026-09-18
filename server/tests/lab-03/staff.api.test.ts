import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/auth.js';

const prisma = new PrismaClient();

describe('Staff API (Issue #37)', () => {
  let staffToken: string;
  let requesterToken: string;
  let testCategoryId: number;

  beforeAll(async () => {
    // Create test category and tickets
    const category = await prisma.category.create({ data: { name: 'Staff API Test Cat' } });
    const relatedSystem = await prisma.relatedSystem.create({ data: { name: 'Staff API Test Sys' } });
    testCategoryId = category.id;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const staff = await prisma.user.create({
      data: { name: 'Staff User', email: 'stafftest@test.com', passwordHash: hash, role: 'IT_STAFF' }
    });

    const req = await prisma.user.create({
      data: { name: 'Req User', email: 'reqtest@test.com', passwordHash: hash, role: 'REQUESTER' }
    });

    staffToken = generateToken({ id: staff.id, role: staff.role });
    requesterToken = generateToken({ id: req.id, role: req.role });

    await prisma.ticket.create({
      data: {
        ticketNumber: 'TEST-100',
        summary: 'Network is down',
        description: 'No internet',
        requestedPriority: 'HIGH',
        categoryId: testCategoryId,
        relatedSystemId: relatedSystem.id,
        requesterId: req.id
      }
    });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { ticketNumber: 'TEST-100' } });
    await prisma.category.deleteMany({ where: { name: 'Staff API Test Cat' } });
    await prisma.relatedSystem.deleteMany({ where: { name: 'Staff API Test Sys' } });
    await prisma.user.deleteMany({ where: { email: { in: ['stafftest@test.com', 'reqtest@test.com'] } } });
    await prisma.$disconnect();
  });

  it('GET /api/staff/tickets denies access for REQUESTER role', async () => {
    const res = await request(app)
      .get('/api/staff/tickets')
      .set('Cookie', `token=${requesterToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/staff/tickets allows access for IT_STAFF role', async () => {
    const res = await request(app)
      .get('/api/staff/tickets')
      .set('Cookie', `token=${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/staff/tickets supports search filtering', async () => {
    const res = await request(app)
      .get('/api/staff/tickets?search=Network')
      .set('Cookie', `token=${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].summary).toContain('Network');
  });
});
