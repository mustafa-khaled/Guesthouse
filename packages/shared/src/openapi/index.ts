export function generateOpenAPI() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Guesthouse Hotel API',
      version: '1.0.0',
      description:
        'API for the Guesthouse hotel booking and management platform. Manage properties, rooms, bookings, guests, and staff operations.',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Development server' }],
    paths: {
      '/api/v1/properties': {
        get: {
          tags: ['Properties'],
          summary: 'List all properties',
          responses: { '200': { description: 'List of properties' } },
        },
      },
      '/api/v1/properties/{id}': {
        get: {
          tags: ['Properties'],
          summary: 'Get property details',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Property details' } },
        },
      },
      '/api/v1/room-types': {
        get: {
          tags: ['Room Types'],
          summary: 'List room types',
          responses: { '200': { description: 'List of room types' } },
        },
      },
      '/api/v1/rooms': {
        get: {
          tags: ['Rooms'],
          summary: 'List available rooms',
          parameters: [
            { name: 'checkIn', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'checkOut', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: { '200': { description: 'List of available rooms' } },
        },
      },
      '/api/v1/bookings': {
        get: {
          tags: ['Bookings'],
          summary: 'List user bookings',
          responses: { '200': { description: 'List of bookings' } },
        },
        post: {
          tags: ['Bookings'],
          summary: 'Create a booking',
          responses: { '201': { description: 'Booking created' } },
        },
      },
      '/api/v1/bookings/{id}': {
        get: {
          tags: ['Bookings'],
          summary: 'Get booking details',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: { '200': { description: 'Booking details' } },
        },
      },
      '/api/v1/rate-plans': {
        get: {
          tags: ['Rate Plans'],
          summary: 'List rate plans',
          responses: { '200': { description: 'List of rate plans' } },
        },
      },
      '/api/v1/guests': {
        get: {
          tags: ['Guests'],
          summary: 'List guests',
          responses: { '200': { description: 'List of guests' } },
        },
      },
      '/api/v1/inventory': {
        get: {
          tags: ['Inventory'],
          summary: 'Get room inventory',
          responses: { '200': { description: 'Room inventory' } },
        },
      },
      '/api/v1/reviews': {
        get: {
          tags: ['Reviews'],
          summary: 'List reviews',
          responses: { '200': { description: 'List of reviews' } },
        },
      },
      '/api/v1/add-ons': {
        get: {
          tags: ['Add-ons'],
          summary: 'List add-on services',
          responses: { '200': { description: 'List of add-ons' } },
        },
      },
      '/api/v1/promotions': {
        get: {
          tags: ['Promotions'],
          summary: 'List active promotions',
          responses: { '200': { description: 'List of promotions' } },
        },
      },
      '/api/v1/audit-logs': {
        get: {
          tags: ['Audit'],
          summary: 'List audit logs',
          responses: { '200': { description: 'List of audit logs' } },
        },
      },
      '/api/v1/reports': {
        get: {
          tags: ['Reports'],
          summary: 'Generate reports',
          responses: { '200': { description: 'Report data' } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Log in',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: { '200': { description: 'Logged in successfully' } },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                  },
                  required: ['email', 'password', 'firstName', 'lastName'],
                },
              },
            },
          },
          responses: { '201': { description: 'User registered' } },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Log out',
          responses: { '200': { description: 'Logged out' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          responses: { '200': { description: 'Current user info' } },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          responses: { '200': { description: 'New access token' } },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Request password reset',
          responses: { '200': { description: 'Reset email sent' } },
        },
      },
      '/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Reset password',
          responses: { '200': { description: 'Password reset' } },
        },
      },
      '/admin/dashboard': {
        get: {
          tags: ['Admin'],
          summary: 'Admin dashboard stats',
          responses: { '200': { description: 'Dashboard data' } },
        },
      },
      '/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'List users',
          responses: { '200': { description: 'List of users' } },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  }
}
