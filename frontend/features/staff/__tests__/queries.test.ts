import { describe, it, expect } from 'vitest';
import { frontDeskQueries, housekeepingQueries, roomQueries } from '../queries';

describe('staffQueries', () => {
  it('frontDesk arrivals uses front-desk query key prefix', () => {
    expect(frontDeskQueries.arrivals('2026-07-09').queryKey).toEqual([
      'front-desk',
      'arrivals',
      '2026-07-09',
    ]);
  });

  it('housekeeping tasks includes params in query key', () => {
    const params = { status: 'pending' };
    expect(housekeepingQueries.tasks(params).queryKey).toEqual(['housekeeping', 'tasks', params]);
  });

  it('room byProperty is disabled without propertyId', () => {
    expect(roomQueries.byProperty('').enabled).toBe(false);
  });
});
