import { describe, it, expect } from 'vitest';
import { uploadResultSchema } from '../upload.schema';

describe('uploadResultSchema', () => {
  it('validates a successful upload payload', () => {
    const result = uploadResultSchema.parse({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/guesthouse/properties/abc.jpg',
      publicId: 'guesthouse/properties/abc',
      width: 1920,
      height: 1080,
      format: 'jpg',
      bytes: 120000,
    });

    expect(result.publicId).toBe('guesthouse/properties/abc');
  });

  it('rejects invalid upload payloads', () => {
    expect(() =>
      uploadResultSchema.parse({
        url: 'not-a-url',
        publicId: '',
        width: -1,
        height: 0,
        format: '',
        bytes: -5,
      }),
    ).toThrow();
  });
});
