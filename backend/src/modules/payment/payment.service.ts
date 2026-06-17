import {
  Payment,
  IPayment,
  PaymentType,
  PaymentMethod,
  PaymentStatusEnum,
} from "../../models/payment.model";
import {
  Folio,
  IFolio,
  FolioLineItemCategory,
  FolioStatus,
} from "../../models/folio.model";
import { Booking } from "../../models/booking.model";
import { Property } from "../../models/property.model";
import { RatePlan } from "../../models/ratePlan.model";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../common/errors/http.errors";
import { BookingStatus, PaymentStatus } from "../../common/enums/bookingStatus.enum";
import { Types } from "mongoose";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";

function generateFolioNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `INV-${year}-${random}`;
}

class PaymentService {
  async createPaymentIntent(
    bookingId: string,
    amount?: number,
    isDeposit: boolean = false
  ): Promise<{ clientSecret: string; paymentIntentId: string; amount: number }> {
    const booking = await this.getBooking(bookingId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError("Cannot process payment for cancelled booking");
    }

    const paymentAmount =
      amount || (isDeposit ? booking.payment.depositAmount : booking.payment.amountDue);

    if (paymentAmount <= 0) {
      throw new BadRequestError("Invalid payment amount");
    }

    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new BadRequestError("Payment processing is not configured");
    }

    const property = await Property.findById(booking.propertyId);
    const currency = property?.settings?.currency?.toLowerCase() || "usd";

    const stripe = require("stripe")(stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100),
      currency,
      metadata: {
        bookingId: bookingId,
        confirmationNumber: booking.confirmationNumber,
        isDeposit: isDeposit.toString(),
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
    });

    await payment.save();

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentAmount,
    };
  }

  async confirmPayment(
    bookingId: string,
    paymentIntentId: string
  ): Promise<IPayment> {
    const payment = await Payment.findOne({
      bookingId: new Types.ObjectId(bookingId),
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new BadRequestError("Payment processing is not configured");
    }

    const stripe = require("stripe")(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      payment.status = PaymentStatusEnum.COMPLETED;
      payment.processedAt = new Date();

      if (paymentIntent.charges?.data?.[0]) {
        const charge = paymentIntent.charges.data[0];
        payment.metadata = {
          cardLast4: charge.payment_method_details?.card?.last4,
          cardBrand: charge.payment_method_details?.card?.brand,
        };
      }

      await payment.save();

      await this.updateBookingPayment(bookingId, payment.amount);
      await this.addPaymentToFolio(bookingId, payment);
    } else {
      payment.status = PaymentStatusEnum.FAILED;
      await payment.save();
      throw new BadRequestError("Payment was not successful");
    }

    return payment;
  }

  async recordCashPayment(
    bookingId: string,
    amount: number,
    userId: string,
    notes?: string
  ): Promise<IPayment> {
    const booking = await this.getBooking(bookingId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestError("Cannot process payment for cancelled booking");
    }

    const property = await Property.findById(booking.propertyId);

    const payment = new Payment({
      bookingId: booking._id,
      guestId: booking.guestId,
      type: PaymentType.PAYMENT,
      amount,
      currency: property?.settings?.currency || "USD",
      method: PaymentMethod.CASH,
      status: PaymentStatusEnum.COMPLETED,
      processedAt: new Date(),
      processedBy: new Types.ObjectId(userId),
      notes,
    });

    await payment.save();

    await this.updateBookingPayment(bookingId, amount);
    await this.addPaymentToFolio(bookingId, payment);

    return payment;
  }

  async processRefund(
    bookingId: string,
    amount: number,
    userId: string,
    reason?: string
  ): Promise<IPayment> {
    const booking = await this.getBooking(bookingId);

    if (amount > booking.payment.amountPaid) {
      throw new BadRequestError("Refund amount exceeds amount paid");
    }

    const cardPayments = await Payment.find({
      bookingId: booking._id,
      method: PaymentMethod.CARD,
      status: PaymentStatusEnum.COMPLETED,
    }).sort({ createdAt: -1 });

    const property = await Property.findById(booking.propertyId);
    let refundedAmount = 0;

    const stripeSecretKey = env.STRIPE_SECRET_KEY;

    if (stripeSecretKey && cardPayments.length > 0) {
      const stripe = require("stripe")(stripeSecretKey);

      for (const payment of cardPayments) {
        if (refundedAmount >= amount) break;
        if (!payment.stripePaymentIntentId) continue;

        const refundAmount = Math.min(amount - refundedAmount, payment.amount);

        try {
          const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            amount: Math.round(refundAmount * 100),
          });

          refundedAmount += refundAmount;
        } catch (error) {
          logger.error({ err: error, paymentId: payment._id }, "Stripe refund error");
        }
      }
    }

    const refund = new Payment({
      bookingId: booking._id,
      guestId: booking.guestId,
      type: PaymentType.REFUND,
      amount: -amount,
      currency: property?.settings?.currency || "USD",
      method: cardPayments.length > 0 ? PaymentMethod.CARD : PaymentMethod.CASH,
      status: PaymentStatusEnum.COMPLETED,
      processedAt: new Date(),
      processedBy: new Types.ObjectId(userId),
      notes: reason,
    });

    await refund.save();

    await this.updateBookingPayment(bookingId, -amount);
    await this.addPaymentToFolio(bookingId, refund);

    return refund;
  }

  async getFolio(bookingId: string): Promise<IFolio> {
    const booking = await this.getBooking(bookingId);

    let folio = await Folio.findOne({ bookingId: booking._id });

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
    category: string = "fee"
  ): Promise<IFolio> {
    const folio = await this.getFolio(bookingId);

    if (folio.status !== FolioStatus.OPEN) {
      throw new BadRequestError("Cannot add charges to a closed folio");
    }

    folio.lineItems.push({
      date: new Date(),
      description,
      category: category as FolioLineItemCategory,
      amount,
      quantity,
      total: amount * quantity,
    });

    (folio as any).recalculate();
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
      throw new BadRequestError("Cannot close folio with outstanding balance");
    }

    folio.status = FolioStatus.CLOSED;
    folio.closedAt = new Date();
    await folio.save();

    return folio;
  }

  async getPaymentHistory(bookingId: string): Promise<IPayment[]> {
    await this.getBooking(bookingId);

    return Payment.find({ bookingId: new Types.ObjectId(bookingId) })
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 });
  }

  private async getBooking(bookingId: string) {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    return booking;
  }

  private async updateBookingPayment(bookingId: string, amount: number) {
    const booking = await Booking.findById(bookingId);
    if (!booking) return;

    booking.payment.amountPaid += amount;
    booking.payment.amountDue = booking.pricing.grandTotal - booking.payment.amountPaid;

    if (booking.payment.amountPaid >= booking.pricing.grandTotal) {
      booking.payment.status = PaymentStatus.PAID;
    } else if (booking.payment.amountPaid > 0) {
      booking.payment.status = PaymentStatus.PARTIAL;
    }

    if (
      booking.status === BookingStatus.PENDING &&
      booking.payment.amountPaid > 0
    ) {
      const ratePlan = await RatePlan.findById(booking.ratePlanId);
      const requiredDeposit =
        ratePlan?.depositPercentage
          ? (booking.pricing.grandTotal * ratePlan.depositPercentage) / 100
          : 0;

      if (
        booking.payment.amountPaid >= requiredDeposit ||
        ratePlan?.paymentPolicy === "pay-at-hotel"
      ) {
        booking.status = BookingStatus.CONFIRMED;
      }
    }

    await booking.save();
  }

  private async createFolio(booking: any): Promise<IFolio> {
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
        description: "Taxes",
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
      reference: payment.stripePaymentIntentId || payment._id.toString(),
    });

    (folio as any).recalculate();
    await folio.save();
  }
}

export const paymentService = new PaymentService();
