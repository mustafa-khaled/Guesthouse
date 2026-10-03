import { describe, it, expect } from 'vitest';
import { propertyQueries } from '../queries';

describe('propertyQueries', () => {
  it('all uses properties query key', () => {
    expect(propertyQueries.all().queryKey).toEqual(['properties']);
  });

  it('bySlug includes slug in query key', () => {
    expect(propertyQueries.bySlug('serene-stays').queryKey).toEqual([
      'properties',
      'slug',
      'serene-stays',
    ]);
  });

  it('search is disabled for short queries', () => {
    expect(propertyQueries.search('a').enabled).toBe(false);
  });

  it('search is enabled for queries with 2+ characters', () => {
    expect(propertyQueries.search('serene').enabled).toBe(true);
  });
});
