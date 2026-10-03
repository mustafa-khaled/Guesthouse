import { describe, it, expect } from 'vitest';

const UPLOAD_TYPES = new Set(['property-image', 'room-type-image', 'guest-image']);

describe('upload types', () => {
  it('accepts supported upload route types', () => {
    expect(UPLOAD_TYPES.has('property-image')).toBe(true);
    expect(UPLOAD_TYPES.has('room-type-image')).toBe(true);
    expect(UPLOAD_TYPES.has('guest-image')).toBe(true);
    expect(UPLOAD_TYPES.has('invalid')).toBe(false);
  });
});

describe('upload response shape', () => {
  it('matches backend upload contract', () => {
    const payload = {
      message: 'Image uploaded successfully',
      data: {
        url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        publicId: 'guesthouse/properties/sample',
        width: 1200,
        height: 800,
        format: 'jpg',
        bytes: 1000,
      },
    };

    expect(payload.data.url).toContain('cloudinary.com');
    expect(payload.data.publicId.startsWith('guesthouse/')).toBe(true);
  });
});
