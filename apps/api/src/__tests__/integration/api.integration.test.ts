import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('API integration', () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET =
      process.env.JWT_ACCESS_SECRET || 'test-access-secret-at-least-32-characters';
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-characters';
    process.env.MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/guesthouse_test';
  });

  it('returns liveness status', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'alive');
  });

  it('returns 404 for unknown top-level routes', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
  });

  it('rejects unauthenticated user profile access', async () => {
    const res = await request(app).get('/user/me');
    expect(res.status).toBe(401);
  });
});
