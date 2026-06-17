import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import type { OpenAPIObject } from 'openapi3-ts/oas30'
import { z } from 'zod'
import { propertySchema } from '../schemas/property.js'
import { userSchema, loginSchema, signupSchema } from '../schemas/user.js'
import { reviewSchema } from '../schemas/review.js'
import { bookingSchema } from '../schemas/booking.js'

const registry = new OpenAPIRegistry()

registry.register('Property', propertySchema)
registry.register('User', userSchema)
registry.register('Review', reviewSchema)
registry.register('Booking', bookingSchema)

registry.registerPath({
  method: 'get',
  path: '/api/v1/',
  summary: 'List properties',
  tags: ['Properties'],
  responses: {
    200: { description: 'List of properties' },
  },
})

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  summary: 'Log in',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: { 200: { description: 'Logged in' } },
})

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  summary: 'Register',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: signupSchema } } } },
  responses: { 201: { description: 'User registered' } },
})

registry.registerPath({
  method: 'get',
  path: '/user/me',
  summary: 'Get current user',
  tags: ['Users'],
  responses: { 200: { description: 'Current user' } },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/bookings',
  summary: 'Create booking',
  tags: ['Bookings'],
  responses: { 201: { description: 'Booking created' } },
})

export function generateOpenAPI(): OpenAPIObject {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Guesthouse Hotel API',
      version: '1.0.0',
      description: 'API for the Guesthouse hotel booking and management platform',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
  })
}
