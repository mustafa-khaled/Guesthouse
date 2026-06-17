import { guestService } from "./guest.service";
import {
  createGuestSchema,
  updateGuestSchema,
  getGuestSchema,
  listGuestsSchema,
  linkUserSchema,
} from "./guest.schema";
import {
  wrapController,
  wrap,
  created,
  ok,
  okMessage,
  okPaginated,
} from "../../common/utils/controller-wrapper";

export const guestController = {
  create: wrapController(
    { body: createGuestSchema.shape.body },
    async ({ res, data }) => {
      const guest = await guestService.create(data.body);
      return created(res, guest, "Guest created successfully");
    }
  ),

  getById: wrapController(
    { params: getGuestSchema.shape.params },
    async ({ res, data }) => {
      const guest = await guestService.findById(data.params.id);
      return ok(res, guest);
    }
  ),

  update: wrapController(
    {
      params: updateGuestSchema.shape.params,
      body: updateGuestSchema.shape.body,
    },
    async ({ res, data }) => {
      const guest = await guestService.update(data.params.id, data.body);
      return ok(res, guest, "Guest updated successfully");
    }
  ),

  delete: wrapController(
    { params: getGuestSchema.shape.params },
    async ({ res, data }) => {
      await guestService.delete(data.params.id);
      return okMessage(res, "Guest deleted successfully");
    }
  ),

  list: wrapController(
    { query: listGuestsSchema.shape.query },
    async ({ res, data }) => {
      const { page, limit, sortBy, sortOrder, ...filters } = data.query;
      const guests = await guestService.list(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );
      return okPaginated(res, guests);
    }
  ),

  getBookings: wrapController(
    { params: getGuestSchema.shape.params },
    async ({ res, data }) => {
      const bookings = await guestService.getBookings(data.params.id);
      return ok(res, bookings);
    }
  ),

  linkUser: wrapController(
    {
      params: linkUserSchema.shape.params,
      body: linkUserSchema.shape.body,
    },
    async ({ res, data }) => {
      const guest = await guestService.linkToUser(
        data.params.id,
        data.body.userId
      );
      return ok(res, guest, "Guest linked to user successfully");
    }
  ),

  getMyProfile: wrap(async ({ res, user }) => {
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const guest = await guestService.getGuestProfile(user.id);

    if (!guest) {
      return res.status(404).json({ message: "Guest profile not found" });
    }

    return ok(res, guest);
  }),

  updateMyProfile: wrapController(
    { body: createGuestSchema.shape.body },
    async ({ res, data, user }) => {
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const guest = await guestService.updateGuestProfile(user.id, data.body);
      return ok(res, guest, "Profile updated successfully");
    }
  ),
};
