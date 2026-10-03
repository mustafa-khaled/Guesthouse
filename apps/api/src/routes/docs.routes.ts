import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from '../config/env';
import { logger } from '../lib/logger';

const router = Router();

let openApiSpec: Record<string, any> | null = null;

try {
  const shared = require('@guesthouse/shared/openapi');
  if (typeof shared.generateOpenAPI === 'function') {
    openApiSpec = shared.generateOpenAPI();
  }
} catch (err: any) {
  logger.warn('OpenAPI docs unavailable: ' + err.message);
}

if (openApiSpec) {
  const spec = openApiSpec;
  spec.servers = [{ url: env.APP_URL || 'http://localhost:5000' }];
  spec.info = {
    title: 'Guesthouse API',
    version: '1.0.0',
    description: 'Hotel booking & management API',
  };
  spec.components = {
    ...spec.components,
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
  };
  spec.security = [{ bearerAuth: [] }];

  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(spec, { explorer: true }));
  router.get('/spec', (_req: Request, res: Response) => {
    res.json(spec);
  });
} else {
  router.get(['/', '/spec'], (_req: Request, res: Response) => {
    res.status(503).json({ error: 'OpenAPI docs unavailable (zod version conflict)' });
  });
}

export default router;
