import { Promotion, IPromotion, DiscountType } from "../../models/promotion.model";
import { Booking } from "../../models/booking.model";
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
import {
  parseDate,
  getNightsBetween,
  isDateInRange,
  getDayOfWeek,
  formatDate,
} from "../../common/utils/dateUtils";
import { Types } from "mongoose";

export interface CreatePromotionData {
  propertyId?: string;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  conditions: IPromotion["conditions"];
  limits?: { maxUses?: number; maxUsesPerGuest?: number };
  stackable?: boolean;
  isActive?: boolean;
}

export interface ValidatePromotionContext {
  propertyId: string;
  roomTypeId: string;
  ratePlanId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  roomTotal: number;
  guestId?: string;
}

class PromotionService {
  async create(data: CreatePromotionData): Promise<IPromotion> {
    const existingCode = await Promotion.findOne({ code: data.code });
    if (existingCode) {
      throw new ConflictError(`Promotion code "${data.code}" already exists`);
    }

    if (data.conditions.validFrom >= data.conditions.validTo) {
      throw new BadRequestError("Valid from date must be before valid to date");
    }

    const promotion = new Promotion({
      ...data,
      propertyId: data.propertyId ? new Types.ObjectId(data.propertyId) : undefined,
      conditions: {
        ...data.conditions,
        applicableRoomTypes: data.conditions.applicableRoomTypes?.map(
          (id) => new Types.ObjectId(id)
        ),
        applicableRatePlans: data.conditions.applicableRatePlans?.map(
          (id) => new Types.ObjectId(id)
        ),
      },
      limits: {
        ...data.limits,
        currentUses: 0,
      },
    });

    await promotion.save();
    return promotion;
  }

  async findById(id: string): Promise<IPromotion> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid promotion ID");
    }

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      throw new NotFoundError("Promotion not found");
    }

    return promotion;
  }

  async findByCode(code: string): Promise<IPromotion> {
    const promotion = await Promotion.findOne({ code: code.toUpperCase() });
    if (!promotion) {
      throw new NotFoundError("Promotion not found");
    }

    return promotion;
  }

  async update(id: string, data: Partial<CreatePromotionData>): Promise<IPromotion> {
    const promotion = await this.findById(id);

    if (data.conditions) {
      if (data.conditions.applicableRoomTypes) {
        data.conditions.applicableRoomTypes = data.conditions.applicableRoomTypes.map(
          (id) => new Types.ObjectId(id)
        ) as any;
      }
      if (data.conditions.applicableRatePlans) {
        data.conditions.applicableRatePlans = data.conditions.applicableRatePlans.map(
          (id) => new Types.ObjectId(id)
        ) as any;
      }
      data.conditions = { ...promotion.conditions.toObject(), ...data.conditions };
    }

    Object.assign(promotion, data);
    await promotion.save();

    return promotion;
  }

  async delete(id: string): Promise<void> {
    const promotion = await this.findById(id);
    await (promotion as any).softDelete();
  }

  async list(
    propertyId?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<IPromotion>> {
    const query: any = {};

    if (propertyId) {
      query.$or = [
        { propertyId: new Types.ObjectId(propertyId) },
        { propertyId: { $exists: false } },
        { propertyId: null },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const pagination = getPaginationParams(page, limit);

    const [promotions, total] = await Promise.all([
      Promotion.find(query)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Promotion.countDocuments(query),
    ]);

    return createPaginatedResult(promotions, total, pagination);
  }

  async validate(
    code: string,
    context: ValidatePromotionContext
  ): Promise<{ valid: boolean; discount: number; message?: string }> {
    try {
      const discount = await this.calculateDiscount(code, context);
      return { valid: true, discount };
    } catch (error) {
      return { valid: false, discount: 0, message: (error as Error).message };
    }
  }

  async calculateDiscount(
    code: string,
    context: ValidatePromotionContext
  ): Promise<number> {
    const promotion = await this.findByCode(code);

    if (!promotion.isActive) {
      throw new BadRequestError("Promotion is not active");
    }

    if (
      promotion.propertyId &&
      promotion.propertyId.toString() !== context.propertyId
    ) {
      throw new BadRequestError("Promotion not valid for this property");
    }

    const now = new Date();
    if (now < promotion.conditions.validFrom || now > promotion.conditions.validTo) {
      throw new BadRequestError("Promotion is not valid for current date");
    }

    if (promotion.limits.maxUses && promotion.limits.currentUses >= promotion.limits.maxUses) {
      throw new BadRequestError("Promotion has reached maximum usage limit");
    }

    if (promotion.limits.maxUsesPerGuest && context.guestId) {
      const guestUses = await Booking.countDocuments({
        guestId: new Types.ObjectId(context.guestId),
        promotionCode: code,
        status: { $nin: ["cancelled"] },
      });

      if (guestUses >= promotion.limits.maxUsesPerGuest) {
        throw new BadRequestError("You have already used this promotion the maximum number of times");
      }
    }

    if (promotion.conditions.minNights && context.nights < promotion.conditions.minNights) {
      throw new BadRequestError(
        `Minimum stay of ${promotion.conditions.minNights} nights required`
      );
    }

    if (promotion.conditions.minSpend && context.roomTotal < promotion.conditions.minSpend) {
      throw new BadRequestError(
        `Minimum spend of ${promotion.conditions.minSpend} required`
      );
    }

    if (
      promotion.conditions.applicableRoomTypes &&
      promotion.conditions.applicableRoomTypes.length > 0
    ) {
      const isApplicable = promotion.conditions.applicableRoomTypes.some(
        (rt) => rt.toString() === context.roomTypeId
      );
      if (!isApplicable) {
        throw new BadRequestError("Promotion not valid for selected room type");
      }
    }

    if (
      promotion.conditions.applicableRatePlans &&
      promotion.conditions.applicableRatePlans.length > 0
    ) {
      const isApplicable = promotion.conditions.applicableRatePlans.some(
        (rp) => rp.toString() === context.ratePlanId
      );
      if (!isApplicable) {
        throw new BadRequestError("Promotion not valid for selected rate plan");
      }
    }

    if (promotion.conditions.daysOfWeek && promotion.conditions.daysOfWeek.length > 0) {
      const checkInDay = getDayOfWeek(context.checkIn);
      if (!promotion.conditions.daysOfWeek.includes(checkInDay)) {
        throw new BadRequestError("Promotion not valid for selected check-in day");
      }
    }

    if (promotion.conditions.blackoutDates && promotion.conditions.blackoutDates.length > 0) {
      for (const blackoutDate of promotion.conditions.blackoutDates) {
        if (isDateInRange(blackoutDate, context.checkIn, context.checkOut)) {
          throw new BadRequestError(
            `Promotion not valid for dates including ${formatDate(blackoutDate)}`
          );
        }
      }
    }

    let discount = 0;

    switch (promotion.discountType) {
      case DiscountType.PERCENTAGE:
        discount = context.roomTotal * (promotion.discountValue / 100);
        break;
      case DiscountType.FIXED:
        discount = Math.min(promotion.discountValue, context.roomTotal);
        break;
      case DiscountType.FREE_NIGHT:
        const nightlyRate = context.roomTotal / context.nights;
        const freeNights = Math.min(
          Math.floor(promotion.discountValue),
          context.nights - 1
        );
        discount = nightlyRate * freeNights;
        break;
    }

    return Math.round(discount * 100) / 100;
  }

  async incrementUsage(code: string): Promise<void> {
    await Promotion.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { "limits.currentUses": 1 } }
    );
  }

  async decrementUsage(code: string): Promise<void> {
    await Promotion.findOneAndUpdate(
      { code: code.toUpperCase(), "limits.currentUses": { $gt: 0 } },
      { $inc: { "limits.currentUses": -1 } }
    );
  }
}

export const promotionService = new PromotionService();
