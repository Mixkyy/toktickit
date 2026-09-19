import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/utils/auth.js';

const prisma = new PrismaClient();

describe('Administrator User Management API (Issue #39)', () => {
  let adminToken: string;
  let adminId: number;
  let requesterToken: string;
  let testUserId: number;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);

    const admin = await prisma.user.create({
      data: { name: 'Admin Master', email: 'adminmaster@test.com', passwordHash: hash, role: 'ADMINISTRATOR' }
    });
    adminId = admin.id;

    const reqUser = await prisma.user.create({
      data: { name: 'Req User', email: 'requseradmin@test.com', passwordHash: hash, role: 'REQUESTER' }
    });

    adminToken = generateToken({ id: admin.id, role: admin.role });
    requesterToken = generateToken({ id: reqUser.id, role: reqUser.role });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['adminmaster@test.com', 'requseradmin@test.com', 'newstaff@test.com', 'dupcheck@test.com']
        }
      }
    });
    await prisma.$disconnect();
  });

  it('GET /api/users denies access to non-admins', async () => {
    const res = await request(app).get('/api/users').set('Cookie', `token=${requesterToken}`);
    expect(res.status).toBe(403);
  });

  it('POST /api/users creates a new user and forces password change', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', `token=${adminToken}`)
      .send({
        name: 'New Staff',
        email: 'newstaff@test.com',
        role: 'IT_STAFF',
        initialPassword: 'temp_password',
        isActive: true
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Staff');
    expect(res.body.requiresPasswordChange).toBe(true); // BR-02
    testUserId = res.body.id;
  });

  it('POST /api/users prevents duplicate emails', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Cookie', `token=${adminToken}`)
      .send({
        name: 'Dup Check',
        email: 'newstaff@test.com', // same as above
        role: 'REQUESTER',
        initialPassword: 'temp_password',
        isActive: true
      });

    expect(res.status).toBe(409);
  });

  it('PUT /api/users/:id prevents Admin from deactivating themselves', async () => {
    const res = await request(app)
      .put(`/api/users/${adminId}`)
      .set('Cookie', `token=${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Cannot deactivate your own account');
  });

  it('PUT /api/users/:id updates an existing user', async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Cookie', `token=${adminToken}`)
      .send({ role: 'ADMINISTRATOR' }); // Promote them to Admin

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMINISTRATOR');
  });
});
