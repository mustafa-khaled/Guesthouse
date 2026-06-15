import { Booking } from "../../models/booking.model";
import { Room } from "../../models/room.model";
import { Payment } from "../../models/payment.model";
import { Inventory } from "../../models/inventory.model";
import { BadRequestError } from "../../common/errors/http.errors";
import { BookingStatus, PaymentStatus } from "../../common/enums/bookingStatus.enum";
import { PaymentStatusEnum } from "../../models/payment.model";
import { parseDate, getDateRange, formatDate } from "../../common/utils/dateUtils";
import { Types } from "mongoose";

export interface DailyMetrics {
  date: string;
  occupancyRate: number;
  adr: number;
  revpar: number;
  roomsOccupied: number;
  roomsAvailable: number;
  roomRevenue: number;
  addOnRevenue: number;
  totalRevenue: number;
  arrivals: number;
  departures: number;
  cancellations: number;
  noShows: number;
}

export interface RevenueReport {
  period: string;
  roomRevenue: number;
  addOnRevenue: number;
  totalRevenue: number;
  refunds: number;
  netRevenue: number;
}

class ReportsService {
  async getOccupancyReport(
    propertyId: string,
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<DailyMetrics[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const dates = getDateRange(start, end);

    const totalRooms = await Room.countDocuments({
      propertyId: new Types.ObjectId(propertyId),
      isActive: true,
      isDeleted: false,
    });

    const results: DailyMetrics[] = [];

    for (const date of dates) {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [occupiedRooms, arrivals, departures, cancellations, noShows, revenue] =
        await Promise.all([
          Booking.countDocuments({
            propertyId: new Types.ObjectId(propertyId),
            "dates.checkIn": { $lte: date },
            "dates.checkOut": { $gt: date },
            status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
          }),
          Booking.countDocuments({
            propertyId: new Types.ObjectId(propertyId),
            "dates.checkIn": { $gte: date, $lt: nextDate },
            status: { $nin: [BookingStatus.CANCELLED] },
          }),
          Booking.countDocuments({
            propertyId: new Types.ObjectId(propertyId),
            "dates.checkOut": { $gte: date, $lt: nextDate },
            status: BookingStatus.CHECKED_OUT,
          }),
          Booking.countDocuments({
            propertyId: new Types.ObjectId(propertyId),
            "cancellation.cancelledAt": { $gte: date, $lt: nextDate },
          }),
          Booking.countDocuments({
            propertyId: new Types.ObjectId(propertyId),
            "dates.checkIn": { $gte: date, $lt: nextDate },
            status: BookingStatus.NO_SHOW,
          }),
          this.getDailyRevenue(propertyId, date),
        ]);

      const occupancyRate = totalRooms > 0 ? occupiedRooms / totalRooms : 0;
      const adr = occupiedRooms > 0 ? revenue.roomRevenue / occupiedRooms : 0;
      const revpar = totalRooms > 0 ? revenue.roomRevenue / totalRooms : 0;

      results.push({
        date: formatDate(date),
        occupancyRate: Math.round(occupancyRate * 10000) / 100,
        adr: Math.round(adr * 100) / 100,
        revpar: Math.round(revpar * 100) / 100,
        roomsOccupied: occupiedRooms,
        roomsAvailable: totalRooms - occupiedRooms,
        roomRevenue: revenue.roomRevenue,
        addOnRevenue: revenue.addOnRevenue,
        totalRevenue: revenue.totalRevenue,
        arrivals,
        departures,
        cancellations,
        noShows,
      });
    }

    if (groupBy !== "day") {
      return this.aggregateByPeriod(results, groupBy);
    }

    return results;
  }

  async getRevenueReport(
    propertyId: string,
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<RevenueReport[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const payments = await Payment.aggregate([
      {
        $match: {
          processedAt: { $gte: start, $lte: end },
          status: PaymentStatusEnum.COMPLETED,
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
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$processedAt" },
          },
          payments: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
          refunds: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const results: RevenueReport[] = payments.map((p) => ({
      period: p._id,
      roomRevenue: p.payments * 0.85,
      addOnRevenue: p.payments * 0.15,
      totalRevenue: p.payments,
      refunds: p.refunds,
      netRevenue: p.payments - p.refunds,
    }));

    return results;
  }

  async getRoomTypePerformance(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const performance = await Booking.aggregate([
      {
        $match: {
          propertyId: new Types.ObjectId(propertyId),
          "dates.checkIn": { $gte: start },
          "dates.checkOut": { $lte: end },
          status: { $nin: [BookingStatus.CANCELLED] },
        },
      },
      {
        $group: {
          _id: "$roomTypeId",
          bookings: { $sum: 1 },
          roomNights: { $sum: "$dates.nights" },
          revenue: { $sum: "$pricing.roomTotal" },
          avgRate: { $avg: "$pricing.roomRate" },
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
      {
        $unwind: "$roomType",
      },
      {
        $project: {
          roomTypeName: "$roomType.name",
          roomTypeCode: "$roomType.code",
          bookings: 1,
          roomNights: 1,
          revenue: { $round: ["$revenue", 2] },
          avgRate: { $round: ["$avgRate", 2] },
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ]);

    return performance;
  }

  async getSourceAnalysis(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const analysis = await Booking.aggregate([
      {
        $match: {
          propertyId: new Types.ObjectId(propertyId),
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$source",
          bookings: { $sum: 1 },
          revenue: { $sum: "$pricing.grandTotal" },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", BookingStatus.CANCELLED] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          source: "$_id",
          bookings: 1,
          revenue: { $round: ["$revenue", 2] },
          cancelled: 1,
          cancellationRate: {
            $round: [{ $multiply: [{ $divide: ["$cancelled", "$bookings"] }, 100] }, 2],
          },
        },
      },
      {
        $sort: { bookings: -1 },
      },
    ]);

    return analysis;
  }

  async getCancellationAnalysis(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const [totalBookings, cancellations, byReason] = await Promise.all([
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        createdAt: { $gte: start, $lte: end },
      }),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        status: BookingStatus.CANCELLED,
        "cancellation.cancelledAt": { $gte: start, $lte: end },
      }),
      Booking.aggregate([
        {
          $match: {
            propertyId: new Types.ObjectId(propertyId),
            status: BookingStatus.CANCELLED,
            "cancellation.cancelledAt": { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: "$cancellation.reason",
            count: { $sum: 1 },
            refundTotal: { $sum: "$cancellation.refundAmount" },
          },
        },
      ]),
    ]);

    return {
      totalBookings,
      cancellations,
      cancellationRate: totalBookings > 0 ? Math.round((cancellations / totalBookings) * 10000) / 100 : 0,
      byReason,
    };
  }

  async getDailySummary(propertyId: string, date?: string): Promise<any> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const targetDate = date ? parseDate(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [arrivals, departures, inHouse, revenue, occupancy] = await Promise.all([
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        "dates.checkIn": { $gte: targetDate, $lt: nextDate },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      }),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        "dates.checkOut": { $gte: targetDate, $lt: nextDate },
        status: BookingStatus.CHECKED_IN,
      }),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        status: BookingStatus.CHECKED_IN,
      }),
      this.getDailyRevenue(propertyId, targetDate),
      this.getDailyOccupancy(propertyId, targetDate),
    ]);

    return {
      date: formatDate(targetDate),
      arrivals,
      departures,
      inHouse,
      ...revenue,
      ...occupancy,
    };
  }

  private async getDailyRevenue(
    propertyId: string,
    date: Date
  ): Promise<{ roomRevenue: number; addOnRevenue: number; totalRevenue: number }> {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const result = await Payment.aggregate([
      {
        $match: {
          processedAt: { $gte: date, $lt: nextDate },
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

    const totalRevenue = result[0]?.total || 0;

    return {
      roomRevenue: Math.round(totalRevenue * 0.85 * 100) / 100,
      addOnRevenue: Math.round(totalRevenue * 0.15 * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }

  private async getDailyOccupancy(
    propertyId: string,
    date: Date
  ): Promise<{ occupancyRate: number; roomsOccupied: number; totalRooms: number }> {
    const [totalRooms, occupiedRooms] = await Promise.all([
      Room.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        isActive: true,
        isDeleted: false,
      }),
      Booking.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        "dates.checkIn": { $lte: date },
        "dates.checkOut": { $gt: date },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      }),
    ]);

    const occupancyRate = totalRooms > 0 ? occupiedRooms / totalRooms : 0;

    return {
      occupancyRate: Math.round(occupancyRate * 10000) / 100,
      roomsOccupied: occupiedRooms,
      totalRooms,
    };
  }

  private aggregateByPeriod(
    dailyData: DailyMetrics[],
    groupBy: "week" | "month"
  ): DailyMetrics[] {
    const groups = new Map<string, DailyMetrics[]>();

    for (const day of dailyData) {
      const date = new Date(day.date);
      let key: string;

      if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = formatDate(weekStart);
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(day);
    }

    const aggregated: DailyMetrics[] = [];

    for (const [period, days] of groups) {
      const avgOccupancy = days.reduce((sum, d) => sum + d.occupancyRate, 0) / days.length;
      const totalRoomRevenue = days.reduce((sum, d) => sum + d.roomRevenue, 0);
      const totalOccupied = days.reduce((sum, d) => sum + d.roomsOccupied, 0);

      aggregated.push({
        date: period,
        occupancyRate: Math.round(avgOccupancy * 100) / 100,
        adr: totalOccupied > 0 ? Math.round((totalRoomRevenue / totalOccupied) * 100) / 100 : 0,
        revpar: Math.round((days.reduce((sum, d) => sum + d.revpar, 0) / days.length) * 100) / 100,
        roomsOccupied: totalOccupied,
        roomsAvailable: days.reduce((sum, d) => sum + d.roomsAvailable, 0),
        roomRevenue: Math.round(totalRoomRevenue * 100) / 100,
        addOnRevenue: Math.round(days.reduce((sum, d) => sum + d.addOnRevenue, 0) * 100) / 100,
        totalRevenue: Math.round(days.reduce((sum, d) => sum + d.totalRevenue, 0) * 100) / 100,
        arrivals: days.reduce((sum, d) => sum + d.arrivals, 0),
        departures: days.reduce((sum, d) => sum + d.departures, 0),
        cancellations: days.reduce((sum, d) => sum + d.cancellations, 0),
        noShows: days.reduce((sum, d) => sum + d.noShows, 0),
      });
    }

    return aggregated;
  }
}

export const reportsService = new ReportsService();
