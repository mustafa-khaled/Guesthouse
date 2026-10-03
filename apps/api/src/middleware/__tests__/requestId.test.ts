import { describe, it, expect } from 'vitest';
import { requestIdMiddleware } from '../requestId';

describe('requestIdMiddleware', () => {
  it('sets X-Request-Id response header', () => {
    const req = {
      header: () => undefined,
    } as any;

    const headers: Record<string, string> = {};
    const res = {
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
    } as any;

    requestIdMiddleware(req, res, () => undefined);

    expect(headers['X-Request-Id']).toBeTruthy();
    expect(req.requestId).toBe(headers['X-Request-Id']);
  });

  it('reuses incoming X-Request-Id header', () => {
    const req = {
      header: (name: string) => (name.toLowerCase() === 'x-request-id' ? 'incoming-id' : undefined),
    } as any;

    const headers: Record<string, string> = {};
    const res = {
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
    } as any;

    requestIdMiddleware(req, res, () => undefined);

    expect(headers['X-Request-Id']).toBe('incoming-id');
    expect(req.requestId).toBe('incoming-id');
  });
});
