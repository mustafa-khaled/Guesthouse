import { RatePlan, IRatePlan } from "../../models/ratePlan.model";
import {
  PriceRule,
  IPriceRule,
  PriceAdjustmentType,
} from "../../models/priceRule.model";
import { RoomType } from "../../models/roomType.model";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../common/errors/http.errors";
import {
  getOrSet,
  invalidate,
  invalidateKey,
  buildCacheKey,
  CacheTTL,
  CachePrefix,
} from "../../lib/cache";
import { Types } from "mongoose";
import { isDateInRange, getDayOfWeek } from "../../common/utils/dateUtils";

export interface CreateRatePlanData {
  name: string;
  code: string;
  description?: string;
  basePrice: number;
  inclusions?: string[];
  cancellationPolicy?: IRatePlan["cancellationPolicy"];
  paymentPolicy?: IRatePlan["paymentPolicy"];
  depositPercentage?: number;
  minNights?: number;
  maxNights?: number;
  advanceBookingDays?: IRatePlan["advanceBookingDays"];
  isActive?: boolean;
  validFrom?: Date;
  validTo?: Date;
}

export interface CreatePriceRuleData {
  name: string;
  dateRange: { start: Date; end: Date };
  daysOfWeek?: number[];
  priceAdjustment: { type: string; value: number };
  priority?: number;
  isActive?: boolean;
}

class RatePlanService {
  async create(roomTypeId: string, data: CreateRatePlanData): Promise<IRatePlan> {
    if (!Types.ObjectId.isValid(roomTypeId)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      throw new NotFoundError("Room type not found");
    }

    const existingCode = await RatePlan.findOne({
      roomTypeId: new Types.ObjectId(roomTypeId),
      code: data.code,
    });
    if (existingCode) {
      throw new ConflictError(
        `Rate plan with code "${data.code}" already exists for this room type`
      );
    }

    const ratePlan = new RatePlan({
      ...data,
      roomTypeId: new Types.ObjectId(roomTypeId),
    });

    await ratePlan.save();

    await invalidate(`${CachePrefix.RATE_PLANS_BY_ROOM}:${roomTypeId}:*`);

    return ratePlan;
  }

  async findById(id: string): Promise<IRatePlan> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid rate plan ID");
    }

    const cacheKey = buildCacheKey(CachePrefix.RATE_PLAN, id);

    const ratePlan = await getOrSet(
      cacheKey,
      async () => {
        const doc = await RatePlan.findById(id).populate(
          "roomTypeId",
          "name code propertyId"
        );
        return doc ? doc.toObject() : null;
      },
      CacheTTL.RATE_PLAN
    );

    if (!ratePlan) {
      throw new NotFoundError("Rate plan not found");
    }

    return ratePlan as IRatePlan;
  }

  async update(id: string, data: Partial<CreateRatePlanData>): Promise<IRatePlan> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid rate plan ID");
    }

    const ratePlan = await RatePlan.findById(id);
    if (!ratePlan) {
      throw new NotFoundError("Rate plan not found");
    }

    if (data.code && data.code !== ratePlan.code) {
      const existingCode = await RatePlan.findOne({
        roomTypeId: ratePlan.roomTypeId,
        code: data.code,
        _id: { $ne: id },
      });
      if (existingCode) {
        throw new ConflictError(
          `Rate plan with code "${data.code}" already exists for this room type`
        );
      }
    }

    Object.assign(ratePlan, data);
    await ratePlan.save();

    await invalidateKey(buildCacheKey(CachePrefix.RATE_PLAN, id));
    await invalidate(`${CachePrefix.RATE_PLANS_BY_ROOM}:${ratePlan.roomTypeId}:*`);

    return ratePlan;
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid rate plan ID");
    }

    const ratePlan = await RatePlan.findById(id);
    if (!ratePlan) {
      throw new NotFoundError("Rate plan not found");
    }

    await (ratePlan as any).softDelete();

    await invalidateKey(buildCacheKey(CachePrefix.RATE_PLAN, id));
    await invalidate(`${CachePrefix.RATE_PLANS_BY_ROOM}:${ratePlan.roomTypeId}:*`);
  }

  async listByRoomType(
    roomTypeId: string,
    isActive?: boolean
  ): Promise<IRatePlan[]> {
    if (!Types.ObjectId.isValid(roomTypeId)) {
      throw new BadRequestError("Invalid room type ID");
    }

    const cacheKey = buildCacheKey(
      CachePrefix.RATE_PLANS_BY_ROOM,
      roomTypeId,
      isActive?.toString() ?? "all"
    );

    return getOrSet(
      cacheKey,
      async () => {
        const query: any = { roomTypeId: new Types.ObjectId(roomTypeId) };

        if (isActive !== undefined) {
          query.isActive = isActive;
        }

        const docs = await RatePlan.find(query).sort({ basePrice: 1 });
        return docs.map((d) => d.toObject());
      },
      CacheTTL.RATE_PLAN
    );
  }

  async createPriceRule(
    ratePlanId: string,
    data: CreatePriceRuleData
  ): Promise<IPriceRule> {
    const ratePlan = await this.findById(ratePlanId);

    const priceRule = new PriceRule({
      ...data,
      ratePlanId: ratePlan._id,
      priceAdjustment: {
        type: data.priceAdjustment.type as PriceAdjustmentType,
        value: data.priceAdjustment.value,
      },
    });

    await priceRule.save();
    return priceRule;
  }

  async updatePriceRule(
    id: string,
    data: Partial<CreatePriceRuleData>
  ): Promise<IPriceRule> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid price rule ID");
    }

    const priceRule = await PriceRule.findById(id);
    if (!priceRule) {
      throw new NotFoundError("Price rule not found");
    }

    if (data.priceAdjustment) {
      data.priceAdjustment = {
        type: data.priceAdjustment.type as PriceAdjustmentType,
        value: data.priceAdjustment.value,
      } as any;
    }

    Object.assign(priceRule, data);
    await priceRule.save();

    return priceRule;
  }

  async deletePriceRule(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid price rule ID");
    }

    const priceRule = await PriceRule.findById(id);
    if (!priceRule) {
      throw new NotFoundError("Price rule not found");
    }

    await (priceRule as any).softDelete();
  }

  async listPriceRules(ratePlanId: string): Promise<IPriceRule[]> {
    const ratePlan = await this.findById(ratePlanId);

    return PriceRule.find({
      ratePlanId: ratePlan._id,
      isDeleted: false,
    }).sort({ priority: -1, createdAt: -1 });
  }

  async calculatePrice(ratePlanId: string, date: Date): Promise<number> {
    const ratePlan = await this.findById(ratePlanId);

    const applicableRules = await PriceRule.find({
      ratePlanId: ratePlan._id,
      isActive: true,
      isDeleted: false,
      "dateRange.start": { $lte: date },
      "dateRange.end": { $gte: date },
    }).sort({ priority: -1 });

    let price = ratePlan.basePrice;

    for (const rule of applicableRules) {
      if (!isDateInRange(date, rule.dateRange.start, rule.dateRange.end)) {
        continue;
      }

      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const dayOfWeek = getDayOfWeek(date);
        if (!rule.daysOfWeek.includes(dayOfWeek)) {
          continue;
        }
      }

      switch (rule.priceAdjustment.type) {
        case PriceAdjustmentType.FIXED:
          price += rule.priceAdjustment.value;
          break;
        case PriceAdjustmentType.PERCENTAGE:
          price += price * (rule.priceAdjustment.value / 100);
          break;
        case PriceAdjustmentType.ABSOLUTE:
          price = rule.priceAdjustment.value;
          break;
      }

      break;
    }

    return Math.round(price * 100) / 100;
  }

  async calculateTotalPrice(
    ratePlanId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<{ total: number; breakdown: { date: Date; price: number }[] }> {
    const breakdown: { date: Date; price: number }[] = [];
    let total = 0;

    const current = new Date(checkIn);
    const end = new Date(checkOut);

    while (current < end) {
      const price = await this.calculatePrice(ratePlanId, current);
      breakdown.push({ date: new Date(current), price });
      total += price;
      current.setDate(current.getDate() + 1);
    }

    return { total: Math.round(total * 100) / 100, breakdown };
  }
}

export const ratePlanService = new RatePlanService();
