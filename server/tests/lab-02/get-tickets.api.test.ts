import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('GET /api/tickets', () => {
  it('returns 401 if X-Requester-Id is missing', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
  });

  it('returns tickets for a valid requester', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('X-Requester-Id', '1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters tickets by status', async () => {
    const res = await request(app)
      .get('/api/tickets?status=New')
      .set('X-Requester-Id', '1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const ticket of res.body) {
      expect(ticket.currentStatus).toBe('New');
    }
  });
});
