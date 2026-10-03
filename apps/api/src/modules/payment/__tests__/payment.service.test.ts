import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import {
  Payment,
  PaymentMethod,
  PaymentStatusEnum,
  PaymentType,
} from '../../../models/payment.model';
import { Booking } from '../../../models/booking.model';
import { Guest } from '../../../models/guest.model';
import { Property } from '../../../models/property.model';
import { RatePlan, PaymentPolicyType } from '../../../models/ratePlan.model';
import { RoomType } from '../../../models/roomType.model';
import { Folio } from '../../../models/folio.model';
import { StripeWebhookEvent } from '../../../models/stripeWebhookEvent.model';
import { BookingStatus, PaymentStatus } from '../../../common/enums/bookingStatus.enum';
import { paymentService } from '../payment.service';

vi.mock('../../../lib/stripe', () => ({
  isStripeConfigured: () => true,
  getStripe: () => ({
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
    },
    customers: {
      create: vi.fn(),
      update: vi.fn(),
    },
    paymentMethods: {
      retrieve: vi.fn(),
      attach: vi.fn(),
      detach: vi.fn(),
    },
    setupIntents: {
      create: vi.fn(),
    },
  }),
}));

async function seedPaidBooking() {
  const property = await Property.create({
    name: 'Test Inn',
    slug: `test-inn-${Date.now()}`,
    address: { city: 'Cairo', country: 'EG' },
    settings: { timezone: 'UTC', currency: 'USD', checkInTime: '15:00', checkOutTime: '11:00' },
  });

  const roomType = await RoomType.create({
    propertyId: property._id,
    name: 'Deluxe',
    code: `DLX-${Date.now()}`,
    maxOccupancy: { adults: 2, children: 1, total: 3 },
    basePrice: 100,
  });

  const ratePlan = await RatePlan.create({
    roomTypeId: roomType._id,
    name: 'Flexible',
    code: `FLEX-${Date.now()}`,
    basePrice: 100,
    paymentPolicy: PaymentPolicyType.PREPAID,
  });

  const guest = await Guest.create({
    email: `guest-${Date.now()}@example.com`,
    firstName: 'Ada',
    lastName: 'Lovelace',
  });

  const booking = await Booking.create({
    confirmationNumber: `HBK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    propertyId: property._id,
    guestId: guest._id,
    roomTypeId: roomType._id,
    ratePlanId: ratePlan._id,
    dates: {
      checkIn: new Date('2026-10-10'),
      checkOut: new Date('2026-10-12'),
      nights: 2,
    },
    occupancy: { adults: 2, children: 0, rooms: 1 },
    status: BookingStatus.PENDING,
    pricing: {
      roomRate: 100,
      roomTotal: 200,
      addOnsTotal: 0,
      taxes: 0,
      fees: 0,
      discountAmount: 0,
      grandTotal: 200,
    },
    payment: {
      status: PaymentStatus.PENDING,
      amountPaid: 0,
      amountDue: 200,
      depositAmount: 200,
    },
  });

  const payment = await Payment.create({
    bookingId: booking._id,
    guestId: guest._id,
    type: PaymentType.PAYMENT,
    amount: 200,
    currency: 'USD',
    method: PaymentMethod.CARD,
    status: PaymentStatusEnum.PENDING,
    stripePaymentIntentId: `pi_${new Types.ObjectId().toString()}`,
  });

  return { booking, payment, guest };
}

describe('paymentService apply + webhook claims', () => {
  beforeEach(async () => {
    await Promise.all([
      Payment.deleteMany({}),
      Booking.deleteMany({}),
      Guest.deleteMany({}),
      Folio.deleteMany({}),
      StripeWebhookEvent.deleteMany({}),
    ]);
  });

  it('applies a successful payment once and is idempotent on the second call', async () => {
    const { booking, payment } = await seedPaidBooking();

    const intent = {
      id: payment.stripePaymentIntentId,
      metadata: { bookingId: booking._id.toString() },
      latest_charge: {
        payment_method_details: { card: { last4: '4242', brand: 'visa' } },
      },
    } as unknown as Stripe.PaymentIntent;

    const first = await paymentService.applyPaymentIntentSucceeded(intent);
    const second = await paymentService.applyPaymentIntentSucceeded(intent);

    expect(first?.status).toBe(PaymentStatusEnum.COMPLETED);
    expect(second?.status).toBe(PaymentStatusEnum.COMPLETED);

    const updated = await Booking.findById(booking._id);
    expect(updated?.payment.amountPaid).toBe(200);
    expect(updated?.payment.status).toBe(PaymentStatus.PAID);
    expect(updated?.status).toBe(BookingStatus.CONFIRMED);

    const folio = await Folio.findOne({ bookingId: booking._id });
    const paymentLines = folio?.lineItems.filter((item) => item.category === 'payment') ?? [];
    expect(paymentLines).toHaveLength(1);
  });

  it('claims a Stripe event id only once', async () => {
    const first = await paymentService.claimWebhookEvent('evt_1', 'payment_intent.succeeded');
    const second = await paymentService.claimWebhookEvent('evt_1', 'payment_intent.succeeded');

    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
