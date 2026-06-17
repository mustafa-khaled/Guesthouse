import { Request, Response, NextFunction, RequestHandler } from "express";
import { z, ZodType, ZodError } from "zod";
import { HttpError } from "../errors/http.errors";

type SchemaShape = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

type InferSchema<T extends SchemaShape> = {
  body: T["body"] extends ZodType ? z.infer<T["body"]> : undefined;
  params: T["params"] extends ZodType ? z.infer<T["params"]> : undefined;
  query: T["query"] extends ZodType ? z.infer<T["query"]> : undefined;
};

export interface ControllerContext<T extends SchemaShape = SchemaShape> {
  req: Request;
  res: Response;
  data: InferSchema<T>;
  user: Request["user"];
}

type ControllerHandler<T extends SchemaShape> = (
  ctx: ControllerContext<T>
) => Promise<void | Response>;

export function wrapController<T extends SchemaShape>(
  schema: T | null,
  handler: ControllerHandler<T>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data: InferSchema<T> = {
        body: undefined,
        params: undefined,
        query: undefined,
      } as InferSchema<T>;

      if (schema) {
        const toValidate: Record<string, unknown> = {};

        if (schema.body) {
          toValidate.body = req.body;
        }
        if (schema.params) {
          toValidate.params = req.params;
        }
        if (schema.query) {
          toValidate.query = req.query;
        }

        const combinedSchema = z.object({
          body: schema.body ?? z.any().optional(),
          params: schema.params ?? z.any().optional(),
          query: schema.query ?? z.any().optional(),
        });

        const result = combinedSchema.safeParse(toValidate);

        if (!result.success) {
          return res.status(400).json({
            message: "Validation failed",
            errors: result.error.flatten(),
          });
        }

        data = result.data as InferSchema<T>;
      }

      const ctx: ControllerContext<T> = {
        req,
        res,
        data,
        user: req.user,
      };

      await handler(ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.flatten(),
        });
      }
      next(error);
    }
  };
}

export function wrap(
  handler: (ctx: ControllerContext<{}>) => Promise<void | Response>
): RequestHandler {
  return wrapController(null, handler);
}

export const created = <T>(res: Response, data: T, message?: string) =>
  res.status(201).json({ message: message || "Created successfully", data });

export const ok = <T>(res: Response, data: T, message?: string) =>
  message
    ? res.status(200).json({ message, data })
    : res.status(200).json({ data });

export const okMessage = (res: Response, message: string) =>
  res.status(200).json({ message });

export const okPaginated = <T>(res: Response, result: T) =>
  res.status(200).json(result);

export const noContent = (res: Response) => res.status(204).send();
