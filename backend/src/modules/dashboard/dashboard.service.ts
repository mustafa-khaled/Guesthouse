import { Booking } from "../../models/booking.model";
import { Room } from "../../models/room.model";
import { Property } from "../../models/property.model";
import { Guest } from "../../models/guest.model";
import { Payment } from "../../models/payment.model";
import { HousekeepingTask } from "../../models/housekeepingTask.model";
import { BadRequestError } from "../../common/errors/http.errors";
import { BookingStatus } from "../../common/enums/bookingStatus.enum";
import { RoomStatus, HousekeepingTaskStatus } from "../../common/enums/roomStatus.enum";
import { PaymentStatusEnum } from "../../models/payment.model";
import { getTodayUTC, addDays, getStartOfDay, getEndOfDay } from "../../common/utils/dateUtils";
import { Types } from "mongoose";

class DashboardService {
  async getPropertyDashboard(propertyId: string): Promise<any> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const today = getTodayUTC();
    const todayStart = getStartOfDay(today);
    const todayEnd = getEndOfDay(today);
    const weekFromNow = addDays(today, 7);

    const [
      roomStats,
      todayArrivals,
      todayDepartures,
      inHouseGuests,
      todayRevenue,
      upcomingArrivals,
      housekeepingStats,
      recentBookings,
    ] = await Promise.all([
      this.getRoomStats(propertyId),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        "dates.checkIn": { $gte: todayStart, $lte: todayEnd },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      }),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        "dates.checkOut": { $gte: todayStart, $lte: todayEnd },
        status: BookingStatus.CHECKED_IN,
      }),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        status: BookingStatus.CHECKED_IN,
      }),
      this.getTodayRevenue(propertyId, todayStart, todayEnd),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        "dates.checkIn": { $gte: todayEnd, $lte: weekFromNow },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
      }),
      this.getHousekeepingStats(propertyId),
      Booking.find({
        propertyId: new Types.ObjectId(propertyId),
      })
        .populate("guestId", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("confirmationNumber guestId dates status pricing createdAt"),
    ]);

    return {
      date: today.toISOString().split("T")[0],
      rooms: roomStats,
      today: {
        arrivals: todayArrivals,
        departures: todayDepartures,
        inHouse: inHouseGuests,
        revenue: todayRevenue,
      },
      upcoming: {
        arrivalsNext7Days: upcomingArrivals,
      },
      housekeeping: housekeepingStats,
      recentBookings,
    };
  }

  async getManagerDashboard(propertyId?: string): Promise<any> {
    const today = getTodayUTC();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const propertyFilter = propertyId
      ? { propertyId: new Types.ObjectId(propertyId) }
      : {};

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      occupancyRate,
      topPerformingRoomTypes,
      bookingsBySource,
    ] = await Promise.all([
      Booking.countDocuments({
        ...propertyFilter,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),
      Booking.countDocuments({
        ...propertyFilter,
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] },
      }),
      Booking.countDocuments({
        ...propertyFilter,
        "cancellation.cancelledAt": { $gte: monthStart, $lte: monthEnd },
      }),
      this.getMonthRevenue(propertyId, monthStart, monthEnd),
      this.getAverageOccupancy(propertyId, monthStart, today),
      this.getTopRoomTypes(propertyId, monthStart, monthEnd),
      this.getBookingsBySource(propertyId, monthStart, monthEnd),
    ]);

    return {
      period: {
        start: monthStart.toISOString().split("T")[0],
        end: monthEnd.toISOString().split("T")[0],
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        conversionRate:
          totalBookings > 0
            ? Math.round((confirmedBookings / totalBookings) * 10000) / 100
            : 0,
      },
      revenue: totalRevenue,
      occupancy: occupancyRate,
      topRoomTypes: topPerformingRoomTypes,
      bookingsBySource,
    };
  }

  private async getRoomStats(propertyId: string) {
    const rooms = await Room.find({
      propertyId: new Types.ObjectId(propertyId),
      isActive: true,
      isDeleted: false,
    });

    const stats = {
      total: rooms.length,
      occupied: 0,
      available: 0,
      dirty: 0,
      clean: 0,
      maintenance: 0,
      outOfOrder: 0,
    };

    for (const room of rooms) {
      if (room.isOccupied) stats.occupied++;
      else stats.available++;

      switch (room.status) {
        case RoomStatus.DIRTY:
          stats.dirty++;
          break;
        case RoomStatus.CLEAN:
        case RoomStatus.INSPECTED:
          stats.clean++;
          break;
        case RoomStatus.MAINTENANCE:
          stats.maintenance++;
          break;
        case RoomStatus.OUT_OF_ORDER:
          stats.outOfOrder++;
          break;
      }
    }

    stats.available = stats.clean - stats.occupied;
    if (stats.available < 0) stats.available = 0;

    return stats;
  }

  private async getTodayRevenue(
    propertyId: string,
    start: Date,
    end: Date
  ): Promise<number> {
    const result = await Payment.aggregate([
      {
        $match: {
          processedAt: { $gte: start, $lte: end },
          status: PaymentStatusEnum.COMPLETED,
          amount: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "bookingId",
          foreignField: "_id",
          as: "booking",
        },
      },
      {
        $unwind: "$booking",
      },
      {
        $match: {
          "booking.propertyId": new Types.ObjectId(propertyId),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  private async getHousekeepingStats(propertyId: string) {
    const today = getTodayUTC();
    const todayStart = getStartOfDay(today);
    const todayEnd = getEndOfDay(today);

    const tasks = await HousekeepingTask.aggregate([
      {
        $match: {
          propertyId: new Types.ObjectId(propertyId),
          scheduledDate: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      verified: 0,
    };

    for (const task of tasks) {
      switch (task._id) {
        case HousekeepingTaskStatus.PENDING:
          stats.pending = task.count;
          break;
        case HousekeepingTaskStatus.IN_PROGRESS:
          stats.inProgress = task.count;
          break;
        case HousekeepingTaskStatus.COMPLETED:
          stats.completed = task.count;
          break;
        case HousekeepingTaskStatus.VERIFIED:
          stats.verified = task.count;
          break;
      }
    }

    return stats;
  }

  private async getMonthRevenue(
    propertyId: string | undefined,
    start: Date,
    end: Date
  ): Promise<number> {
    const pipeline: any[] = [
      {
        $match: {
          processedAt: { $gte: start, $lte: end },
          status: PaymentStatusEnum.COMPLETED,
          amount: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "bookingId",
          foreignField: "_id",
          as: "booking",
        },
      },
      {
        $unwind: "$booking",
      },
    ];

    if (propertyId) {
      pipeline.push({
        $match: {
          "booking.propertyId": new Types.ObjectId(propertyId),
        },
      });
    }

    pipeline.push({
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    });

    const result = await Payment.aggregate(pipeline);
    return Math.round((result[0]?.total || 0) * 100) / 100;
  }

  private async getAverageOccupancy(
    propertyId: string | undefined,
    start: Date,
    end: Date
  ): Promise<number> {
    const roomFilter = propertyId
      ? { propertyId: new Types.ObjectId(propertyId), isActive: true, isDeleted: false }
      : { isActive: true, isDeleted: false };

    const totalRooms = await Room.countDocuments(roomFilter);

    if (totalRooms === 0) return 0;

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalRoomNights = totalRooms * days;

    const bookingFilter: any = {
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] },
      "dates.checkIn": { $lte: end },
      "dates.checkOut": { $gte: start },
    };

    if (propertyId) {
      bookingFilter.propertyId = new Types.ObjectId(propertyId);
    }

    const bookings = await Booking.find(bookingFilter).select("dates occupancy");

    let occupiedNights = 0;
    for (const booking of bookings) {
      const checkIn = new Date(Math.max(booking.dates.checkIn.getTime(), start.getTime()));
      const checkOut = new Date(Math.min(booking.dates.checkOut.getTime(), end.getTime()));
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      occupiedNights += nights * (booking.occupancy.rooms || 1);
    }

    return Math.round((occupiedNights / totalRoomNights) * 10000) / 100;
  }

  private async getTopRoomTypes(
    propertyId: string | undefined,
    start: Date,
    end: Date
  ): Promise<any[]> {
    const matchFilter: any = {
      createdAt: { $gte: start, $lte: end },
      status: { $nin: [BookingStatus.CANCELLED] },
    };

    if (propertyId) {
      matchFilter.propertyId = new Types.ObjectId(propertyId);
    }

    const result = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$roomTypeId",
          bookings: { $sum: 1 },
          revenue: { $sum: "$pricing.roomTotal" },
        },
      },
      {
        $lookup: {
          from: "roomtypes",
          localField: "_id",
          foreignField: "_id",
          as: "roomType",
        },
      },
      { $unwind: "$roomType" },
      {
        $project: {
          name: "$roomType.name",
          bookings: 1,
          revenue: { $round: ["$revenue", 2] },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return result;
  }

  private async getBookingsBySource(
    propertyId: string | undefined,
    start: Date,
    end: Date
  ): Promise<any[]> {
    const matchFilter: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (propertyId) {
      matchFilter.propertyId = new Types.ObjectId(propertyId);
    }

    const result = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.grandTotal" },
        },
      },
      {
        $project: {
          source: "$_id",
          count: 1,
          revenue: { $round: ["$revenue", 2] },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return result;
  }
}

export const dashboardService = new DashboardService();
