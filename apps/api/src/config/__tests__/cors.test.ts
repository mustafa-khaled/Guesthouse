import { describe, it, expect } from 'vitest';
import { parseCorsOrigins } from '../../config/cors';

describe('parseCorsOrigins', () => {
  it('parses comma-separated origins', () => {
    const origins = parseCorsOrigins(
      'https://app.example.com, https://staging.example.com',
      'https://app.example.com',
    );

    expect(origins).toEqual(['https://app.example.com', 'https://staging.example.com']);
  });

  it('falls back to frontend URL when CORS_ORIGINS is empty', () => {
    const origins = parseCorsOrigins(undefined, 'http://localhost:3001');
    expect(origins).toEqual(['http://localhost:3001']);
  });
});
