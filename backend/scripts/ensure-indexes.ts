import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { logger } from '../src/lib/logger';
import { User } from '../src/models/user.model';
import { Property } from '../src/models/property.model';
import { RoomType } from '../src/models/roomType.model';
import { Room } from '../src/models/room.model';
import { RatePlan } from '../src/models/ratePlan.model';
import { Inventory } from '../src/models/inventory.model';
import { Guest } from '../src/models/guest.model';
import { Booking } from '../src/models/booking.model';
import { BookingAddOn } from '../src/models/bookingAddOn.model';
import { AddOn } from '../src/models/addOn.model';
import { Promotion } from '../src/models/promotion.model';
import { Payment } from '../src/models/payment.model';
import { Folio } from '../src/models/folio.model';
import { PriceRule } from '../src/models/priceRule.model';
import { HousekeepingTask } from '../src/models/housekeepingTask.model';
import { Review } from '../src/models/review.model';
import { AuditLog } from '../src/models/auditLog.model';

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
