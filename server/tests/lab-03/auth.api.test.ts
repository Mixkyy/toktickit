import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Auth API (Issue #36)', () => {
  let testUserEmail = 'testauth@example.com';
  let testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(testPassword, salt);
    
    await prisma.user.upsert({
      where: { email: testUserEmail },
      update: { passwordHash, requiresPasswordChange: true },
      create: {
        name: 'Test Auth User',
        email: testUserEmail,
        passwordHash,
        role: 'REQUESTER',
        isActive: true,
        requiresPasswordChange: true
      }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUserEmail } });
    await prisma.$disconnect();
  });

  it('API-01: Valid login returns user data and cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUserEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('email', testUserEmail);
    expect(res.body.user).toHaveProperty('role', 'REQUESTER');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/token=/);
  });

  it('API-02: Invalid login returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUserEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('API-03: Mandatory password change flag is returned', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUserEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.user.requiresPasswordChange).toBe(true);
  });

  it('Logout clears the cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/token=;/);
  });
});
