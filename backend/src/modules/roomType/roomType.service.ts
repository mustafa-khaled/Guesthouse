import { RoomType, IRoomType } from "../../models/roomType.model";
import { Property } from "../../models/property.model";
import { Room } from "../../models/room.model";
import { RatePlan } from "../../models/ratePlan.model";
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
import { Types } from "mongoose";

export interface CreateRoomTypeData {
  name: string;
  code: string;
  description?: string;
  amenities?: string[];
  maxOccupancy: {
    adults: number;
    children: number;
    total: number;
  };
  bedConfiguration?: string;
  size?: { value: number; unit: string };
  images?: { url: string; caption?: string }[];
  basePrice: number;
  isActive?: boolean;
}

export interface UpdateRoomTypeData {
  name?: string;
  code?: string;
  description?: string;
  amenities?: string[];
  maxOccupancy?: {
    adults: number;
    children: number;
    total: number;
  };
  bedConfiguration?: string;
  size?: { value: number; unit: string };
  images?: { url: string; caption?: string }[];
  basePrice?: number;
  isActive?: boolean;
}

export interface ListRoomTypesFilters {
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minOccupancy?: number;
}

class RoomTypeService {
  async create(propertyId: string, data: CreateRoomTypeData): Promise<IRoomType> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const existingCode = await RoomType.findOne({
      propertyId: new Types.ObjectId(propertyId),
      code: data.code,
    });
    if (existingCode) {
      throw new ConflictError(
        `Room type with code "${data.code}" already exists for this property`
      );
    }

    const roomType = new RoomType({
      ...data,
      propertyId: new Types.ObjectId(propertyId),
    });

    await roomType.save();
    return roomType;
  }

  async findById(id: string): Promise<IRoomType> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const roomType = await RoomType.findById(id).populate("propertyId", "name slug");
    if (!roomType) {
      throw new NotFoundError("Room type not found");
    }

    return roomType;
  }

  async update(id: string, data: UpdateRoomTypeData): Promise<IRoomType> {
    const roomType = await this.findById(id);

    if (data.code && data.code !== roomType.code) {
      const existingCode = await RoomType.findOne({
        propertyId: roomType.propertyId,
        code: data.code,
        _id: { $ne: id },
      });
      if (existingCode) {
        throw new ConflictError(
          `Room type with code "${data.code}" already exists for this property`
        );
      }
    }

    Object.assign(roomType, data);
    await roomType.save();

    return roomType;
  }

  async delete(id: string): Promise<void> {
    const roomType = await this.findById(id);

    const roomsCount = await Room.countDocuments({
      roomTypeId: roomType._id,
      isDeleted: false,
    });

    if (roomsCount > 0) {
      throw new ConflictError(
        "Cannot delete room type with existing rooms. Delete rooms first."
      );
    }

    const ratePlansCount = await RatePlan.countDocuments({
      roomTypeId: roomType._id,
      isDeleted: false,
    });

    if (ratePlansCount > 0) {
      throw new ConflictError(
        "Cannot delete room type with existing rate plans. Delete rate plans first."
      );
    }

    await (roomType as any).softDelete();
  }

  async listByProperty(
    propertyId: string,
    filters: ListRoomTypesFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<IRoomType>> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const query: any = {
      propertyId: new Types.ObjectId(propertyId),
    };

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.minPrice !== undefined) {
      query.basePrice = { ...query.basePrice, $gte: filters.minPrice };
    }

    if (filters.maxPrice !== undefined) {
      query.basePrice = { ...query.basePrice, $lte: filters.maxPrice };
    }

    if (filters.minOccupancy !== undefined) {
      query["maxOccupancy.total"] = { $gte: filters.minOccupancy };
    }

    const pagination = getPaginationParams(page, limit);

    const [roomTypes, total] = await Promise.all([
      RoomType.find(query)
        .sort({ basePrice: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      RoomType.countDocuments(query),
    ]);

    return createPaginatedResult(roomTypes, total, pagination);
  }

  async getRoomCount(id: string): Promise<number> {
    const roomType = await this.findById(id);
    return Room.countDocuments({
      roomTypeId: roomType._id,
      isDeleted: false,
      isActive: true,
    });
  }
}

export const roomTypeService = new RoomTypeService();
