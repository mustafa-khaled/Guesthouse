import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { logger } from './lib/logger';
import { initSentry } from './lib/sentry';
import { connectDB } from './config/db';
import { connectRedis, disconnectRedis } from './lib/redis';
import { closeQueues } from './lib/queue';
import { startWorkers, stopWorkers } from './workers';

async function startWorkerProcess() {
  initSentry();
  await connectDB();
  await connectRedis();
  await startWorkers();
  logger.info('Worker process running (no HTTP)');
}

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Received shutdown signal');

  setTimeout(() => {
    logger.warn('Forced worker shutdown after timeout');
    process.exit(1);
  }, 30000);

  try {
    await stopWorkers();
    await closeQueues();
    await disconnectRedis();
    await mongoose.disconnect();
    logger.info('Worker connections closed gracefully');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during worker shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

startWorkerProcess().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start worker process');
  process.exit(1);
});
