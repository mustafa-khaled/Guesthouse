import { z } from "zod";
import { bookingService } from "./booking.service";
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingSchema,
  listBookingsSchema,
  cancelBookingSchema,
  checkInSchema,
  checkOutSchema,
  assignRoomSchema,
} from "./booking.schema";
import {
  wrapController,
  wrap,
  created,
  ok,
  okPaginated,
} from "../../common/utils/controller-wrapper";

const confirmationNumberParams = z.object({
  confirmationNumber: z.string().min(1),
});

export const bookingController = {
  create: wrapController(
    { body: createBookingSchema.shape.body },
    async ({ res, data, user }) => {
      const booking = await bookingService.create(data.body, user?.id);
      return created(res, booking, "Booking created successfully");
    }
  ),

  getById: wrapController(
    { params: getBookingSchema.shape.params },
    async ({ res, data }) => {
      const booking = await bookingService.findById(data.params.id);
      return ok(res, booking);
    }
  ),

  getByConfirmationNumber: wrapController(
    { params: confirmationNumberParams },
    async ({ res, data }) => {
      const booking = await bookingService.findByConfirmationNumber(
        data.params.confirmationNumber
      );
      return ok(res, booking);
    }
  ),

  update: wrapController(
    {
      params: updateBookingSchema.shape.params,
      body: updateBookingSchema.shape.body,
    },
    async ({ res, data }) => {
      const booking = await bookingService.update(data.params.id, data.body);
      return ok(res, booking, "Booking updated successfully");
    }
  ),

  cancel: wrapController(
    {
      params: cancelBookingSchema.shape.params,
      body: cancelBookingSchema.shape.body,
    },
    async ({ res, data, user }) => {
      const booking = await bookingService.cancel(
        data.params.id,
        data.body.reason,
        user?.id
      );
      return ok(res, booking, "Booking cancelled successfully");
    }
  ),

  checkIn: wrapController(
    {
      params: checkInSchema.shape.params,
      body: checkInSchema.shape.body,
    },
    async ({ res, data, user }) => {
      const booking = await bookingService.checkIn(
        data.params.id,
        data.body.roomId,
        user!.id
      );
      return ok(res, booking, "Guest checked in successfully");
    }
  ),

  checkOut: wrapController(
    { params: checkOutSchema.shape.params },
    async ({ res, data, user }) => {
      const booking = await bookingService.checkOut(data.params.id, user!.id);
      return ok(res, booking, "Guest checked out successfully");
    }
  ),

  assignRoom: wrapController(
    {
      params: assignRoomSchema.shape.params,
      body: assignRoomSchema.shape.body,
    },
    async ({ res, data }) => {
      const booking = await bookingService.assignRoom(
        data.params.id,
        data.body.roomId
      );
      return ok(res, booking, "Room assigned successfully");
    }
  ),

  confirm: wrapController(
    { params: getBookingSchema.shape.params },
    async ({ res, data }) => {
      const booking = await bookingService.confirmBooking(data.params.id);
      return ok(res, booking, "Booking confirmed successfully");
    }
  ),

  list: wrapController(
    { query: listBookingsSchema.shape.query },
    async ({ res, data }) => {
      const { page, limit, sortBy, sortOrder, ...filters } = data.query;
      const bookings = await bookingService.list(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );
      return okPaginated(res, bookings);
    }
  ),

  getMyBookings: wrap(async ({ res, user }) => {
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const bookings = await bookingService.getMyBookings(user.id);
    return ok(res, bookings);
  }),

  getAddOns: wrapController(
    { params: getBookingSchema.shape.params },
    async ({ res, data }) => {
      const addOns = await bookingService.getBookingAddOns(data.params.id);
      return ok(res, addOns);
    }
  ),
};
