import { Router, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenAPI } from "@guesthouse/shared";
import { env } from "../config/env";

const router = Router();

const openApiSpec = generateOpenAPI();

openApiSpec.servers = [
  {
    url: env.APP_URL || "http://localhost:5000",
    description: env.NODE_ENV === "production" ? "Production server" : "Development server",
  },
];

openApiSpec.info = {
  title: "Guesthouse API",
  version: "1.0.0",
  description: `
## Overview

Guesthouse is a comprehensive hotel/guesthouse management system API.

### Authentication

Most endpoints require authentication via JWT Bearer token. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

### Rate Limiting

API requests are rate-limited. See response headers for limit information.

### Modules

- **Auth** - User authentication and account management
- **Properties** - Hotel/guesthouse property management
- **Room Types** - Room category configuration
- **Rooms** - Individual room management
- **Rate Plans** - Pricing and availability rules
- **Inventory** - Room availability calendar
- **Guests** - Guest profile management
- **Bookings** - Reservation management
- **Payments** - Payment processing
- **Add-ons** - Extra services and amenities
- **Promotions** - Discounts and promotional offers
- **Reviews** - Guest reviews and ratings
- **Housekeeping** - Room cleaning tasks
- **Front Desk** - Check-in/out operations
- **Reports** - Business analytics and reports
- **Dashboard** - Summary metrics
  `,
  contact: {
    name: "API Support",
  },
};

openApiSpec.components = {
  ...openApiSpec.components,
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Enter your JWT access token",
    },
  },
};

openApiSpec.security = [{ bearerAuth: [] }];

const swaggerOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin-bottom: 20px }
  `,
  customSiteTitle: "Guesthouse API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
  },
};

router.use("/", swaggerUi.serve);

router.get("/", swaggerUi.setup(openApiSpec, swaggerOptions));

router.get("/spec", (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

router.get("/spec.yaml", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/yaml");
  
  const yaml = jsonToYaml(openApiSpec);
  res.send(yaml);
});

function jsonToYaml(obj: unknown, indent: number = 0): string {
  const spaces = "  ".repeat(indent);
  
  if (obj === null || obj === undefined) {
    return "null";
  }
  
  if (typeof obj === "boolean" || typeof obj === "number") {
    return String(obj);
  }
  
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#")) {
      return `|\n${obj.split("\n").map(line => spaces + "  " + line).join("\n")}`;
    }
    if (obj.match(/^[0-9]/) || obj === "" || obj.match(/[{}\[\],&*#?|\-<>=!%@`]/)) {
      return `"${obj.replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map(item => {
      const value = jsonToYaml(item, indent + 1);
      if (typeof item === "object" && item !== null) {
        return `\n${spaces}- ${value.trim().replace(/^\n/, "").replace(/^  /, "")}`;
      }
      return `\n${spaces}- ${value}`;
    }).join("");
  }
  
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    return entries.map(([key, value]) => {
      const yamlValue = jsonToYaml(value, indent + 1);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return `\n${spaces}${key}:${yamlValue}`;
      }
      if (Array.isArray(value)) {
        return `\n${spaces}${key}:${yamlValue}`;
      }
      return `\n${spaces}${key}: ${yamlValue}`;
    }).join("");
  }
  
  return String(obj);
}

export default router;
