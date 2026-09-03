import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Ticket Creation APIs', () => {
  describe('GET /api/related-systems', () => {
    it('returns a 200 status and an array of systems', async () => {
      const res = await request(app).get('/api/related-systems');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });
  });

  describe('POST /api/tickets', () => {
    it('returns 401 if X-Requester-Id is missing', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({
          categoryId: 1,
          relatedSystemId: 1,
          summary: 'Test ticket',
          description: 'Details',
          requestedPriority: 'MEDIUM'
        });
      expect(res.status).toBe(401);
    });

    it('returns 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('X-Requester-Id', '1')
        .send({
          categoryId: 1,
          summary: 'Test ticket'
        });
      expect(res.status).toBe(400);
    });

    it('returns 201 and creates a ticket', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('X-Requester-Id', '1')
        .send({
          categoryId: 1,
          relatedSystemId: 1,
          summary: 'My mouse is broken',
          description: 'It double clicks on single click',
          requestedPriority: 'HIGH'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('ticketNumber');
      expect(res.body.summary).toBe('My mouse is broken');
      expect(res.body.currentStatus).toBe('New');
    });
  });
});
