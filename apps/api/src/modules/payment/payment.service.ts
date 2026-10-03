import Stripe from 'stripe';
import { Types } from 'mongoose';
import {
  Payment,
  IPayment,
  PaymentType,
  PaymentMethod,
  PaymentStatusEnum,
} from '../../models/payment.model';
import { Folio, IFolio, FolioLineItemCategory, FolioStatus } from '../../models/folio.model';
import { Booking, IBooking } from '../../models/booking.model';
import { Property } from '../../models/property.model';
import { RatePlan, PaymentPolicyType } from '../../models/ratePlan.model';
import { Guest } from '../../models/guest.model';
import { SavedPaymentMethod, ISavedPaymentMethod } from '../../models/savedPaymentMethod.model';
import { StripeWebhookEvent } from '../../models/stripeWebhookEvent.model';
import { NotFoundError, BadRequestError } from '../../common/errors/http.errors';
import { BookingStatus, PaymentStatus } from '../../common/enums/bookingStatus.enum';
import { getStripe, isStripeConfigured } from '../../lib/stripe';
import { logger } from '../../lib/logger';
import { emit, EventType } from '../../lib/events';
import { assertBookingAccess } from '../booking/booking.access';
import { guestService } from '../guest/guest.service';
import { AuthUser } from '../../common/types/express.d';

const MAX_SAVED_CARDS = 5;

function generateFolioNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `INV-${year}-${random}`;
}

function refId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    if ('_id' in value) return String((value as { _id: unknown })._id);
    if ('id' in value) return String((value as { id: unknown }).id);
  }
  return String(value);
}

class PaymentService {
  async claimWebhookEvent(eventId: string, eventType: string): Promise<boolean> {
    try {
      await StripeWebhookEvent.create({ eventId, eventType, processedAt: new Date() });
      return true;
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 11000) {
        return false;
      }
      throw error;
    }
  }

  async releaseWebhookEvent(eventId: string): Promise<void> {
    await StripeWebhookEvent.deleteOne({ eventId });
  }

  async createPaymentIntent(
    bookingId: string,
    amount?: number,
    isDeposit: boolean = false,
    user?: AuthUser,
    saveCard: boolean = false,
  ): Promise<{ clientSecret: string; paymentIntentId: string; amount: number }> {
    const booking = await this.getBooking(bookingId, user);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError('Cannot process payment for cancelled booking');
    }

    const paymentAmount =
      amount || (isDeposit ? booking.payment.depositAmount : booking.payment.amountDue);

    if (paymentAmount <= 0) {
      throw new BadRequestError('Invalid payment amount');
    }

    const stripe = getStripe();
    const property = await Property.findById(booking.propertyId);
    const currency = property?.settings?.currency?.toLowerCase() || 'usd';

    const params: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(paymentAmount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId,
        confirmationNumber: booking.confirmationNumber,
        isDeposit: isDeposit.toString(),
        ...(user ? { userId: user.id } : {}),
      },
    };

    if (user && saveCard) {
      const customerId = await this.getOrCreateStripeCustomer(user.id);
      params.customer = customerId;
      params.setup_future_usage = 'off_session';
    }

    const paymentIntent = await stripe.paymentIntents.create(params);

    const payment = new Payment({
      bookingId: booking._id,
      guestId: booking.guestId,
      type: isDeposit ? PaymentType.DEPOSIT : PaymentType.PAYMENT,
      amount: paymentAmount,
      currency: currency.toUpperCase(),
      method: PaymentMethod.CARD,
      status: PaymentStatusEnum.PENDING,
      stripePaymentIntentId: paymentIntent.id,
    });

    await payment.save();

    if (!paymentIntent.client_secret) {
      throw new BadRequestError('Stripe did not return a client secret');
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentAmount,
    };
  }

  async chargeSavedCard(
    bookingId: string,
    paymentMethodId: string,
    user: AuthUser,
    isDeposit: boolean = false,
    amount?: number,
  ): Promise<{ payment: IPayment; clientSecret?: string; requiresAction: boolean }> {
    const booking = await this.getBooking(bookingId, user);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError('Cannot process payment for cancelled booking');
    }

    const saved = await SavedPaymentMethod.findOne({
      _id: paymentMethodId,
      userId: new Types.ObjectId(user.id),
    });

    if (!saved) {
      throw new NotFoundError('Saved payment method not found');
    }

    const paymentAmount =
      amount || (isDeposit ? booking.payment.depositAmount : booking.payment.amountDue);

    if (paymentAmount <= 0) {
      throw new BadRequestError('Invalid payment amount');
    }

    const stripe = getStripe();
    const property = await Property.findById(booking.propertyId);
    const currency = property?.settings?.currency?.toLowerCase() || 'usd';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100),
      currency,
      customer: saved.stripeCustomerId,
      payment_method: saved.stripePaymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        bookingId,
        confirmationNumber: booking.confirmationNumber,
        isDeposit: isDeposit.toString(),
        savedPaymentMethodId: saved._id.toString(),
      },
    });

    const payment = new Payment({
      bookingId: booking._id,
      guestId: booking.guestId,
      type: isDeposit ? PaymentType.DEPOSIT : PaymentType.PAYMENT,
      amount: paymentAmount,
      currency: currency.toUpperCase(),
      method: PaymentMethod.CARD,
      status: PaymentStatusEnum.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      metadata: {
        cardLast4: saved.last4,
        cardBrand: saved.brand,
      },
    });

    await payment.save();

    if (paymentIntent.status === 'succeeded') {
      const applied = await this.applyPaymentIntentSucceeded(paymentIntent);
      return { payment: applied ?? payment, requiresAction: false };
    }

    if (paymentIntent.status === 'requires_action' && paymentIntent.client_secret) {
      return {
        payment,
        clientSecret: paymentIntent.client_secret,
        requiresAction: true,
      };
    }

    await this.applyPaymentIntentFailed(paymentIntent);
    throw new BadRequestError('Saved card charge was not successful');
  }

  async confirmPayment(
    bookingId: string,
    paymentIntentId: string,
    user?: AuthUser,
  ): Promise<IPayment> {
    await this.getBooking(bookingId, user);

    const payment = await Payment.findOne({
      bookingId: new Types.ObjectId(bookingId),
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });

    if (paymentIntent.status === 'succeeded') {
      const applied = await this.applyPaymentIntentSucceeded(paymentIntent);
      return applied ?? payment;
    }

    await this.applyPaymentIntentFailed(paymentIntent);
    throw new BadRequestError('Payment was not successful');
  }

  async applyPaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<IPayment | null> {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {
      logger.warn(
        { paymentIntentId: paymentIntent.id },
        'Payment record not found for payment intent',
      );
      return null;
    }

    const alreadyCompleted = payment.status === PaymentStatusEnum.COMPLETED;

    if (!alreadyCompleted) {
      payment.status = PaymentStatusEnum.COMPLETED;
      payment.processedAt = new Date();
    }

    const charge = paymentIntent.latest_charge as Stripe.Charge | string | null;
    const chargeObject = typeof charge === 'object' && charge ? charge : null;
    if (chargeObject?.payment_method_details?.card) {
      payment.metadata = {
        ...payment.metadata,
        cardLast4: chargeObject.payment_method_details.card.last4 ?? undefined,
        cardBrand: chargeObject.payment_method_details.card.brand ?? undefined,
      };
    }

    await payment.save();

    if (!alreadyCompleted) {
      await this.updateBookingPayment(payment.bookingId.toString(), payment.amount);
    }

    await this.addPaymentToFolio(payment.bookingId.toString(), payment);

    if (!alreadyCompleted) {
      const booking = await Booking.findById(payment.bookingId);
      if (booking) {
        await this.emitPaymentEvent(EventType.PAYMENT_RECEIVED, payment, booking);
      }
    }

    await this.maybeSaveCardFromIntent(paymentIntent);

    return payment;
  }

  async applyPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<IPayment | null> {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) {
      logger.warn(
        { paymentIntentId: paymentIntent.id },
        'Payment record not found for failed payment',
      );
      return null;
    }

    if (payment.status === PaymentStatusEnum.FAILED) {
      return payment;
    }

    payment.status = PaymentStatusEnum.FAILED;
    payment.metadata = {
      ...payment.metadata,
      failureMessage: paymentIntent.last_payment_error?.message,
      failureCode: paymentIntent.last_payment_error?.code,
    };
    await payment.save();

    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      await this.emitPaymentEvent(EventType.PAYMENT_FAILED, payment, booking, {
        failureReason: paymentIntent.last_payment_error?.message,
      });
    }

    return payment;
  }

  async applyChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

    if (!paymentIntentId) {
      return;
    }

    const original = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!original) {
      return;
    }

    const refunds = charge.refunds?.data ?? [];

    for (const stripeRefund of refunds) {
      const existing = await Payment.findOne({ stripeRefundId: stripeRefund.id });
      if (existing) {
        continue;
      }

      const refundAmount = stripeRefund.amount / 100;
      const property = await Property.findById(
        (await Booking.findById(original.bookingId))?.propertyId,
      );

      const refund = new Payment({
        bookingId: original.bookingId,
        guestId: original.guestId,
        type: PaymentType.REFUND,
        amount: -refundAmount,
        currency: original.currency,
        method: PaymentMethod.CARD,
        status: PaymentStatusEnum.COMPLETED,
        processedAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
        stripeRefundId: stripeRefund.id,
        notes: 'Refunded via Stripe',
      });

      await refund.save();
      await this.updateBookingPayment(original.bookingId.toString(), -refundAmount);
      await this.addPaymentToFolio(original.bookingId.toString(), refund);

      original.metadata = {
        ...original.metadata,
        refunded: true,
        refundedAt: new Date().toISOString(),
      };
      await original.save();

      const booking = await Booking.findById(original.bookingId);
      if (booking) {
        if (booking.payment.amountPaid <= 0) {
          booking.payment.status = PaymentStatus.REFUNDED;
          await booking.save();
        }
        await this.emitPaymentEvent(EventType.PAYMENT_REFUNDED, refund, booking);
      }

      logger.info(
        { chargeId: charge.id, refundId: stripeRefund.id, currency: property?.settings?.currency },
        'Applied Stripe refund from webhook',
      );
    }
  }

  async recordCashPayment(
    bookingId: string,
    amount: number,
    userId: string,
    notes?: string,
  ): Promise<IPayment> {
    const booking = await this.getBooking(bookingId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError('Cannot process payment for cancelled booking');
    }

    const property = await Property.findById(booking.propertyId);

    const payment = new Payment({
      bookingId: booking._id,
      guestId: booking.guestId,
      type: PaymentType.PAYMENT,
      amount,
      currency: property?.settings?.currency || 'USD',
      method: PaymentMethod.CASH,
      status: PaymentStatusEnum.COMPLETED,
      processedAt: new Date(),
      processedBy: new Types.ObjectId(userId),
      notes,
    });

    await payment.save();

    await this.updateBookingPayment(bookingId, amount);
    await this.addPaymentToFolio(bookingId, payment);
    await this.emitPaymentEvent(EventType.PAYMENT_RECEIVED, payment, booking);

    return payment;
  }

  async processRefund(
    bookingId: string,
    amount: number,
    userId?: string,
    reason?: string,
  ): Promise<IPayment> {
    const booking = await this.getBooking(bookingId);

    if (amount > booking.payment.amountPaid) {
      throw new BadRequestError('Refund amount exceeds amount paid');
    }

    const cardPayments = await Payment.find({
      bookingId: booking._id,
      method: PaymentMethod.CARD,
      status: PaymentStatusEnum.COMPLETED,
      type: { $in: [PaymentType.PAYMENT, PaymentType.DEPOSIT] },
    }).sort({ createdAt: -1 });

    const property = await Property.findById(booking.propertyId);
    let refundedAmount = 0;
    let stripeRefundId: string | undefined;

    if (isStripeConfigured() && cardPayments.length > 0) {
      const stripe = getStripe();

      for (const payment of cardPayments) {
        if (refundedAmount >= amount) break;
        if (!payment.stripePaymentIntentId) continue;

        const alreadyRefunded = await Payment.aggregate([
          {
            $match: {
              stripePaymentIntentId: payment.stripePaymentIntentId,
              type: PaymentType.REFUND,
              status: PaymentStatusEnum.COMPLETED,
            },
          },
          { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
        ]);
        const previouslyRefunded = alreadyRefunded[0]?.total ?? 0;
        const refundableOnThisPayment = payment.amount - previouslyRefunded;
        if (refundableOnThisPayment <= 0) continue;

        const refundAmount = Math.min(amount - refundedAmount, refundableOnThisPayment);

        try {
          const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            amount: Math.round(refundAmount * 100),
          });
          stripeRefundId = refund.id;
          refundedAmount += refundAmount;
        } catch (error) {
          logger.error({ err: error, paymentId: payment._id }, 'Stripe refund error');
        }
      }

      if (refundedAmount === 0) {
        throw new BadRequestError('Stripe refund failed');
      }
    } else {
      refundedAmount = amount;
    }

    const refund = new Payment({
      bookingId: booking._id,
      guestId: booking.guestId,
      type: PaymentType.REFUND,
      amount: -refundedAmount,
      currency: property?.settings?.currency || 'USD',
      method: cardPayments.length > 0 ? PaymentMethod.CARD : PaymentMethod.CASH,
      status: PaymentStatusEnum.COMPLETED,
      processedAt: new Date(),
      processedBy:
        userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
      notes: reason,
      stripeRefundId,
    });

    await refund.save();

    await this.updateBookingPayment(bookingId, -refundedAmount);
    await this.addPaymentToFolio(bookingId, refund);

    const updated = await Booking.findById(bookingId);
    if (updated && updated.payment.amountPaid <= 0) {
      updated.payment.status = PaymentStatus.REFUNDED;
      await updated.save();
    }

    await this.emitPaymentEvent(EventType.PAYMENT_REFUNDED, refund, updated ?? booking);

    return refund;
  }

  async createSetupIntent(userId: string): Promise<{ clientSecret: string }> {
    const stripe = getStripe();
    const customerId = await this.getOrCreateStripeCustomer(userId);

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    if (!setupIntent.client_secret) {
      throw new BadRequestError('Stripe did not return a setup intent secret');
    }

    return { clientSecret: setupIntent.client_secret };
  }

  async listSavedPaymentMethods(userId: string): Promise<{
    paymentMethods: ISavedPaymentMethod[];
    canAddPaymentMethod: boolean;
    defaultCardId: string | null;
  }> {
    const methods = await SavedPaymentMethod.find({
      userId: new Types.ObjectId(userId),
    }).sort({ isDefault: -1, createdAt: -1 });

    const defaultCard = methods.find((method) => method.isDefault);

    return {
      paymentMethods: methods,
      canAddPaymentMethod: methods.length < MAX_SAVED_CARDS,
      defaultCardId: defaultCard?._id.toString() ?? null,
    };
  }

  async savePaymentMethod(
    userId: string,
    stripePaymentMethodId: string,
  ): Promise<ISavedPaymentMethod> {
    const existing = await SavedPaymentMethod.findOne({ stripePaymentMethodId });
    if (existing) {
      return existing;
    }

    const current = await SavedPaymentMethod.countDocuments({
      userId: new Types.ObjectId(userId),
    });
    if (current >= MAX_SAVED_CARDS) {
      throw new BadRequestError('Remove a card before adding a new one');
    }

    const stripe = getStripe();
    const customerId = await this.getOrCreateStripeCustomer(userId);

    const paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);
    if (!paymentMethod.card) {
      throw new BadRequestError('Only card payment methods can be saved');
    }

    await stripe.paymentMethods.attach(stripePaymentMethodId, { customer: customerId });

    const guest = await guestService.findByUserId(userId);
    const isFirst = current === 0;

    const saved = new SavedPaymentMethod({
      userId: new Types.ObjectId(userId),
      guestId: guest?._id,
      stripeCustomerId: customerId,
      stripePaymentMethodId,
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
      isDefault: isFirst,
    });

    await saved.save();

    if (isFirst) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: stripePaymentMethodId },
      });
    }

    return saved;
  }

  async setDefaultPaymentMethod(userId: string, id: string): Promise<ISavedPaymentMethod> {
    const saved = await SavedPaymentMethod.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!saved) {
      throw new NotFoundError('Payment method not found');
    }

    await SavedPaymentMethod.updateMany(
      { userId: new Types.ObjectId(userId) },
      { $set: { isDefault: false } },
    );

    saved.isDefault = true;
    await saved.save();

    const stripe = getStripe();
    await stripe.customers.update(saved.stripeCustomerId, {
      invoice_settings: { default_payment_method: saved.stripePaymentMethodId },
    });

    return saved;
  }

  async deletePaymentMethod(userId: string, id: string): Promise<void> {
    const saved = await SavedPaymentMethod.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!saved) {
      throw new NotFoundError('Payment method not found');
    }

    try {
      const stripe = getStripe();
      await stripe.paymentMethods.detach(saved.stripePaymentMethodId);
    } catch (error) {
      logger.warn({ err: error, paymentMethodId: id }, 'Failed to detach Stripe payment method');
    }

    const wasDefault = saved.isDefault;
    await saved.deleteOne();

    if (wasDefault) {
      const next = await SavedPaymentMethod.findOne({
        userId: new Types.ObjectId(userId),
      }).sort({ createdAt: -1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
  }

  async getFolio(bookingId: string, user?: AuthUser): Promise<IFolio> {
    const booking = await this.getBooking(bookingId, user);

    let folio = (await Folio.findOne({ bookingId: booking._id })) as IFolio | null;

    if (!folio) {
      folio = await this.createFolio(booking);
    }

    return folio;
  }

  async addCharge(
    bookingId: string,
    description: string,
    amount: number,
    quantity: number = 1,
    category: string = 'fee',
  ): Promise<IFolio> {
    const folio = await this.getFolio(bookingId);

    if (folio.status !== FolioStatus.OPEN) {
      throw new BadRequestError('Cannot add charges to a closed folio');
    }

    folio.lineItems.push({
      date: new Date(),
      description,
      category: category as FolioLineItemCategory,
      amount,
      quantity,
      total: amount * quantity,
    });

    folio.recalculate();
    await folio.save();

    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.pricing.fees += amount * quantity;
      booking.pricing.grandTotal += amount * quantity;
      booking.payment.amountDue = booking.pricing.grandTotal - booking.payment.amountPaid;
      await booking.save();
    }

    return folio;
  }

  async closeFolio(bookingId: string): Promise<IFolio> {
    const folio = await this.getFolio(bookingId);

    if (folio.balance > 0) {
      throw new BadRequestError('Cannot close folio with outstanding balance');
    }

    folio.status = FolioStatus.CLOSED;
    folio.closedAt = new Date();
    await folio.save();

    return folio;
  }

  async getPaymentHistory(bookingId: string): Promise<IPayment[]> {
    await this.getBooking(bookingId);

    return Payment.find({ bookingId: new Types.ObjectId(bookingId) })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    const guest = await guestService.findOrCreateForUser(userId);
    if (guest.stripeCustomerId) {
      return guest.stripeCustomerId;
    }

    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email: guest.email,
      name: `${guest.firstName} ${guest.lastName}`.trim(),
      metadata: { userId, guestId: guest._id.toString() },
    });

    guest.stripeCustomerId = customer.id;
    await guest.save();
    return customer.id;
  }

  private async maybeSaveCardFromIntent(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    if (!paymentIntent.customer || !paymentIntent.payment_method) {
      return;
    }

    const userId = paymentIntent.metadata?.userId;
    if (!userId) {
      return;
    }

    const paymentMethodId =
      typeof paymentIntent.payment_method === 'string'
        ? paymentIntent.payment_method
        : paymentIntent.payment_method.id;

    try {
      await this.savePaymentMethod(userId, paymentMethodId);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return;
      }
      logger.warn({ err: error }, 'Could not persist card from payment intent');
    }
  }

  private async getBooking(bookingId: string, user?: AuthUser) {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new BadRequestError('Invalid booking ID');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (user) {
      await assertBookingAccess(booking, user);
    }

    return booking;
  }

  private async updateBookingPayment(bookingId: string, amount: number) {
    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    booking.payment.amountPaid += amount;
    booking.payment.amountDue = booking.pricing.grandTotal - booking.payment.amountPaid;

    if (booking.payment.amountPaid <= 0 && amount < 0) {
      booking.payment.status = PaymentStatus.REFUNDED;
    } else if (booking.payment.amountPaid >= booking.pricing.grandTotal) {
      booking.payment.status = PaymentStatus.PAID;
    } else if (booking.payment.amountPaid > 0) {
      booking.payment.status = PaymentStatus.PARTIAL;
    } else {
      booking.payment.status = PaymentStatus.PENDING;
    }

    if (booking.status === BookingStatus.PENDING && booking.payment.amountPaid > 0) {
      const ratePlan = await RatePlan.findById(booking.ratePlanId);
      const requiredDeposit =
        ratePlan?.paymentPolicy === PaymentPolicyType.DEPOSIT && ratePlan.depositPercentage
          ? (booking.pricing.grandTotal * ratePlan.depositPercentage) / 100
          : ratePlan?.paymentPolicy === PaymentPolicyType.PREPAID
            ? booking.pricing.grandTotal
            : 0;

      if (
        booking.payment.amountPaid >= requiredDeposit ||
        ratePlan?.paymentPolicy === PaymentPolicyType.PAY_AT_HOTEL
      ) {
        booking.status = BookingStatus.CONFIRMED;
      }
    }

    await booking.save();
  }

  private async createFolio(booking: IBooking): Promise<IFolio> {
    let folioNumber: string;
    let isUnique = false;
    do {
      folioNumber = generateFolioNumber();
      const existing = await Folio.findOne({ folioNumber });
      isUnique = !existing;
    } while (!isUnique);

    const lineItems = [];

    for (let i = 0; i < booking.dates.nights; i++) {
      const date = new Date(booking.dates.checkIn);
      date.setDate(date.getDate() + i);

      lineItems.push({
        date,
        description: `Room charge - Night ${i + 1}`,
        category: FolioLineItemCategory.ROOM,
        amount: booking.pricing.roomRate,
        quantity: booking.occupancy.rooms,
        total: booking.pricing.roomRate * booking.occupancy.rooms,
      });
    }

    if (booking.pricing.taxes > 0) {
      lineItems.push({
        date: booking.dates.checkIn,
        description: 'Taxes',
        category: FolioLineItemCategory.TAX,
        amount: booking.pricing.taxes,
        quantity: 1,
        total: booking.pricing.taxes,
      });
    }

    const folio = new Folio({
      bookingId: booking._id,
      folioNumber,
      lineItems,
      subtotal: booking.pricing.roomTotal,
      taxTotal: booking.pricing.taxes,
      grandTotal: booking.pricing.grandTotal,
      amountPaid: booking.payment.amountPaid,
      balance: booking.payment.amountDue,
      status: FolioStatus.OPEN,
    });

    await folio.save();
    return folio;
  }

  private async addPaymentToFolio(bookingId: string, payment: IPayment) {
    const folio = await this.getFolio(bookingId);
    const reference =
      payment.stripeRefundId || payment.stripePaymentIntentId || payment._id.toString();

    const alreadyRecorded = folio.lineItems.some((item) => item.reference === reference);
    if (alreadyRecorded) {
      return;
    }

    folio.lineItems.push({
      date: new Date(),
      description:
        payment.type === PaymentType.REFUND
          ? `Refund - ${payment.method}`
          : `Payment - ${payment.method}`,
      category:
        payment.type === PaymentType.REFUND
          ? FolioLineItemCategory.REFUND
          : FolioLineItemCategory.PAYMENT,
      amount: payment.amount,
      quantity: 1,
      total: payment.amount,
      reference,
    });

    folio.recalculate();
    await folio.save();
  }

  private async emitPaymentEvent(
    type: EventType.PAYMENT_RECEIVED | EventType.PAYMENT_FAILED | EventType.PAYMENT_REFUNDED,
    payment: IPayment,
    booking: IBooking,
    extra?: { failureReason?: string },
  ): Promise<void> {
    const guestId = refId(booking.guestId);
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return;
    }

    emit(type, {
      paymentId: payment._id.toString(),
      bookingId: booking._id.toString(),
      guestId,
      guestEmail: guest.email,
      amount: Math.abs(payment.amount),
      currency: payment.currency,
      method: payment.method,
      confirmationNumber: booking.confirmationNumber,
      propertyId: refId(booking.propertyId),
      ...extra,
    });
  }
}

export const paymentService = new PaymentService();
