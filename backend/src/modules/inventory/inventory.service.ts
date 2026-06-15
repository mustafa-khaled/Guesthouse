import {
  Inventory,
  IInventory,
  InventoryHold,
  IInventoryHold,
} from "../../models/inventory.model";
import { Property } from "../../models/property.model";
import { RoomType, IRoomType } from "../../models/roomType.model";
import { Room } from "../../models/room.model";
import { RatePlan } from "../../models/ratePlan.model";
import { ratePlanService } from "../ratePlan/ratePlan.service";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../common/errors/http.errors";
import {
  parseDate,
  getDateRange,
  getNightsBetween,
} from "../../common/utils/dateUtils";
import { Types } from "mongoose";

export interface AvailabilityResult {
  roomType: IRoomType;
  available: boolean;
  minAvailableRooms: number;
  ratePlans: {
    id: string;
    name: string;
    code: string;
    basePrice: number;
    totalPrice: number;
    pricePerNight: number;
    inclusions: string[];
    cancellationPolicy: any;
  }[];
}

export interface SearchAvailabilityParams {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  roomTypeId?: string;
}

export interface InventoryUpdate {
  totalRooms?: number;
  blockedRooms?: number;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
  minStay?: number;
  maxStay?: number;
}

const HOLD_DURATION_MINUTES = 10;

class InventoryService {
  async searchAvailability(
    params: SearchAvailabilityParams
  ): Promise<AvailabilityResult[]> {
    const {
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      roomTypeId,
    } = params;

    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const property = await Property.findById(propertyId);
    if (!property || !property.isActive) {
      throw new NotFoundError("Property not found or inactive");
    }

    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);
    const nights = getNightsBetween(checkInDate, checkOutDate);

    if (nights < 1) {
      throw new BadRequestError("Check-out must be after check-in");
    }

    const totalGuests = adults + children;

    const roomTypeQuery: any = {
      propertyId: new Types.ObjectId(propertyId),
      isActive: true,
      isDeleted: false,
      "maxOccupancy.total": { $gte: totalGuests },
    };

    if (roomTypeId) {
      roomTypeQuery._id = new Types.ObjectId(roomTypeId);
    }

    const roomTypes = await RoomType.find(roomTypeQuery);

    const results: AvailabilityResult[] = [];

    for (const roomType of roomTypes) {
      const availability = await this.getAvailabilityForDateRange(
        propertyId,
        roomType._id.toString(),
        checkInDate,
        checkOutDate
      );

      const minAvailable = Math.min(
        ...availability.map((inv) => inv.availableRooms)
      );

      const isAvailable = minAvailable >= rooms;

      const hasClosedDates = availability.some(
        (inv, index) =>
          (index === 0 && inv.closedToArrival) ||
          (index === availability.length - 1 && inv.closedToDeparture)
      );

      if (!isAvailable || hasClosedDates) {
        continue;
      }

      const minStayViolation = availability.some(
        (inv) => inv.minStay && nights < inv.minStay
      );
      const maxStayViolation = availability.some(
        (inv) => inv.maxStay && nights > inv.maxStay
      );

      if (minStayViolation || maxStayViolation) {
        continue;
      }

      const ratePlans = await RatePlan.find({
        roomTypeId: roomType._id,
        isActive: true,
        isDeleted: false,
        $or: [
          { validFrom: { $exists: false } },
          { validFrom: { $lte: checkInDate } },
        ],
        $and: [
          {
            $or: [
              { validTo: { $exists: false } },
              { validTo: { $gte: checkOutDate } },
            ],
          },
        ],
      });

      const ratePlanResults = await Promise.all(
        ratePlans.map(async (rp) => {
          const { total } = await ratePlanService.calculateTotalPrice(
            rp._id.toString(),
            checkInDate,
            checkOutDate
          );

          return {
            id: rp._id.toString(),
            name: rp.name,
            code: rp.code,
            basePrice: rp.basePrice,
            totalPrice: total * rooms,
            pricePerNight: Math.round((total / nights) * 100) / 100,
            inclusions: rp.inclusions,
            cancellationPolicy: rp.cancellationPolicy,
          };
        })
      );

      ratePlanResults.sort((a, b) => a.totalPrice - b.totalPrice);

      results.push({
        roomType,
        available: true,
        minAvailableRooms: minAvailable,
        ratePlans: ratePlanResults,
      });
    }

    return results;
  }

  async getAvailabilityForDateRange(
    propertyId: string,
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<IInventory[]> {
    const dates = getDateRange(checkIn, checkOut);
    dates.pop();

    const inventory = await Inventory.find({
      propertyId: new Types.ObjectId(propertyId),
      roomTypeId: new Types.ObjectId(roomTypeId),
      date: { $in: dates },
    }).sort({ date: 1 });

    const inventoryMap = new Map(
      inventory.map((inv) => [inv.date.toISOString().split("T")[0], inv])
    );

    const totalRooms = await Room.countDocuments({
      propertyId: new Types.ObjectId(propertyId),
      roomTypeId: new Types.ObjectId(roomTypeId),
      isActive: true,
      isDeleted: false,
    });

    const result: IInventory[] = [];
    for (const date of dates) {
      const dateKey = date.toISOString().split("T")[0];
      const existing = inventoryMap.get(dateKey);

      if (existing) {
        result.push(existing);
      } else {
        result.push({
          propertyId: new Types.ObjectId(propertyId),
          roomTypeId: new Types.ObjectId(roomTypeId),
          date,
          totalRooms,
          bookedRooms: 0,
          heldRooms: 0,
          blockedRooms: 0,
          availableRooms: totalRooms,
          closedToArrival: false,
          closedToDeparture: false,
        } as IInventory);
      }
    }

    return result;
  }

  async getInventoryCalendar(
    propertyId: string,
    startDate: string,
    endDate: string,
    roomTypeId?: string
  ): Promise<IInventory[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const query: any = {
      propertyId: new Types.ObjectId(propertyId),
      date: { $gte: start, $lte: end },
    };

    if (roomTypeId) {
      query.roomTypeId = new Types.ObjectId(roomTypeId);
    }

    return Inventory.find(query)
      .populate("roomTypeId", "name code")
      .sort({ roomTypeId: 1, date: 1 });
  }

  async bulkUpdateInventory(
    propertyId: string,
    roomTypeId: string,
    startDate: string,
    endDate: string,
    updates: InventoryUpdate
  ): Promise<number> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }
    if (!Types.ObjectId.isValid(roomTypeId)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType || roomType.propertyId.toString() !== propertyId) {
      throw new NotFoundError("Room type not found for this property");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const dates = getDateRange(start, end);

    const bulkOps = dates.map((date) => ({
      updateOne: {
        filter: {
          propertyId: new Types.ObjectId(propertyId),
          roomTypeId: new Types.ObjectId(roomTypeId),
          date,
        },
        update: {
          $set: updates,
        },
        upsert: true,
      },
    }));

    const result = await Inventory.bulkWrite(bulkOps);
    return result.modifiedCount + result.upsertedCount;
  }

  async initializeInventory(
    propertyId: string,
    roomTypeId: string,
    startDate: string,
    endDate: string,
    totalRooms: number
  ): Promise<number> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }
    if (!Types.ObjectId.isValid(roomTypeId)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType || roomType.propertyId.toString() !== propertyId) {
      throw new NotFoundError("Room type not found for this property");
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const dates = getDateRange(start, end);

    const bulkOps = dates.map((date) => ({
      updateOne: {
        filter: {
          propertyId: new Types.ObjectId(propertyId),
          roomTypeId: new Types.ObjectId(roomTypeId),
          date,
        },
        update: {
          $setOnInsert: {
            propertyId: new Types.ObjectId(propertyId),
            roomTypeId: new Types.ObjectId(roomTypeId),
            date,
            totalRooms,
            bookedRooms: 0,
            heldRooms: 0,
            blockedRooms: 0,
            availableRooms: totalRooms,
            closedToArrival: false,
            closedToDeparture: false,
          },
        },
        upsert: true,
      },
    }));

    const result = await Inventory.bulkWrite(bulkOps);
    return result.upsertedCount;
  }

  async createHold(
    propertyId: string,
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    rooms: number,
    sessionId: string,
    userId?: string
  ): Promise<IInventoryHold> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }
    if (!Types.ObjectId.isValid(roomTypeId)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const checkInDate = parseDate(checkIn);
    const checkOutDate = parseDate(checkOut);

    const availability = await this.getAvailabilityForDateRange(
      propertyId,
      roomTypeId,
      checkInDate,
      checkOutDate
    );

    const minAvailable = Math.min(
      ...availability.map((inv) => inv.availableRooms)
    );

    if (minAvailable < rooms) {
      throw new ConflictError("Not enough rooms available for the selected dates");
    }

    const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

    const hold = new InventoryHold({
      propertyId: new Types.ObjectId(propertyId),
      roomTypeId: new Types.ObjectId(roomTypeId),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      rooms,
      sessionId,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      expiresAt,
    });

    await hold.save();

    const dates = getDateRange(checkInDate, checkOutDate);
    dates.pop();

    await Inventory.updateMany(
      {
        propertyId: new Types.ObjectId(propertyId),
        roomTypeId: new Types.ObjectId(roomTypeId),
        date: { $in: dates },
      },
      {
        $inc: { heldRooms: rooms, availableRooms: -rooms },
      }
    );

    return hold;
  }

  async releaseHold(holdId: string): Promise<void> {
    if (!Types.ObjectId.isValid(holdId)) {
      throw new BadRequestError("Invalid hold ID");
    }

    const hold = await InventoryHold.findById(holdId);
    if (!hold) {
      throw new NotFoundError("Hold not found");
    }

    const dates = getDateRange(hold.checkIn, hold.checkOut);
    dates.pop();

    await Inventory.updateMany(
      {
        propertyId: hold.propertyId,
        roomTypeId: hold.roomTypeId,
        date: { $in: dates },
      },
      {
        $inc: { heldRooms: -hold.rooms, availableRooms: hold.rooms },
      }
    );

    await InventoryHold.findByIdAndDelete(holdId);
  }

  async convertHoldToBooking(holdId: string): Promise<void> {
    if (!Types.ObjectId.isValid(holdId)) {
      throw new BadRequestError("Invalid hold ID");
    }

    const hold = await InventoryHold.findById(holdId);
    if (!hold) {
      throw new NotFoundError("Hold not found or expired");
    }

    const dates = getDateRange(hold.checkIn, hold.checkOut);
    dates.pop();

    await Inventory.updateMany(
      {
        propertyId: hold.propertyId,
        roomTypeId: hold.roomTypeId,
        date: { $in: dates },
      },
      {
        $inc: {
          heldRooms: -hold.rooms,
          bookedRooms: hold.rooms,
        },
      }
    );

    await InventoryHold.findByIdAndDelete(holdId);
  }

  async incrementBookedRooms(
    propertyId: string,
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
    rooms: number
  ): Promise<void> {
    const dates = getDateRange(checkIn, checkOut);
    dates.pop();

    await Inventory.updateMany(
      {
        propertyId: new Types.ObjectId(propertyId),
        roomTypeId: new Types.ObjectId(roomTypeId),
        date: { $in: dates },
      },
      {
        $inc: { bookedRooms: rooms, availableRooms: -rooms },
      }
    );
  }

  async decrementBookedRooms(
    propertyId: string,
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
    rooms: number
  ): Promise<void> {
    const dates = getDateRange(checkIn, checkOut);
    dates.pop();

    await Inventory.updateMany(
      {
        propertyId: new Types.ObjectId(propertyId),
        roomTypeId: new Types.ObjectId(roomTypeId),
        date: { $in: dates },
      },
      {
        $inc: { bookedRooms: -rooms, availableRooms: rooms },
      }
    );
  }
}

export const inventoryService = new InventoryService();
