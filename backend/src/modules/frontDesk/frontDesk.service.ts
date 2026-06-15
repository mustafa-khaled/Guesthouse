import { Booking, IBooking } from "../../models/booking.model";
import { Room, IRoom } from "../../models/room.model";
import { RoomType } from "../../models/roomType.model";
import { Guest } from "../../models/guest.model";
import { HousekeepingTask } from "../../models/housekeepingTask.model";
import { bookingService } from "../booking/booking.service";
import { inventoryService } from "../inventory/inventory.service";
import { housekeepingService } from "../housekeeping/housekeeping.service";
import { guestService } from "../guest/guest.service";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../common/errors/http.errors";
import { BookingStatus, BookingSource } from "../../common/enums/bookingStatus.enum";
import { RoomStatus, HousekeepingTaskStatus } from "../../common/enums/roomStatus.enum";
import { getTodayUTC, getStartOfDay, getEndOfDay, addDays, parseDate, getNightsBetween } from "../../common/utils/dateUtils";
import { Types } from "mongoose";

class FrontDeskService {
  async getArrivals(propertyId: string, date?: string): Promise<IBooking[]> {
    const targetDate = date ? parseDate(date) : getTodayUTC();
    const startOfDay = getStartOfDay(targetDate);
    const endOfDay = getEndOfDay(targetDate);

    return Booking.find({
      propertyId: new Types.ObjectId(propertyId),
      "dates.checkIn": { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    })
      .populate("guestId", "firstName lastName email phone tags")
      .populate("roomTypeId", "name code")
      .populate("assignedRoomId", "roomNumber floor")
      .sort({ "dates.checkIn": 1 });
  }

  async getDepartures(propertyId: string, date?: string): Promise<IBooking[]> {
    const targetDate = date ? parseDate(date) : getTodayUTC();
    const startOfDay = getStartOfDay(targetDate);
    const endOfDay = getEndOfDay(targetDate);

    return Booking.find({
      propertyId: new Types.ObjectId(propertyId),
      "dates.checkOut": { $gte: startOfDay, $lte: endOfDay },
      status: BookingStatus.CHECKED_IN,
    })
      .populate("guestId", "firstName lastName email phone")
      .populate("roomTypeId", "name code")
      .populate("assignedRoomId", "roomNumber floor")
      .sort({ "dates.checkOut": 1 });
  }

  async getInHouseGuests(propertyId: string): Promise<IBooking[]> {
    return Booking.find({
      propertyId: new Types.ObjectId(propertyId),
      status: BookingStatus.CHECKED_IN,
    })
      .populate("guestId", "firstName lastName email phone tags")
      .populate("roomTypeId", "name code")
      .populate("assignedRoomId", "roomNumber floor status")
      .sort({ "assignedRoomId.roomNumber": 1 });
  }

  async getRoomRack(propertyId: string): Promise<{
    rooms: any[];
    summary: {
      total: number;
      occupied: number;
      available: number;
      dirty: number;
      maintenance: number;
      outOfOrder: number;
    };
  }> {
    const rooms = await Room.find({
      propertyId: new Types.ObjectId(propertyId),
      isActive: true,
      isDeleted: false,
    })
      .populate("roomTypeId", "name code")
      .sort({ floor: 1, roomNumber: 1 });

    const today = getTodayUTC();
    const tomorrow = addDays(today, 1);

    const checkedInBookings = await Booking.find({
      propertyId: new Types.ObjectId(propertyId),
      status: BookingStatus.CHECKED_IN,
      assignedRoomId: { $exists: true },
    })
      .populate("guestId", "firstName lastName")
      .select("assignedRoomId guestId dates");

    const bookingsByRoom = new Map();
    for (const booking of checkedInBookings) {
      if (booking.assignedRoomId) {
        bookingsByRoom.set(booking.assignedRoomId.toString(), booking);
      }
    }

    const roomsWithBookings = rooms.map((room) => {
      const booking = bookingsByRoom.get(room._id.toString());
      return {
        ...room.toObject(),
        currentBooking: booking
          ? {
              guestName: `${(booking.guestId as any).firstName} ${(booking.guestId as any).lastName}`,
              checkOut: booking.dates.checkOut,
            }
          : null,
      };
    });

    const summary = {
      total: rooms.length,
      occupied: rooms.filter((r) => r.isOccupied).length,
      available: rooms.filter(
        (r) => !r.isOccupied && (r.status === RoomStatus.CLEAN || r.status === RoomStatus.INSPECTED)
      ).length,
      dirty: rooms.filter((r) => r.status === RoomStatus.DIRTY).length,
      maintenance: rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length,
      outOfOrder: rooms.filter((r) => r.status === RoomStatus.OUT_OF_ORDER).length,
    };

    return { rooms: roomsWithBookings, summary };
  }

  async createWalkIn(
    propertyId: string,
    data: {
      roomTypeId: string;
      ratePlanId: string;
      nights: number;
      guest: { email: string; firstName: string; lastName: string; phone?: string };
      adults: number;
      children?: number;
      roomId: string;
    },
    userId: string
  ): Promise<IBooking> {
    const today = getTodayUTC();
    const checkOut = addDays(today, data.nights);

    const booking = await bookingService.create(
      {
        propertyId,
        roomTypeId: data.roomTypeId,
        ratePlanId: data.ratePlanId,
        checkIn: today.toISOString().split("T")[0],
        checkOut: checkOut.toISOString().split("T")[0],
        adults: data.adults,
        children: data.children || 0,
        rooms: 1,
        guest: data.guest,
        source: BookingSource.WALK_IN,
      },
      userId
    );

    const confirmedBooking = await bookingService.confirmBooking(booking._id.toString());

    const checkedInBooking = await bookingService.checkIn(
      confirmedBooking._id.toString(),
      data.roomId,
      userId
    );

    return checkedInBooking;
  }

  async moveRoom(
    bookingId: string,
    newRoomId: string,
    userId: string,
    reason?: string
  ): Promise<IBooking> {
    const booking = await bookingService.findById(bookingId);

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestError("Can only move room for checked-in guests");
    }

    const newRoom = await Room.findById(newRoomId);
    if (!newRoom || newRoom.propertyId.toString() !== booking.propertyId.toString()) {
      throw new NotFoundError("Room not found for this property");
    }

    if (newRoom.isOccupied) {
      throw new ConflictError("Target room is already occupied");
    }

    if (newRoom.status !== RoomStatus.CLEAN && newRoom.status !== RoomStatus.INSPECTED) {
      throw new BadRequestError(`Target room is not ready (status: ${newRoom.status})`);
    }

    if (booking.assignedRoomId) {
      const oldRoom = await Room.findById(booking.assignedRoomId);
      if (oldRoom) {
        oldRoom.isOccupied = false;
        oldRoom.status = RoomStatus.DIRTY;
        await oldRoom.save();

        await housekeepingService.createCheckoutTask(
          booking.propertyId.toString(),
          oldRoom._id.toString(),
          booking._id.toString()
        );
      }
    }

    booking.assignedRoomId = newRoom._id;
    if (reason) {
      booking.internalNotes = `${booking.internalNotes || ""}\n[Room Move] ${reason}`.trim();
    }
    await booking.save();

    newRoom.isOccupied = true;
    await newRoom.save();

    return booking;
  }

  async extendStay(
    bookingId: string,
    newCheckOut: string,
    userId: string
  ): Promise<IBooking> {
    const booking = await bookingService.findById(bookingId);

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestError("Can only extend stay for checked-in guests");
    }

    const newCheckOutDate = parseDate(newCheckOut);
    const currentCheckOut = new Date(booking.dates.checkOut);

    if (newCheckOutDate <= currentCheckOut) {
      throw new BadRequestError("New check-out date must be after current check-out date");
    }

    const additionalNights = getNightsBetween(currentCheckOut, newCheckOutDate);

    const availability = await inventoryService.getAvailabilityForDateRange(
      booking.propertyId.toString(),
      booking.roomTypeId.toString(),
      currentCheckOut,
      newCheckOutDate
    );

    const minAvailable = Math.min(...availability.map((inv) => inv.availableRooms));
    if (minAvailable < 1) {
      throw new ConflictError("Room type not available for the extended dates");
    }

    await inventoryService.incrementBookedRooms(
      booking.propertyId.toString(),
      booking.roomTypeId.toString(),
      currentCheckOut,
      newCheckOutDate,
      1
    );

    const additionalCost = booking.pricing.roomRate * additionalNights;
    
    booking.dates.checkOut = newCheckOutDate;
    booking.dates.nights += additionalNights;
    booking.pricing.roomTotal += additionalCost;
    booking.pricing.grandTotal += additionalCost;
    booking.payment.amountDue += additionalCost;
    booking.internalNotes = `${booking.internalNotes || ""}\n[Stay Extended] +${additionalNights} nights`.trim();

    await booking.save();

    return booking;
  }

  async earlyCheckout(bookingId: string, userId: string): Promise<IBooking> {
    const booking = await bookingService.findById(bookingId);

    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestError("Guest is not checked in");
    }

    const today = getTodayUTC();
    const originalCheckOut = new Date(booking.dates.checkOut);

    if (today >= originalCheckOut) {
      return bookingService.checkOut(bookingId, userId);
    }

    const unusedNights = getNightsBetween(today, originalCheckOut);

    await inventoryService.decrementBookedRooms(
      booking.propertyId.toString(),
      booking.roomTypeId.toString(),
      today,
      originalCheckOut,
      1
    );

    booking.dates.checkOut = today;
    booking.dates.nights -= unusedNights;
    booking.internalNotes = `${booking.internalNotes || ""}\n[Early Checkout] ${unusedNights} nights unused`.trim();

    await booking.save();

    return bookingService.checkOut(bookingId, userId);
  }
}

export const frontDeskService = new FrontDeskService();
