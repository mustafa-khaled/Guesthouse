import { Router, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const router = Router();

let openApiSpec: Record<string, any> | null = null;

try {
  const shared = require("@guesthouse/shared/openapi");
  if (typeof shared.generateOpenAPI === "function") {
    openApiSpec = shared.generateOpenAPI();
    openApiSpec.servers = [{ url: env.APP_URL || "http://localhost:5000" }];
    openApiSpec.info = { title: "Guesthouse API", version: "1.0.0", description: "Hotel booking & management API" };
    openApiSpec.components = { ...openApiSpec.components, securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } } };
    openApiSpec.security = [{ bearerAuth: [] }];
  }
} catch (err: any) {
  logger.warn("OpenAPI docs unavailable: " + err.message);
}

if (openApiSpec) {
  router.use("/", swaggerUi.serve);
  router.get("/", swaggerUi.setup(openApiSpec, { explorer: true }));
  router.get("/spec", (_req: Request, res: Response) => { res.json(openApiSpec); });
} else {
  router.get(["/", "/spec"], (_req: Request, res: Response) => {
    res.status(503).json({ error: "OpenAPI docs unavailable (zod version conflict)" });
  });
}

export default router;
