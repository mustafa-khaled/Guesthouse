import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../lib/logger';

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}
