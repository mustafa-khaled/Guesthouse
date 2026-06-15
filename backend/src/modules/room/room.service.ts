import { Room, IRoom } from "../../models/room.model";
import { Property } from "../../models/property.model";
import { RoomType } from "../../models/roomType.model";
import { Inventory } from "../../models/inventory.model";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../common/errors/http.errors";
import {
  getPaginationParams,
  createPaginatedResult,
  PaginatedResult,
} from "../../common/utils/pagination";
import { RoomStatus, canTransitionRoomTo } from "../../common/enums/roomStatus.enum";
import { Types } from "mongoose";

export interface CreateRoomData {
  roomTypeId: string;
  roomNumber: string;
  floor?: number;
  status?: RoomStatus;
  features?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface UpdateRoomData {
  roomTypeId?: string;
  roomNumber?: string;
  floor?: number;
  features?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface ListRoomsFilters {
  roomTypeId?: string;
  status?: RoomStatus;
  floor?: number;
  isOccupied?: boolean;
  isActive?: boolean;
}

class RoomService {
  async create(propertyId: string, data: CreateRoomData): Promise<IRoom> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    if (!Types.ObjectId.isValid(data.roomTypeId)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const roomType = await RoomType.findById(data.roomTypeId);
    if (!roomType || roomType.propertyId.toString() !== propertyId) {
      throw new NotFoundError("Room type not found for this property");
    }

    const existingRoom = await Room.findOne({
      propertyId: new Types.ObjectId(propertyId),
      roomNumber: data.roomNumber,
    });
    if (existingRoom) {
      throw new ConflictError(
        `Room number "${data.roomNumber}" already exists for this property`
      );
    }

    const room = new Room({
      ...data,
      propertyId: new Types.ObjectId(propertyId),
      roomTypeId: new Types.ObjectId(data.roomTypeId),
    });

    await room.save();

    await this.updateInventoryTotals(propertyId, data.roomTypeId);

    return room;
  }

  async findById(id: string): Promise<IRoom> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid room ID");
    }

    const room = await Room.findById(id)
      .populate("propertyId", "name slug")
      .populate("roomTypeId", "name code");
    if (!room) {
      throw new NotFoundError("Room not found");
    }

    return room;
  }

  async update(id: string, data: UpdateRoomData): Promise<IRoom> {
    const room = await this.findById(id);

    if (data.roomNumber && data.roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({
        propertyId: room.propertyId,
        roomNumber: data.roomNumber,
        _id: { $ne: id },
      });
      if (existingRoom) {
        throw new ConflictError(
          `Room number "${data.roomNumber}" already exists for this property`
        );
      }
    }

    if (data.roomTypeId && data.roomTypeId !== room.roomTypeId.toString()) {
      if (!Types.ObjectId.isValid(data.roomTypeId)) {
        throw new BadRequestError("Invalid room type ID");
      }

      const roomType = await RoomType.findById(data.roomTypeId);
      if (!roomType || roomType.propertyId.toString() !== room.propertyId.toString()) {
        throw new NotFoundError("Room type not found for this property");
      }

      const oldRoomTypeId = room.roomTypeId.toString();
      room.roomTypeId = new Types.ObjectId(data.roomTypeId);
      delete data.roomTypeId;

      Object.assign(room, data);
      await room.save();

      await this.updateInventoryTotals(room.propertyId.toString(), oldRoomTypeId);
      await this.updateInventoryTotals(room.propertyId.toString(), room.roomTypeId.toString());

      return room;
    }

    Object.assign(room, data);
    await room.save();

    return room;
  }

  async updateStatus(
    id: string,
    status: RoomStatus,
    notes?: string
  ): Promise<IRoom> {
    const room = await this.findById(id);

    if (!canTransitionRoomTo(room.status, status)) {
      throw new BadRequestError(
        `Cannot transition room status from "${room.status}" to "${status}"`
      );
    }

    room.status = status;

    if (notes) {
      room.notes = notes;
    }

    if (status === RoomStatus.CLEAN) {
      room.lastCleanedAt = new Date();
    } else if (status === RoomStatus.INSPECTED) {
      room.lastInspectedAt = new Date();
    }

    await room.save();
    return room;
  }

  async delete(id: string): Promise<void> {
    const room = await this.findById(id);

    if (room.isOccupied) {
      throw new ConflictError("Cannot delete an occupied room");
    }

    const propertyId = room.propertyId.toString();
    const roomTypeId = room.roomTypeId.toString();

    await (room as any).softDelete();

    await this.updateInventoryTotals(propertyId, roomTypeId);
  }

  async listByProperty(
    propertyId: string,
    filters: ListRoomsFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResult<IRoom>> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const query: any = {
      propertyId: new Types.ObjectId(propertyId),
    };

    if (filters.roomTypeId) {
      query.roomTypeId = new Types.ObjectId(filters.roomTypeId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.floor !== undefined) {
      query.floor = filters.floor;
    }

    if (filters.isOccupied !== undefined) {
      query.isOccupied = filters.isOccupied;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    const pagination = getPaginationParams(page, limit);

    const [rooms, total] = await Promise.all([
      Room.find(query)
        .populate("roomTypeId", "name code")
        .sort({ floor: 1, roomNumber: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Room.countDocuments(query),
    ]);

    return createPaginatedResult(rooms, total, pagination);
  }

  async bulkCreate(
    propertyId: string,
    roomTypeId: string,
    floors: { floor: number; roomNumbers: string[] }[],
    features: string[] = []
  ): Promise<IRoom[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    if (!Types.ObjectId.isValid(roomTypeId)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType || roomType.propertyId.toString() !== propertyId) {
      throw new NotFoundError("Room type not found for this property");
    }

    const allRoomNumbers = floors.flatMap((f) => f.roomNumbers);
    const existingRooms = await Room.find({
      propertyId: new Types.ObjectId(propertyId),
      roomNumber: { $in: allRoomNumbers },
    });

    if (existingRooms.length > 0) {
      const existingNumbers = existingRooms.map((r) => r.roomNumber);
      throw new ConflictError(
        `Room numbers already exist: ${existingNumbers.join(", ")}`
      );
    }

    const roomsToCreate = floors.flatMap((floorData) =>
      floorData.roomNumbers.map((roomNumber) => ({
        propertyId: new Types.ObjectId(propertyId),
        roomTypeId: new Types.ObjectId(roomTypeId),
        roomNumber,
        floor: floorData.floor,
        features,
        status: RoomStatus.CLEAN,
        isActive: true,
        isOccupied: false,
      }))
    );

    const rooms = await Room.insertMany(roomsToCreate);

    await this.updateInventoryTotals(propertyId, roomTypeId);

    return rooms;
  }

  async getStatusSummary(
    propertyId: string
  ): Promise<Record<RoomStatus, number>> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const summary = await Room.aggregate([
      {
        $match: {
          propertyId: new Types.ObjectId(propertyId),
          isDeleted: false,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<RoomStatus, number> = {
      [RoomStatus.CLEAN]: 0,
      [RoomStatus.DIRTY]: 0,
      [RoomStatus.INSPECTED]: 0,
      [RoomStatus.MAINTENANCE]: 0,
      [RoomStatus.OUT_OF_ORDER]: 0,
    };

    summary.forEach((item) => {
      result[item._id as RoomStatus] = item.count;
    });

    return result;
  }

  private async updateInventoryTotals(
    propertyId: string,
    roomTypeId: string
  ): Promise<void> {
    const totalRooms = await Room.countDocuments({
      propertyId: new Types.ObjectId(propertyId),
      roomTypeId: new Types.ObjectId(roomTypeId),
      isDeleted: false,
      isActive: true,
    });

    await Inventory.updateMany(
      {
        propertyId: new Types.ObjectId(propertyId),
        roomTypeId: new Types.ObjectId(roomTypeId),
        date: { $gte: new Date() },
      },
      {
        $set: { totalRooms },
      }
    );
  }
}

export const roomService = new RoomService();
