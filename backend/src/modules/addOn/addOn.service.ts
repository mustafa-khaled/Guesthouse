import { AddOn, IAddOn, AddOnPricingType } from "../../models/addOn.model";
import { BookingAddOn, IBookingAddOn, BookingAddOnStatus } from "../../models/bookingAddOn.model";
import { Booking } from "../../models/booking.model";
import { Property } from "../../models/property.model";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../common/errors/http.errors";
import { BookingStatus } from "../../common/enums/bookingStatus.enum";
import { Types } from "mongoose";

export interface CreateAddOnData {
  name: string;
  code: string;
  description?: string;
  category?: string;
  pricing: IAddOn["pricing"];
  availability?: IAddOn["availability"];
  maxQuantity?: number;
  isActive?: boolean;
}

class AddOnService {
  async create(propertyId: string, data: CreateAddOnData): Promise<IAddOn> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const existingCode = await AddOn.findOne({
      propertyId: new Types.ObjectId(propertyId),
      code: data.code,
    });
    if (existingCode) {
      throw new ConflictError(
        `Add-on with code "${data.code}" already exists for this property`
      );
    }

    const addOn = new AddOn({
      ...data,
      propertyId: new Types.ObjectId(propertyId),
    });

    await addOn.save();
    return addOn;
  }

  async findById(id: string): Promise<IAddOn> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid add-on ID");
    }

    const addOn = await AddOn.findById(id);
    if (!addOn) {
      throw new NotFoundError("Add-on not found");
    }

    return addOn;
  }

  async update(id: string, data: Partial<CreateAddOnData>): Promise<IAddOn> {
    const addOn = await this.findById(id);

    if (data.code && data.code !== addOn.code) {
      const existingCode = await AddOn.findOne({
        propertyId: addOn.propertyId,
        code: data.code,
        _id: { $ne: id },
      });
      if (existingCode) {
        throw new ConflictError(
          `Add-on with code "${data.code}" already exists for this property`
        );
      }
    }

    Object.assign(addOn, data);
    await addOn.save();

    return addOn;
  }

  async delete(id: string): Promise<void> {
    const addOn = await this.findById(id);
    await (addOn as any).softDelete();
  }

  async listByProperty(
    propertyId: string,
    category?: string,
    isActive?: boolean
  ): Promise<IAddOn[]> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const query: any = { propertyId: new Types.ObjectId(propertyId) };

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    return AddOn.find(query).sort({ category: 1, name: 1 });
  }

  async addToBooking(
    bookingId: string,
    addOnId: string,
    quantity: number,
    scheduledDate?: Date,
    notes?: string
  ): Promise<IBookingAddOn> {
    if (!Types.ObjectId.isValid(bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.CHECKED_OUT
    ) {
      throw new BadRequestError("Cannot add add-ons to cancelled or completed bookings");
    }

    const addOn = await this.findById(addOnId);

    if (addOn.propertyId.toString() !== booking.propertyId.toString()) {
      throw new BadRequestError("Add-on not available for this property");
    }

    if (!addOn.isActive) {
      throw new BadRequestError("Add-on is not currently available");
    }

    if (addOn.maxQuantity && quantity > addOn.maxQuantity) {
      throw new BadRequestError(`Maximum quantity for this add-on is ${addOn.maxQuantity}`);
    }

    const existingAddOn = await BookingAddOn.findOne({
      bookingId: booking._id,
      addOnId: addOn._id,
      status: { $ne: BookingAddOnStatus.CANCELLED },
    });

    if (existingAddOn) {
      throw new ConflictError("This add-on has already been added to the booking");
    }

    const unitPrice = addOn.pricing.amount;
    let totalPrice = unitPrice * quantity;

    switch (addOn.pricing.type) {
      case AddOnPricingType.PER_NIGHT:
        totalPrice = unitPrice * booking.dates.nights * quantity;
        break;
      case AddOnPricingType.PER_PERSON:
        totalPrice = unitPrice * (booking.occupancy.adults + booking.occupancy.children) * quantity;
        break;
      case AddOnPricingType.PER_PERSON_PER_NIGHT:
        totalPrice =
          unitPrice *
          (booking.occupancy.adults + booking.occupancy.children) *
          booking.dates.nights *
          quantity;
        break;
    }

    const bookingAddOn = new BookingAddOn({
      bookingId: booking._id,
      addOnId: addOn._id,
      quantity,
      unitPrice,
      totalPrice,
      scheduledDate,
      notes,
      status: BookingAddOnStatus.PENDING,
    });

    await bookingAddOn.save();

    return bookingAddOn;
  }

  async removeFromBooking(bookingId: string, addOnId: string): Promise<void> {
    if (!Types.ObjectId.isValid(bookingId) || !Types.ObjectId.isValid(addOnId)) {
      throw new BadRequestError("Invalid booking or add-on ID");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.CHECKED_OUT
    ) {
      throw new BadRequestError("Cannot remove add-ons from cancelled or completed bookings");
    }

    const bookingAddOn = await BookingAddOn.findOne({
      bookingId: new Types.ObjectId(bookingId),
      addOnId: new Types.ObjectId(addOnId),
      status: { $ne: BookingAddOnStatus.CANCELLED },
    });

    if (!bookingAddOn) {
      throw new NotFoundError("Add-on not found for this booking");
    }

    if (bookingAddOn.status === BookingAddOnStatus.DELIVERED) {
      throw new BadRequestError("Cannot remove a delivered add-on");
    }

    bookingAddOn.status = BookingAddOnStatus.CANCELLED;
    await bookingAddOn.save();
  }

  async updateBookingAddOnStatus(
    bookingAddOnId: string,
    status: BookingAddOnStatus
  ): Promise<IBookingAddOn> {
    if (!Types.ObjectId.isValid(bookingAddOnId)) {
      throw new BadRequestError("Invalid booking add-on ID");
    }

    const bookingAddOn = await BookingAddOn.findById(bookingAddOnId);
    if (!bookingAddOn) {
      throw new NotFoundError("Booking add-on not found");
    }

    bookingAddOn.status = status;
    await bookingAddOn.save();

    return bookingAddOn;
  }
}

export const addOnService = new AddOnService();
