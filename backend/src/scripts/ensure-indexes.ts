import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { User } from '../models/user.model';
import { Property } from '../models/property.model';
import { RoomType } from '../models/roomType.model';
import { Room } from '../models/room.model';
import { RatePlan } from '../models/ratePlan.model';
import { Inventory } from '../models/inventory.model';
import { Guest } from '../models/guest.model';
import { Booking } from '../models/booking.model';
import { BookingAddOn } from '../models/bookingAddOn.model';
import { AddOn } from '../models/addOn.model';
import { Promotion } from '../models/promotion.model';
import { Payment } from '../models/payment.model';
import { Folio } from '../models/folio.model';
import { PriceRule } from '../models/priceRule.model';
import { HousekeepingTask } from '../models/housekeepingTask.model';
import { Review } from '../models/review.model';
import { AuditLog } from '../models/auditLog.model';

const models = [
  User,
  Property,
  RoomType,
  Room,
  RatePlan,
  Inventory,
  Guest,
  Booking,
  BookingAddOn,
  AddOn,
  Promotion,
  Payment,
  Folio,
  PriceRule,
  HousekeepingTask,
  Review,
  AuditLog,
];

async function ensureIndexes() {
  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
  });

  for (const model of models) {
    await model.syncIndexes();
    logger.info({ model: model.modelName }, 'Indexes synchronized');
  }

  await mongoose.disconnect();
  logger.info('Index synchronization complete');
}

ensureIndexes().catch((error) => {
  logger.error({ err: error }, 'Failed to synchronize indexes');
  process.exit(1);
});
