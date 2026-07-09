import { describe, it, expect } from 'vitest';
import { bookingMutations } from '../mutations';

describe('bookingMutations', () => {
  it('cancel mutation is configured', () => {
    const opts = bookingMutations.cancel();
    expect(opts.mutationFn).toBeTypeOf('function');
  });

  it('create mutation is configured', () => {
    const opts = bookingMutations.create();
    expect(opts.mutationFn).toBeTypeOf('function');
  });
});
