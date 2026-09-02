import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import path from 'path';
import fs from 'fs';
import { getPrisma } from '../../src/prisma.js';

describe('Attachments API', () => {
  let ticketId: number;
  let attachmentId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-TEST-ATTACHMENTS',
        requesterId: 1, // Assumes requester 1 exists from seed
        categoryId: 1,
        relatedSystemId: 1,
        summary: 'Test ticket for attachments',
        description: 'Testing attachments upload and remove',
        requestedPriority: 'MEDIUM',
      }
    });
    ticketId = ticket.id;

    // Create a dummy file for testing upload
    fs.writeFileSync(path.join(process.cwd(), 'test-image.jpg'), 'dummy content');
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.attachment.deleteMany({ where: { ticketId } });
    await prisma.ticket.delete({ where: { id: ticketId } });
    if (fs.existsSync(path.join(process.cwd(), 'test-image.jpg'))) {
      fs.unlinkSync(path.join(process.cwd(), 'test-image.jpg'));
    }
  });

  it('uploads an attachment successfully', async () => {
    const testFilePath = path.join(process.cwd(), 'test-image.jpg');
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', '1')
      .attach('attachment', testFilePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    attachmentId = res.body.id;
  });

  it('rejects upload for a non-owner requester', async () => {
    const testFilePath = path.join(process.cwd(), 'test-image.jpg');
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', '2') // Different requester
      .attach('attachment', testFilePath);

    expect(res.status).toBe(403);
  });

  it('rejects upload of invalid file type', async () => {
    // Create a dummy txt file
    fs.writeFileSync(path.join(process.cwd(), 'test.txt'), 'dummy txt');
    
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('X-Requester-Id', '1')
      .attach('attachment', path.join(process.cwd(), 'test.txt'));

    expect(res.status).toBe(500); // Multer throws an error which our catch block handles

    fs.unlinkSync(path.join(process.cwd(), 'test.txt'));
  });

  it('soft-removes an attachment', async () => {
    const res = await request(app)
      .delete(`/api/attachments/${attachmentId}`)
      .set('X-Requester-Id', '1')
      .send({ reason: 'Uploaded wrong file' });

    expect(res.status).toBe(200);

    const prisma = getPrisma();
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    expect(attachment?.isRemoved).toBe(true);
    expect(attachment?.removedReason).toBe('Uploaded wrong file');
  });

  it('rejects soft-remove if reason is missing', async () => {
    const res = await request(app)
      .delete(`/api/attachments/${attachmentId}`)
      .set('X-Requester-Id', '1')
      .send({});

    expect(res.status).toBe(400);
  });
});
