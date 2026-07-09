import { describe, it, expect } from 'vitest';
import { adminQueries } from '../queries';

describe('adminQueries', () => {
  it('properties uses admin query key prefix', () => {
    expect(adminQueries.properties().queryKey).toEqual(['admin', 'properties']);
  });

  it('auditLogs includes params in query key', () => {
    const params = { page: '1', limit: '20' };
    expect(adminQueries.auditLogs(params).queryKey).toEqual(['admin', 'audit-logs', params]);
  });

  it('report includes type and params in query key', () => {
    const params = { from: '2026-01-01' };
    expect(adminQueries.report('revenue', params).queryKey).toEqual([
      'admin',
      'reports',
      'revenue',
      params,
    ]);
  });
});
