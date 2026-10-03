import { logger } from '../lib/logger';
import { startEmailWorker, stopEmailWorker } from './email.worker';
import { startSchedulerWorker, stopSchedulerWorker } from './scheduler.worker';

export async function startWorkers(): Promise<void> {
  logger.info('Starting background workers...');

  startEmailWorker();
  startSchedulerWorker();

  logger.info('All workers started');
}

export async function stopWorkers(): Promise<void> {
  logger.info('Stopping background workers...');

  stopSchedulerWorker();
  await stopEmailWorker();

  logger.info('All workers stopped');
}

export { startEmailWorker, stopEmailWorker, getEmailWorker } from './email.worker';
