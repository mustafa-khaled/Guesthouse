import { beforeAll, afterAll, afterEach, inject } from 'vitest';
import mongoose from 'mongoose';

declare module 'vitest' {
  export interface ProvidedContext {
    MONGODB_URI: string;
  }
}

beforeAll(async () => {
  const uri = inject('MONGODB_URI');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 0) return;
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
