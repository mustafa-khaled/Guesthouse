import { describe, it, expect } from 'vitest';
import { bookingQueries } from '../queries';

describe('bookingQueries', () => {
  it('mine uses bookings query key prefix', () => {
    expect(bookingQueries.mine().queryKey).toEqual(['bookings', 'mine']);
  });

  it('detail includes booking id in query key', () => {
    expect(bookingQueries.detail('abc123').queryKey).toEqual(['bookings', 'detail', 'abc123']);
  });

  it('availability is disabled without required params', () => {
    const opts = bookingQueries.availability({});
    expect(opts.enabled).toBe(false);
  });

  it('availability is enabled with required params', () => {
    const opts = bookingQueries.availability({
      propertyId: 'p1',
      checkIn: '2026-07-01',
      checkOut: '2026-07-05',
    });
    expect(opts.enabled).toBe(true);
    expect(opts.queryKey).toEqual([
      'availability',
      { propertyId: 'p1', checkIn: '2026-07-01', checkOut: '2026-07-05' },
    ]);
  });
});
