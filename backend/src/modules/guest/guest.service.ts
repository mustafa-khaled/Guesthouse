import { Guest, IGuest } from "../../models/guest.model";
import { Booking } from "../../models/booking.model";
import { User } from "../../models/user.model";
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
import { Types } from "mongoose";

export interface CreateGuestData {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationality?: string;
  idDocument?: IGuest["idDocument"];
  address?: IGuest["address"];
  preferences?: IGuest["preferences"];
  tags?: string[];
  notes?: string;
  marketingConsent?: boolean;
}

export interface ListGuestsFilters {
  search?: string;
  tag?: string;
}

class GuestService {
  async create(data: CreateGuestData): Promise<IGuest> {
    const existingGuest = await Guest.findOne({ email: data.email.toLowerCase() });
    if (existingGuest) {
      throw new ConflictError(`Guest with email "${data.email}" already exists`);
    }

    const guest = new Guest({
      ...data,
      email: data.email.toLowerCase(),
    });

    await guest.save();
    return guest;
  }

  async findById(id: string): Promise<IGuest> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid guest ID");
    }

    const guest = await Guest.findById(id);
    if (!guest) {
      throw new NotFoundError("Guest not found");
    }

    return guest;
  }

  async findByEmail(email: string): Promise<IGuest | null> {
    return Guest.findOne({ email: email.toLowerCase() });
  }

  async findByUserId(userId: string): Promise<IGuest | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    return Guest.findOne({ userId: new Types.ObjectId(userId) });
  }

  async findOrCreateByEmail(data: CreateGuestData): Promise<IGuest> {
    let guest = await this.findByEmail(data.email);

    if (!guest) {
      guest = await this.create(data);
    }

    return guest;
  }

  async update(id: string, data: Partial<CreateGuestData>): Promise<IGuest> {
    const guest = await this.findById(id);

    if (data.email && data.email.toLowerCase() !== guest.email) {
      const existingGuest = await Guest.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingGuest) {
        throw new ConflictError(`Guest with email "${data.email}" already exists`);
      }
      data.email = data.email.toLowerCase();
    }

    Object.assign(guest, data);
    await guest.save();

    return guest;
  }

  async delete(id: string): Promise<void> {
    const guest = await this.findById(id);

    const bookingsCount = await Booking.countDocuments({
      guestId: guest._id,
      status: { $in: ["pending", "confirmed", "checked-in"] },
    });

    if (bookingsCount > 0) {
      throw new ConflictError(
        "Cannot delete guest with active bookings"
      );
    }

    await (guest as any).softDelete();
  }

  async list(
    filters: ListGuestsFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = "lastName",
    sortOrder: "asc" | "desc" = "asc"
  ): Promise<PaginatedResult<IGuest>> {
    const query: any = {};

    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: "i" };
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (filters.tag) {
      query.tags = filters.tag;
    }

    const pagination = getPaginationParams(page, limit);
    const sort = getSortParams(sortBy, sortOrder);

    const [guests, total] = await Promise.all([
      Guest.find(query)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Guest.countDocuments(query),
    ]);

    return createPaginatedResult(guests, total, pagination);
  }

  async getBookings(guestId: string): Promise<any[]> {
    const guest = await this.findById(guestId);

    return Booking.find({ guestId: guest._id })
      .populate("propertyId", "name")
      .populate("roomTypeId", "name")
      .sort({ "dates.checkIn": -1 });
  }

  async linkToUser(guestId: string, userId: string): Promise<IGuest> {
    const guest = await this.findById(guestId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid user ID");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingLinked = await Guest.findOne({
      userId: new Types.ObjectId(userId),
      _id: { $ne: guestId },
    });
    if (existingLinked) {
      throw new ConflictError("User is already linked to another guest profile");
    }

    guest.userId = new Types.ObjectId(userId);
    await guest.save();

    return guest;
  }

  async updateStayStats(guestId: string, amount: number): Promise<void> {
    await Guest.findByIdAndUpdate(guestId, {
      $inc: { stayCount: 1, totalSpend: amount },
      $set: { lastStayDate: new Date() },
    });
  }

  async addTag(guestId: string, tag: string): Promise<IGuest> {
    const guest = await this.findById(guestId);

    if (!guest.tags.includes(tag)) {
      guest.tags.push(tag);
      await guest.save();
    }

    return guest;
  }

  async removeTag(guestId: string, tag: string): Promise<IGuest> {
    const guest = await this.findById(guestId);

    guest.tags = guest.tags.filter((t) => t !== tag);
    await guest.save();

    return guest;
  }

  async getGuestProfile(userId: string): Promise<IGuest | null> {
    return this.findByUserId(userId);
  }

  async updateGuestProfile(
    userId: string,
    data: Partial<CreateGuestData>
  ): Promise<IGuest> {
    let guest = await this.findByUserId(userId);

    if (!guest) {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      guest = await this.create({
        email: user.email,
        firstName: data.firstName || user.name?.split(" ")[0] || "Guest",
        lastName: data.lastName || user.name?.split(" ").slice(1).join(" ") || "",
        ...data,
      });

      guest.userId = new Types.ObjectId(userId);
      await guest.save();
    } else {
      Object.assign(guest, data);
      await guest.save();
    }

    return guest;
  }
}

export const guestService = new GuestService();
