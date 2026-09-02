import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('GET /api/requesters', () => {
  it('returns a 200 status and an array of active requesters', async () => {
    const res = await request(app).get('/api/requesters');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // We expect 4 active requesters based on our seed data
    expect(res.body.length).toBeGreaterThanOrEqual(4);
    
    // Verify structure
    const first = res.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('email');
    
    // We should NOT see the inactive user
    const inactiveUser = res.body.find((r: any) => r.name === 'Inactive User');
    expect(inactiveUser).toBeUndefined();
  });
});
