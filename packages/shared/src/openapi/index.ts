import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import type { OpenAPIObject } from 'openapi3-ts/oas30'
import { z } from 'zod'
import { tourSchema } from '../schemas/tour.js'
import { userSchema, loginSchema, signupSchema, updateMeSchema, updatePasswordSchema } from '../schemas/user.js'
import { reviewSchema } from '../schemas/review.js'
import { bookingSchema } from '../schemas/booking.js'

const registry = new OpenAPIRegistry()

registry.register('Tour', tourSchema)
registry.register('User', userSchema)
registry.register('Review', reviewSchema)
registry.register('Booking', bookingSchema)

const errorResponse = z.object({
  status: z.enum(['fail', 'error']),
  message: z.string(),
})

const successDataResponse = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.literal('success'),
    data: z.object({ data: schema }),
  })

const successListResponse = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    status: z.literal('success'),
    results: z.number(),
    data: z.object({ data: z.array(schema) }),
  })

// ── Tours ──
registry.registerPath({
  method: 'get',
  path: '/api/v1/tours',
  summary: 'Get all tours',
  tags: ['Tours'],
  request: {
    query: z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      sort: z.string().optional(),
      fields: z.string().optional(),
      difficulty: z.string().optional(),
    }),
  },
  responses: {
    200: { description: 'List of tours', content: { 'application/json': { schema: successListResponse(tourSchema) } } },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/tours',
  summary: 'Create a tour',
  tags: ['Tours'],
  request: { body: { content: { 'application/json': { schema: tourSchema } } } },
  responses: {
    201: { description: 'Created tour', content: { 'application/json': { schema: successDataResponse(tourSchema) } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponse } } },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/tours/{id}',
  summary: 'Get a tour by ID',
  tags: ['Tours'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Tour details', content: { 'application/json': { schema: successDataResponse(tourSchema) } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponse } } },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/tours/{id}',
  summary: 'Update a tour',
  tags: ['Tours'],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: tourSchema.partial() } } },
  },
  responses: {
    200: { description: 'Updated tour', content: { 'application/json': { schema: successDataResponse(tourSchema) } } },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/tours/{id}',
  summary: 'Delete a tour',
  tags: ['Tours'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'No content' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/tours/top-5-cheap',
  summary: 'Get top 5 cheapest tours',
  tags: ['Tours'],
  responses: {
    200: { description: 'Top 5 tours', content: { 'application/json': { schema: successListResponse(tourSchema) } } },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/tours/tour-stats',
  summary: 'Get tour statistics',
  tags: ['Tours'],
  responses: {
    200: { description: 'Tour statistics' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/tours/monthly-plan/{year}',
  summary: 'Get monthly plan for a year',
  tags: ['Tours'],
  request: { params: z.object({ year: z.coerce.number() }) },
  responses: {
    200: { description: 'Monthly plan' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/tours/tours-within/{distance}/center/{latlng}/uint/{unit}',
  summary: 'Get tours within a distance',
  tags: ['Tours'],
  request: { params: z.object({ distance: z.coerce.number(), latlng: z.string(), unit: z.string() }) },
  responses: {
    200: { description: 'Tours within range', content: { 'application/json': { schema: successListResponse(tourSchema) } } },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/tours/distances/{latlng}/unit/{unit}',
  summary: 'Get distances to all tours',
  tags: ['Tours'],
  request: { params: z.object({ latlng: z.string(), unit: z.string() }) },
  responses: {
    200: { description: 'Distances to tours' },
  },
})

// ── Auth ──
registry.registerPath({
  method: 'post',
  path: '/api/v1/users/signup',
  summary: 'Create a new account',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: signupSchema } } } },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: z.object({ status: z.literal('success'), token: z.string(), data: z.object({ user: userSchema }) }) } },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/users/login',
  summary: 'Log in',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: {
      description: 'Logged in',
      content: { 'application/json': { schema: z.object({ status: z.literal('success'), token: z.string(), data: z.object({ user: userSchema }) }) } },
    },
    401: { description: 'Invalid credentials', content: { 'application/json': { schema: errorResponse } } },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/logout',
  summary: 'Log out',
  tags: ['Auth'],
  responses: {
    200: { description: 'Logged out', content: { 'application/json': { schema: z.object({ status: z.literal('success') }) } } },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/users/forgotPassword',
  summary: 'Request password reset',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: z.object({ email: z.string().email() }) } } } },
  responses: {
    200: { description: 'Reset token sent to email' },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/resetPassword/{token}',
  summary: 'Reset password with token',
  tags: ['Auth'],
  request: {
    params: z.object({ token: z.string() }),
    body: { content: { 'application/json': { schema: z.object({ password: z.string(), passwordConfirm: z.string() }) } } },
  },
  responses: {
    200: { description: 'Password reset' },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/updateMyPassword',
  summary: 'Update current user password',
  tags: ['Users'],
  request: { body: { content: { 'application/json': { schema: updatePasswordSchema } } } },
  responses: {
    200: { description: 'Password updated' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/me',
  summary: 'Get current user profile',
  tags: ['Users'],
  responses: {
    200: { description: 'Current user', content: { 'application/json': { schema: successDataResponse(userSchema) } } },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/updateMe',
  summary: 'Update current user profile',
  tags: ['Users'],
  request: { body: { content: { 'application/json': { schema: updateMeSchema } } } },
  responses: {
    200: { description: 'Profile updated', content: { 'application/json': { schema: successDataResponse(userSchema) } } },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/users/deleteMe',
  summary: 'Delete current user account',
  tags: ['Users'],
  responses: {
    204: { description: 'Account deleted' },
  },
})

// ── Admin Users ──
registry.registerPath({
  method: 'get',
  path: '/api/v1/users',
  summary: 'Get all users (admin)',
  tags: ['Admin'],
  responses: {
    200: { description: 'List of users', content: { 'application/json': { schema: successListResponse(userSchema) } } },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/{id}',
  summary: 'Get user by ID (admin)',
  tags: ['Admin'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'User details', content: { 'application/json': { schema: successDataResponse(userSchema) } } },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/{id}',
  summary: 'Update user (admin)',
  tags: ['Admin'],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: userSchema.partial() } } },
  },
  responses: {
    200: { description: 'User updated', content: { 'application/json': { schema: successDataResponse(userSchema) } } },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/users/{id}',
  summary: 'Delete user (admin)',
  tags: ['Admin'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'User deleted' },
  },
})

// ── Reviews ──
registry.registerPath({
  method: 'get',
  path: '/api/v1/reviews',
  summary: 'Get all reviews',
  tags: ['Reviews'],
  responses: {
    200: { description: 'List of reviews', content: { 'application/json': { schema: successListResponse(reviewSchema) } } },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/reviews',
  summary: 'Create a review',
  tags: ['Reviews'],
  request: { body: { content: { 'application/json': { schema: reviewSchema } } } },
  responses: {
    201: { description: 'Review created', content: { 'application/json': { schema: successDataResponse(reviewSchema) } } },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/reviews/{id}',
  summary: 'Get a review',
  tags: ['Reviews'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Review details', content: { 'application/json': { schema: successDataResponse(reviewSchema) } } },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/reviews/{id}',
  summary: 'Update a review',
  tags: ['Reviews'],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: reviewSchema.partial() } } },
  },
  responses: {
    200: { description: 'Review updated', content: { 'application/json': { schema: successDataResponse(reviewSchema) } } },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/reviews/{id}',
  summary: 'Delete a review',
  tags: ['Reviews'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Review deleted' },
  },
})

// ── Bookings ──
registry.registerPath({
  method: 'get',
  path: '/api/v1/bookings/checkout-session/{tourId}',
  summary: 'Get Stripe checkout session',
  tags: ['Bookings'],
  request: { params: z.object({ tourId: z.string() }) },
  responses: {
    200: { description: 'Stripe session' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/bookings',
  summary: 'Get all bookings (admin/lead-guide)',
  tags: ['Bookings'],
  responses: {
    200: { description: 'List of bookings', content: { 'application/json': { schema: successListResponse(bookingSchema) } } },
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/bookings',
  summary: 'Create a booking (admin/lead-guide)',
  tags: ['Bookings'],
  request: { body: { content: { 'application/json': { schema: bookingSchema } } } },
  responses: {
    201: { description: 'Booking created' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/bookings/{id}',
  summary: 'Get a booking',
  tags: ['Bookings'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Booking details' },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/bookings/{id}',
  summary: 'Update a booking',
  tags: ['Bookings'],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: bookingSchema.partial() } } },
  },
  responses: {
    200: { description: 'Booking updated' },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/bookings/{id}',
  summary: 'Delete a booking',
  tags: ['Bookings'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Booking deleted' },
  },
})

export function generateOpenAPI(): OpenAPIObject {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Guesthouse API',
      version: '1.0.0',
      description: 'API for the Guesthouse travel booking application',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
  })
}
