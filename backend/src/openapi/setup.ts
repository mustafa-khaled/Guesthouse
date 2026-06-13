import { Application } from 'express'
import swaggerUi from 'swagger-ui-express'
import { generateOpenAPI } from '@guesthouse/shared/openapi'

export function setupOpenAPI(app: Application): void {
  const spec = generateOpenAPI()

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Guesthouse API Docs',
  }))

  app.get('/api/docs.json', (_req, res) => {
    res.json(spec)
  })
}
