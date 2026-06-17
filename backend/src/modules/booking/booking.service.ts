import { Booking, IBooking } from "../../models/booking.model";
import { Property } from "../../models/property.model";
import { RoomType } from "../../models/roomType.model";
import { RatePlan } from "../../models/ratePlan.model";
import { Room } from "../../models/room.model";
import { BookingAddOn } from "../../models/bookingAddOn.model";
import { guestService } from "../guest/guest.service";
import { inventoryService } from "../inventory/inventory.service";
import { ratePlanService } from "../ratePlan/ratePlan.service";
import { promotionService } from "../promotion/promotion.service";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from "../../common/errors/http.errors";
import {
  getPaginationParams,
  createPaginatedResult,
  getSortParams,
  PaginatedResult,
} from "../../common/utils/pagination";
import {
  parseDate,
  getNightsBetween,
} from "../../common/utils/dateUtils";
import {
  BookingStatus,
  PaymentStatus,
  BookingSource,
  canTransitionTo,
} from "../../common/enums/bookingStatus.enum";
import { RoomStatus } from "../../common/enums/roomStatus.enum";
import { Types } from "mongoose";
import { withTransaction } from "../../lib/transaction";
import { emit, EventType } from "../../lib/events";

function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "HBK-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface CreateBookingData {
  propertyId: string;
  roomTypeId: string;
  ratePlanId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  guest: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  additionalGuests?: { firstName: string; lastName: string; email?: string }[];
  specialRequests?: string;
  source?: BookingSource;
  promotionCode?: string;
  holdId?: string;
}

export interface ListBookingsFilters {
  propertyId?: string;
  guestId?: string;
  status?: BookingStatus;
  checkInFrom?: string;
  checkInTo?: string;
  confirmationNumber?: string;
}

class BookingService {
  async create(data: CreateBookingData, userId?: string): Promise<IBooking> {
    const property = await Property.findById(data.propertyId);
    if (!property || !property.isActive) {
      throw new NotFoundError("Property not found or inactive");
    }

    const roomType = await RoomType.findById(data.roomTypeId);
    if (!roomType || roomType.propertyId.toString() !== data.propertyId) {
      throw new NotFoundError("Room type not found for this property");
    }

    const ratePlan = await RatePlan.findById(data.ratePlanId);
    if (!ratePlan || ratePlan.roomTypeId.toString() !== data.roomTypeId) {
      throw new NotFoundError("Rate plan not found for this room type");
    }

    const checkInDate = parseDate(data.checkIn);
    const checkOutDate = parseDate(data.checkOut);
    const nights = getNightsBetween(checkInDate, checkOutDate);

    if (nights < 1) {
      throw new BadRequestError("Check-out must be after check-in");
    }

    if (ratePlan.minNights && nights < ratePlan.minNights) {
      throw new BadRequestError(`Minimum stay is ${ratePlan.minNights} nights`);
    }

    if (ratePlan.maxNights && nights > ratePlan.maxNights) {
      throw new BadRequestError(`Maximum stay is ${ratePlan.maxNights} nights`);
    }

    const availability = await inventoryService.getAvailabilityForDateRange(
      data.propertyId,
      data.roomTypeId,
      checkInDate,
      checkOutDate
    );

    const minAvailable = Math.min(
      ...availability.map((inv) => inv.availableRooms)
    );

    if (minAvailable < data.rooms) {
      throw new ConflictError("Not enough rooms available for the selected dates");
    }

    const guest = await guestService.findOrCreateByEmail({
      email: data.guest.email,
      firstName: data.guest.firstName,
      lastName: data.guest.lastName,
      phone: data.guest.phone,
    });

    if (userId && !guest.userId) {
      guest.userId = new Types.ObjectId(userId);
      await guest.save();
    }

    const { total: roomTotal } = await ratePlanService.calculateTotalPrice(
      data.ratePlanId,
      checkInDate,
      checkOutDate
    );

    const totalRoomCost = roomTotal * data.rooms;

    let discountAmount = 0;
    if (data.promotionCode) {
      try {
        const discount = await promotionService.calculateDiscount(
          data.promotionCode,
          {
            propertyId: data.propertyId,
            roomTypeId: data.roomTypeId,
            ratePlanId: data.ratePlanId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,
            roomTotal: totalRoomCost,
            guestId: guest._id.toString(),
          }
        );
        discountAmount = discount;
      } catch (error) {
        throw new BadRequestError(`Invalid promotion code: ${(error as Error).message}`);
      }
    }

    const taxRate = property.settings?.taxRate || 0;
    const taxes = Math.round((totalRoomCost - discountAmount) * (taxRate / 100) * 100) / 100;
    const grandTotal = totalRoomCost - discountAmount + taxes;

    let confirmationNumber: string;
    let isUnique = false;
    do {
      confirmationNumber = generateConfirmationNumber();
      const existing = await Booking.findOne({ confirmationNumber });
      isUnique = !existing;
    } while (!isUnique);

    const booking = new Booking({
      confirmationNumber,
      propertyId: new Types.ObjectId(data.propertyId),
      guestId: guest._id,
      additionalGuests: data.additionalGuests || [],
      roomTypeId: new Types.ObjectId(data.roomTypeId),
      ratePlanId: new Types.ObjectId(data.ratePlanId),
      dates: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
      },
      occupancy: {
        adults: data.adults,
        children: data.children,
        rooms: data.rooms,
      },
      status: BookingStatus.PENDING,
      pricing: {
        roomRate: ratePlan.basePrice,
        roomTotal: totalRoomCost,
        addOnsTotal: 0,
        taxes,
        fees: 0,
        discountAmount,
        grandTotal,
      },
      payment: {
        status: PaymentStatus.PENDING,
        amountPaid: 0,
        amountDue: grandTotal,
        depositAmount: 0,
      },
      specialRequests: data.specialRequests,
      source: data.source || BookingSource.DIRECT,
      promotionCode: data.promotionCode,
      holdId: data.holdId ? new Types.ObjectId(data.holdId) : undefined,
    });

    await withTransaction(async (session) => {
      await booking.save({ session });

      if (data.holdId) {
        await inventoryService.convertHoldToBooking(data.holdId);
      } else {
        await inventoryService.incrementBookedRooms(
          data.propertyId,
          data.roomTypeId,
          checkInDate,
          checkOutDate,
          data.rooms,
          session
        );
      }

      if (data.promotionCode) {
        await promotionService.incrementUsage(data.promotionCode);
      }
    });

    emit(EventType.BOOKING_CREATED, {
      bookingId: booking._id.toString(),
      confirmationNumber: booking.confirmationNumber,
      propertyId: data.propertyId,
      guestId: guest._id.toString(),
      guestEmail: guest.email,
      guestName: `${guest.firstName} ${guest.lastName}`,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      roomTypeId: data.roomTypeId,
      totalAmount: grandTotal,
      userId,
    });

    return booking.populate([
      { path: "propertyId", select: "name" },
      { path: "guestId", select: "firstName lastName email" },
      { path: "roomTypeId", select: "name code" },
      { path: "ratePlanId", select: "name code" },
    ]);
  }

  async findById(id: string): Promise<IBooking> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid booking ID");
    }

    const booking = await Booking.findById(id).populate([
      { path: "propertyId", select: "name slug settings" },
      { path: "guestId" },
      { path: "roomTypeId", select: "name code" },
      { path: "ratePlanId", select: "name code cancellationPolicy" },
      { path: "assignedRoomId", select: "roomNumber floor" },
    ]);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    return booking;
  }

  async findByConfirmationNumber(confirmationNumber: string): Promise<IBooking> {
    const booking = await Booking.findOne({
      confirmationNumber: confirmationNumber.toUpperCase(),
    }).populate([
      { path: "propertyId", select: "name slug" },
      { path: "guestId", select: "firstName lastName email" },
      { path: "roomTypeId", select: "name" },
    ]);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    return booking;
  }

  async update(
    id: string,
    data: { additionalGuests?: any[]; specialRequests?: string; internalNotes?: string }
  ): Promise<IBooking> {
    const booking = await this.findById(id);

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.CHECKED_OUT
    ) {
      throw new BadRequestError("Cannot modify a cancelled or completed booking");
    }

    Object.assign(booking, data);
    await booking.save();

    return booking;
  }

  async cancel(id: string, reason?: string, userId?: string): Promise<IBooking> {
    const booking = await this.findById(id);

    if (!canTransitionTo(booking.status, BookingStatus.CANCELLED)) {
      throw new BadRequestError(
        `Cannot cancel booking with status "${booking.status}"`
      );
    }

    const ratePlan = await RatePlan.findById(booking.ratePlanId);
    let refundAmount = 0;

    if (ratePlan && booking.payment.amountPaid > 0) {
      const now = new Date();
      const checkIn = new Date(booking.dates.checkIn);
      const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (
        ratePlan.cancellationPolicy.type === "flexible" ||
        hoursUntilCheckIn > ratePlan.cancellationPolicy.deadlineHours
      ) {
        refundAmount = booking.payment.amountPaid;
      } else if (ratePlan.cancellationPolicy.type !== "non-refundable") {
        const penalty =
          booking.payment.amountPaid *
          (ratePlan.cancellationPolicy.penaltyPercentage / 100);
        refundAmount = booking.payment.amountPaid - penalty;
      }
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: userId ? new Types.ObjectId(userId) : undefined,
      reason,
      refundAmount,
    };

    await withTransaction(async (session) => {
      await booking.save({ session });

      await inventoryService.decrementBookedRooms(
        booking.propertyId.toString(),
        booking.roomTypeId.toString(),
        booking.dates.checkIn,
        booking.dates.checkOut,
        booking.occupancy.rooms,
        session
      );
    });

    const guest = await guestService.findById(booking.guestId.toString());

    emit(EventType.BOOKING_CANCELLED, {
      bookingId: booking._id.toString(),
      confirmationNumber: booking.confirmationNumber,
      propertyId: booking.propertyId.toString(),
      guestId: booking.guestId.toString(),
      guestEmail: guest.email,
      guestName: `${guest.firstName} ${guest.lastName}`,
      checkIn: booking.dates.checkIn,
      checkOut: booking.dates.checkOut,
      roomTypeId: booking.roomTypeId.toString(),
      totalAmount: booking.pricing.grandTotal,
      userId,
      reason,
      refundAmount,
    });

    return booking;
  }

  async checkIn(id: string, roomId: string, userId: string): Promise<IBooking> {
    const booking = await this.findById(id);

    if (!canTransitionTo(booking.status, BookingStatus.CHECKED_IN)) {
      throw new BadRequestError(
        `Cannot check in booking with status "${booking.status}"`
      );
    }

    const room = await Room.findById(roomId);
    if (!room || room.propertyId.toString() !== booking.propertyId.toString()) {
      throw new NotFoundError("Room not found for this property");
    }

    if (room.roomTypeId.toString() !== booking.roomTypeId.toString()) {
      throw new BadRequestError("Room type does not match booking");
    }

    if (room.isOccupied) {
      throw new ConflictError("Room is already occupied");
    }

    if (room.status !== RoomStatus.CLEAN && room.status !== RoomStatus.INSPECTED) {
      throw new BadRequestError(`Room is not ready (status: ${room.status})`);
    }

    booking.status = BookingStatus.CHECKED_IN;
    booking.assignedRoomId = room._id;
    booking.checkInDetails = {
      checkedInAt: new Date(),
      checkedInBy: new Types.ObjectId(userId),
    };

    room.isOccupied = true;
    room.status = RoomStatus.DIRTY;

    await withTransaction(async (session) => {
      await booking.save({ session });
      await room.save({ session });
    });

    const guest = await guestService.findById(booking.guestId.toString());

    emit(EventType.BOOKING_CHECKED_IN, {
      bookingId: booking._id.toString(),
      confirmationNumber: booking.confirmationNumber,
      propertyId: booking.propertyId.toString(),
      guestId: booking.guestId.toString(),
      guestEmail: guest.email,
      guestName: `${guest.firstName} ${guest.lastName}`,
      checkIn: booking.dates.checkIn,
      checkOut: booking.dates.checkOut,
      roomTypeId: booking.roomTypeId.toString(),
      totalAmount: booking.pricing.grandTotal,
      userId,
      roomId: room._id.toString(),
      roomNumber: room.roomNumber,
    });

    return booking;
  }

  async checkOut(id: string, userId: string): Promise<IBooking> {
    const booking = await this.findById(id);

    if (!canTransitionTo(booking.status, BookingStatus.CHECKED_OUT)) {
      throw new BadRequestError(
        `Cannot check out booking with status "${booking.status}"`
      );
    }

    booking.status = BookingStatus.CHECKED_OUT;
    booking.checkOutDetails = {
      checkedOutAt: new Date(),
      checkedOutBy: new Types.ObjectId(userId),
    };

    await withTransaction(async (session) => {
      if (booking.assignedRoomId) {
        const room = await Room.findById(booking.assignedRoomId).session(session);
        if (room) {
          room.isOccupied = false;
          room.status = RoomStatus.DIRTY;
          await room.save({ session });
        }
      }

      await booking.save({ session });
    });

    await guestService.updateStayStats(
      booking.guestId.toString(),
      booking.pricing.grandTotal
    );

    const guest = await guestService.findById(booking.guestId.toString());

    emit(EventType.BOOKING_CHECKED_OUT, {
      bookingId: booking._id.toString(),
      confirmationNumber: booking.confirmationNumber,
      propertyId: booking.propertyId.toString(),
      guestId: booking.guestId.toString(),
      guestEmail: guest.email,
      guestName: `${guest.firstName} ${guest.lastName}`,
      checkIn: booking.dates.checkIn,
      checkOut: booking.dates.checkOut,
      roomTypeId: booking.roomTypeId.toString(),
      totalAmount: booking.pricing.grandTotal,
      userId,
      roomId: booking.assignedRoomId?.toString(),
      finalAmount: booking.pricing.grandTotal,
    });

    return booking;
  }

  async assignRoom(id: string, roomId: string): Promise<IBooking> {
    const booking = await this.findById(id);

    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.PENDING
    ) {
      throw new BadRequestError("Can only assign room to pending or confirmed bookings");
    }

    const room = await Room.findById(roomId);
    if (!room || room.propertyId.toString() !== booking.propertyId.toString()) {
      throw new NotFoundError("Room not found for this property");
    }

    if (room.roomTypeId.toString() !== booking.roomTypeId.toString()) {
      throw new BadRequestError("Room type does not match booking");
    }

    booking.assignedRoomId = room._id;
    await booking.save();

    return booking;
  }

  async confirmBooking(id: string): Promise<IBooking> {
    const booking = await this.findById(id);

    if (!canTransitionTo(booking.status, BookingStatus.CONFIRMED)) {
      throw new BadRequestError(
        `Cannot confirm booking with status "${booking.status}"`
      );
    }

    booking.status = BookingStatus.CONFIRMED;
    await booking.save();

    const guest = await guestService.findById(booking.guestId.toString());

    emit(EventType.BOOKING_CONFIRMED, {
      bookingId: booking._id.toString(),
      confirmationNumber: booking.confirmationNumber,
      propertyId: booking.propertyId.toString(),
      guestId: booking.guestId.toString(),
      guestEmail: guest.email,
      guestName: `${guest.firstName} ${guest.lastName}`,
      checkIn: booking.dates.checkIn,
      checkOut: booking.dates.checkOut,
      roomTypeId: booking.roomTypeId.toString(),
      totalAmount: booking.pricing.grandTotal,
    });

    return booking;
  }

  async list(
    filters: ListBookingsFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginatedResult<IBooking>> {
    const query: any = {};

    if (filters.propertyId) {
      query.propertyId = new Types.ObjectId(filters.propertyId);
    }

    if (filters.guestId) {
      query.guestId = new Types.ObjectId(filters.guestId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.checkInFrom || filters.checkInTo) {
      query["dates.checkIn"] = {};
      if (filters.checkInFrom) {
        query["dates.checkIn"].$gte = parseDate(filters.checkInFrom);
      }
      if (filters.checkInTo) {
        query["dates.checkIn"].$lte = parseDate(filters.checkInTo);
      }
    }

    if (filters.confirmationNumber) {
      query.confirmationNumber = filters.confirmationNumber.toUpperCase();
    }

    const pagination = getPaginationParams(page, limit);
    const sort = getSortParams(
      sortBy === "checkIn" ? "dates.checkIn" : sortBy === "checkOut" ? "dates.checkOut" : sortBy,
      sortOrder
    );

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("propertyId", "name")
        .populate("guestId", "firstName lastName email")
        .populate("roomTypeId", "name code")
        .populate("assignedRoomId", "roomNumber")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Booking.countDocuments(query),
    ]);

    return createPaginatedResult(bookings, total, pagination);
  }

  async getGuestBookings(
    guestId: string,
    userId?: string
  ): Promise<IBooking[]> {
    const guest = await guestService.findById(guestId);

    if (userId && guest.userId?.toString() !== userId) {
      throw new ForbiddenError("You can only view your own bookings");
    }

    return Booking.find({ guestId: guest._id })
      .populate("propertyId", "name")
      .populate("roomTypeId", "name")
      .sort({ "dates.checkIn": -1 });
  }

  async getMyBookings(userId: string): Promise<IBooking[]> {
    const guest = await guestService.findByUserId(userId);

    if (!guest) {
      return [];
    }

    return Booking.find({ guestId: guest._id })
      .populate("propertyId", "name")
      .populate("roomTypeId", "name")
      .sort({ "dates.checkIn": -1 });
  }

  async getBookingAddOns(bookingId: string) {
    const booking = await this.findById(bookingId);

    return BookingAddOn.find({ bookingId: booking._id }).populate(
      "addOnId",
      "name code category pricing"
    );
  }

  async recalculateTotals(bookingId: string): Promise<IBooking> {
    const booking = await this.findById(bookingId);

    const addOns = await BookingAddOn.find({ bookingId: booking._id });
    const addOnsTotal = addOns.reduce((sum, addOn) => sum + addOn.totalPrice, 0);

    const subtotal = booking.pricing.roomTotal + addOnsTotal;
    const property = await Property.findById(booking.propertyId);
    const taxRate = property?.settings?.taxRate || 0;
    const taxes = Math.round((subtotal - booking.pricing.discountAmount) * (taxRate / 100) * 100) / 100;
    const grandTotal = subtotal - booking.pricing.discountAmount + taxes;

    booking.pricing.addOnsTotal = addOnsTotal;
    booking.pricing.taxes = taxes;
    booking.pricing.grandTotal = grandTotal;
    booking.payment.amountDue = grandTotal - booking.payment.amountPaid;

    await booking.save();
    return booking;
  }
}

export const bookingService = new BookingService();
