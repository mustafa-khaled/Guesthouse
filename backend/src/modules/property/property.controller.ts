import { z } from "zod";
import { propertyService } from "./property.service";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  listPropertiesSchema,
} from "./property.schema";
import {
  wrapController,
  created,
  ok,
  okMessage,
  okPaginated,
} from "../../common/utils/controller-wrapper";

export const propertyController = {
  create: wrapController(
    { body: createPropertySchema.shape.body },
    async ({ res, data, user }) => {
      const property = await propertyService.create(data.body, user?.id);
      return created(res, property, "Property created successfully");
    }
  ),

  getBySlug: wrapController(
    {
      params: z.object({ slug: z.string().min(1) }),
    },
    async ({ res, data }) => {
      const property = await propertyService.findBySlug(data.params.slug);
      return ok(res, property);
    }
  ),

  getById: wrapController(
    { params: getPropertySchema.shape.params },
    async ({ res, data }) => {
      const property = await propertyService.findById(data.params.id);
      return ok(res, property);
    }
  ),

  update: wrapController(
    {
      params: updatePropertySchema.shape.params,
      body: updatePropertySchema.shape.body,
    },
    async ({ res, data }) => {
      const property = await propertyService.update(data.params.id, data.body);
      return ok(res, property, "Property updated successfully");
    }
  ),

  delete: wrapController(
    { params: getPropertySchema.shape.params },
    async ({ res, data }) => {
      await propertyService.delete(data.params.id);
      return okMessage(res, "Property deleted successfully");
    }
  ),

  list: wrapController(
    { query: listPropertiesSchema.shape.query },
    async ({ res, data }) => {
      const { page, limit, sortBy, sortOrder, amenities, ...filters } = data.query;

      const amenitiesArray = amenities
        ? amenities.split(",").map((a: string) => a.trim())
        : undefined;

      const properties = await propertyService.list(
        { ...filters, amenities: amenitiesArray },
        page,
        limit,
        sortBy,
        sortOrder
      );

      return okPaginated(res, properties);
    }
  ),

  getStats: wrapController(
    { params: getPropertySchema.shape.params },
    async ({ res, data }) => {
      const stats = await propertyService.getPropertyStats(data.params.id);
      return ok(res, stats);
    }
  ),
};
