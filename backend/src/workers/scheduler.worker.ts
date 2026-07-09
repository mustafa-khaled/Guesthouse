import { logger } from '../lib/logger';
import { Booking } from '../models/booking.model';
import { BookingStatus } from '../common/enums/bookingStatus.enum';
import { notificationService } from '../modules/notification/notification.service';

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let schedulerTimer: ReturnType<typeof setInterval> | null = null;

async function processScheduledEmails(): Promise<void> {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  try {
    const preArrivalBookings = await Booking.find({
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      'dates.checkIn': { $gte: tomorrowStart, $lte: tomorrowEnd },
      preArrivalEmailSentAt: { $exists: false },
    });

    for (const booking of preArrivalBookings) {
      await notificationService.sendPreArrivalReminder(booking);
      booking.preArrivalEmailSentAt = new Date();
      await booking.save();
      logger.info({ bookingId: booking._id }, 'Pre-arrival reminder sent');
    }

    const reviewBookings = await Booking.find({
      status: BookingStatus.CHECKED_OUT,
      'dates.checkOut': { $gte: yesterdayStart, $lte: yesterdayEnd },
      reviewRequestEmailSentAt: { $exists: false },
    });

    for (const booking of reviewBookings) {
      await notificationService.sendReviewRequest(booking);
      booking.reviewRequestEmailSentAt = new Date();
      await booking.save();
      logger.info({ bookingId: booking._id }, 'Review request sent');
    }
  } catch (error) {
    logger.error({ err: error }, 'Scheduled email processing failed');
  }
}

export function startSchedulerWorker(): void {
  if (schedulerTimer) return;

  logger.info('Starting scheduled email worker');
  processScheduledEmails();
  schedulerTimer = setInterval(processScheduledEmails, CHECK_INTERVAL_MS);
}

export function stopSchedulerWorker(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    logger.info('Scheduled email worker stopped');
  }
}
