import { Property, IProperty } from "../../models/property.model";
import { RoomType } from "../../models/roomType.model";
import { Room } from "../../models/room.model";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../common/errors/http.errors";
import {
  getPaginationParams,
  createPaginatedResult,
  getSortParams,
  PaginatedResult,
} from "../../common/utils/pagination";
import {
  getOrSet,
  invalidate,
  invalidateKey,
  buildCacheKey,
  CacheTTL,
  CachePrefix,
} from "../../lib/cache";
import { Types } from "mongoose";

export interface CreatePropertyData {
  name: string;
  slug: string;
  description?: string;
  address?: IProperty["address"];
  contact?: IProperty["contact"];
  settings?: Partial<IProperty["settings"]>;
  amenities?: string[];
  images?: IProperty["images"];
  starRating?: number;
  isActive?: boolean;
  ownerId?: string;
}

export interface UpdatePropertyData {
  name?: string;
  slug?: string;
  description?: string;
  address?: IProperty["address"];
  contact?: IProperty["contact"];
  settings?: Partial<IProperty["settings"]>;
  amenities?: string[];
  images?: IProperty["images"];
  starRating?: number;
  isActive?: boolean;
}

export interface ListPropertiesFilters {
  city?: string;
  country?: string;
  minRating?: number;
  amenities?: string[];
  isActive?: boolean;
}

class PropertyService {
  async create(data: CreatePropertyData, userId?: string): Promise<IProperty> {
    const existingSlug = await Property.findOne({ slug: data.slug });
    if (existingSlug) {
      throw new ConflictError(`Property with slug "${data.slug}" already exists`);
    }

    const property = new Property({
      ...data,
      ownerId: userId ? new Types.ObjectId(userId) : undefined,
    });

    await property.save();

    await invalidate(`${CachePrefix.PROPERTY_LIST}:*`);

    return property;
  }

  async findById(id: string): Promise<IProperty> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid property ID");
    }

    const cacheKey = buildCacheKey(CachePrefix.PROPERTY, id);
    
    const property = await getOrSet(
      cacheKey,
      async () => {
        const doc = await Property.findById(id);
        return doc ? doc.toObject() : null;
      },
      CacheTTL.PROPERTY
    );

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    return property as IProperty;
  }

  async findBySlug(slug: string): Promise<IProperty> {
    const cacheKey = buildCacheKey(CachePrefix.PROPERTY, "slug", slug);
    
    const property = await getOrSet(
      cacheKey,
      async () => {
        const doc = await Property.findOne({ slug, isActive: true });
        return doc ? doc.toObject() : null;
      },
      CacheTTL.PROPERTY
    );

    if (!property) {
      throw new NotFoundError("Property not found");
    }

    return property as IProperty;
  }

  async update(id: string, data: UpdatePropertyData): Promise<IProperty> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid property ID");
    }

    const property = await Property.findById(id);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const oldSlug = property.slug;

    if (data.slug && data.slug !== property.slug) {
      const existingSlug = await Property.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        throw new ConflictError(`Property with slug "${data.slug}" already exists`);
      }
    }

    if (data.settings) {
      data.settings = { ...property.settings.toObject(), ...data.settings };
    }

    Object.assign(property, data);
    await property.save();

    await invalidateKey(buildCacheKey(CachePrefix.PROPERTY, id));
    await invalidateKey(buildCacheKey(CachePrefix.PROPERTY, "slug", oldSlug));
    if (data.slug && data.slug !== oldSlug) {
      await invalidateKey(buildCacheKey(CachePrefix.PROPERTY, "slug", data.slug));
    }
    await invalidate(`${CachePrefix.PROPERTY_LIST}:*`);

    return property;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid property ID");
    }

    const property = await Property.findById(id);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const roomTypesCount = await RoomType.countDocuments({
      propertyId: property._id,
      isDeleted: false,
    });

    if (roomTypesCount > 0) {
      throw new ConflictError(
        "Cannot delete property with existing room types. Delete room types first."
      );
    }

    await (property as any).softDelete();

    await invalidateKey(buildCacheKey(CachePrefix.PROPERTY, id));
    await invalidateKey(buildCacheKey(CachePrefix.PROPERTY, "slug", property.slug));
    await invalidate(`${CachePrefix.PROPERTY_LIST}:*`);
  }

  async list(
    filters: ListPropertiesFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<PaginatedResult<IProperty>> {
    const query: any = {};

    if (filters.city) {
      query["address.city"] = { $regex: filters.city, $options: "i" };
    }

    if (filters.country) {
      query["address.country"] = { $regex: filters.country, $options: "i" };
    }

    if (filters.minRating) {
      query.starRating = { $gte: filters.minRating };
    }

    if (filters.amenities && filters.amenities.length > 0) {
      query.amenities = { $all: filters.amenities };
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    } else {
      query.isActive = true;
    }

    const pagination = getPaginationParams(page, limit);
    const sort = getSortParams(sortBy, sortOrder);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Property.countDocuments(query),
    ]);

    return createPaginatedResult(properties, total, pagination);
  }

  async getPropertyStats(id: string): Promise<{
    roomTypesCount: number;
    roomsCount: number;
    activeRoomsCount: number;
  }> {
    const property = await this.findById(id);

    const [roomTypesCount, roomsCount, activeRoomsCount] = await Promise.all([
      RoomType.countDocuments({ propertyId: property._id, isDeleted: false }),
      Room.countDocuments({ propertyId: property._id, isDeleted: false }),
      Room.countDocuments({
        propertyId: property._id,
        isDeleted: false,
        isActive: true,
      }),
    ]);

    return { roomTypesCount, roomsCount, activeRoomsCount };
  }
}

export const propertyService = new PropertyService();
