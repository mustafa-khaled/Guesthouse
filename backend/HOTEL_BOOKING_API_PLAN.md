# Hotel Booking & Management System API - Implementation Plan

## Overview

A comprehensive Express.js API for hotel booking and management, supporting both guest-facing booking flows and back-office hotel operations.

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT with Role-Based Access Control (RBAC)
- **Validation**: Zod
- **Payments**: Stripe
- **Email**: Nodemailer

## Role Mapping

| Hotel Role | System Role | Permissions |
|------------|-------------|-------------|
| Manager | ADMIN | Full access to all operations |
| Front Desk | MODERATOR | Bookings, check-in/out, guests, payments |
| Housekeeping | EDITOR | Room status, housekeeping tasks |
| Guest | USER | Own bookings, profile, reviews |
| Read-only Staff | VIEWER | View-only access |

---

## Phase 1: Foundation (Steps 1-3)

### Infrastructure Enhancements

1. **Global Error Handler** (`src/middleware/errorHandler.ts`)
   - Handles `HttpError` instances with proper status codes
   - Catches `ZodError` for validation failures
   - Generic error fallback for unexpected errors
   - 404 Not Found handler for unmatched routes

2. **Request Validation Middleware** (`src/middleware/validateRequest.ts`)
   - Generic `validate()` function for Zod schemas
   - Specific helpers: `validateBody()`, `validateQuery()`, `validateParams()`
   - Attaches validated data to `req.validated`

3. **Pagination Utilities** (`src/common/utils/pagination.ts`)
   - `paginationSchema` - Zod schema for page/limit
   - `getPaginationParams()` - Calculate skip/limit
   - `createPaginatedResult()` - Format paginated responses
   - `sortSchema` and `getSortParams()` - Sorting helpers

4. **Date Utilities** (`src/common/utils/dateUtils.ts`)
   - `dateStringSchema` - Zod schema for date strings
   - `dateRangeSchema` - Validate date ranges
   - `parseDate()`, `formatDate()`, `getDateRange()`
   - `getNightsBetween()`, `isDateInRange()`, `getDayOfWeek()`

5. **Mongoose Plugins** (`src/common/plugins/mongoosePlugins.ts`)
   - `softDeletePlugin` - Logical deletion with `isDeleted` flag
   - `auditPlugin` - Track `createdBy`/`updatedBy`
   - `toJSONPlugin` - Transform `_id` to `id`, remove `__v`

6. **Domain Enums** (`src/common/enums/`)
   - `BookingStatus`: PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT
   - `PaymentStatus`: PENDING, PARTIAL, PAID, REFUNDED
   - `RoomStatus`: DIRTY, CLEAN, INSPECTED, MAINTENANCE, OUT_OF_ORDER
   - `HousekeepingTaskType`, `HousekeepingTaskStatus`, `HousekeepingPriority`

7. **CORS Configuration** (`src/app.ts`)
   - Enabled for frontend integration
   - Credentials support for cookies

---

## Phase 2: Core Inventory (Steps 4-8)

### Models

#### Property Model
```
- name, slug (unique)
- description, type (hotel, resort, etc.)
- address (street, city, state, country, postalCode, coordinates)
- contact (phone, email, website)
- images, amenities, policies
- settings (currency, timezone, checkInTime, checkOutTime, taxRate)
- owner (ref: User)
- isActive, isDeleted
```

#### RoomType Model
```
- propertyId (ref: Property)
- name, code (unique per property)
- description, images
- occupancy (baseAdults, maxAdults, baseChildren, maxChildren, maxOccupancy)
- size (sqft, sqm)
- bedConfiguration, amenities
- basePrice, isActive, isDeleted
```

#### Room Model
```
- propertyId (ref: Property)
- roomTypeId (ref: RoomType)
- roomNumber (unique per property), floor
- status (dirty, clean, inspected, maintenance, out_of_order)
- isOccupied, isActive
- features, notes
- lastCleanedAt, lastInspectedAt
```

#### RatePlan Model
```
- roomTypeId (ref: RoomType)
- name, code (unique per room type)
- description
- basePrice, currency
- cancellationPolicy (type, deadlineHours, penaltyPercentage)
- paymentPolicy (pay-now, pay-at-hotel, deposit)
- depositPercentage
- minNights, maxNights
- validFrom, validTo
- isActive
```

#### PriceRule Model
```
- ratePlanId (ref: RatePlan)
- dateFrom, dateTo
- priceOverride or adjustmentPercentage
- priority
- isActive
```

#### Inventory Model
```
- propertyId, roomTypeId, date (compound unique)
- totalRooms, bookedRooms, heldRooms
- availableRooms (virtual)
- rateOverride, isClosed
```

#### InventoryHold Model
```
- propertyId, roomTypeId
- dateFrom, dateTo, roomsHeld
- holdToken, expiresAt
- status (active, converted, expired, released)
- bookingId (when converted)
```

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/properties | List properties | Manager |
| POST | /api/properties | Create property | Manager |
| GET | /api/properties/:id | Get property | Manager |
| PUT | /api/properties/:id | Update property | Manager |
| DELETE | /api/properties/:id | Delete property | Manager |
| GET | /api/properties/:propertyId/room-types | List room types | Public |
| POST | /api/properties/:propertyId/room-types | Create room type | Manager |
| GET | /api/room-types/:id | Get room type | Public |
| PUT | /api/room-types/:id | Update room type | Manager |
| DELETE | /api/room-types/:id | Delete room type | Manager |
| GET | /api/properties/:propertyId/rooms | List rooms | Front Desk |
| POST | /api/properties/:propertyId/rooms | Create room | Manager |
| PATCH | /api/rooms/:id/status | Update room status | Housekeeping |
| GET | /api/room-types/:roomTypeId/rate-plans | List rate plans | Public |
| POST | /api/room-types/:roomTypeId/rate-plans | Create rate plan | Manager |
| GET | /api/inventory/search | Search availability | Public |
| POST | /api/inventory/bulk-update | Bulk update inventory | Manager |
| POST | /api/inventory/hold | Create hold | Auth |
| DELETE | /api/inventory/hold/:token | Release hold | Auth |

---

## Phase 3: Booking Engine (Steps 9-12)

### Models

#### Guest Model
```
- userId (optional, ref: User)
- email (unique), phone
- firstName, lastName, dateOfBirth, nationality
- idDocument (type, number, expiryDate, country)
- address, preferences (roomPreferences, dietaryRestrictions)
- tags, notes
- stayCount, totalSpend, lastStayDate
- marketingConsent
```

#### Booking Model
```
- confirmationNumber (unique, e.g., HBK-ABC123)
- propertyId, guestId, roomTypeId, ratePlanId
- assignedRoomId (optional)
- additionalGuests [{firstName, lastName, email}]
- dates {checkIn, checkOut, nights}
- occupancy {adults, children, rooms}
- status (pending, confirmed, checked-in, checked-out, cancelled, no-show)
- pricing {roomRate, roomTotal, addOnsTotal, taxes, fees, discountAmount, grandTotal}
- payment {status, amountPaid, amountDue, depositAmount}
- specialRequests, internalNotes
- source (direct, booking.com, expedia, walk-in, phone)
- promotionCode, holdId
- cancellation {cancelledAt, cancelledBy, reason, refundAmount}
- checkInDetails, checkOutDetails
```

#### AddOn Model
```
- propertyId
- name, code (unique per property)
- description, category (transport, dining, spa, experience, amenity)
- pricing {type (per-stay, per-night, per-person, per-person-per-night), amount}
- availability {daysOfWeek, requiresAdvanceBooking, advanceBookingHours}
- maxQuantity, isActive
```

#### BookingAddOn Model
```
- bookingId, addOnId
- quantity, unitPrice, totalPrice
- scheduledDate, notes
- status (pending, confirmed, delivered, cancelled)
```

#### Promotion Model
```
- propertyId (optional for global promotions)
- code (unique), name, description
- discountType (percentage, fixed, free-night)
- discountValue
- conditions {validFrom, validTo, minNights, minSpend, applicableRoomTypes, applicableRatePlans, daysOfWeek, blackoutDates}
- limits {maxUses, maxUsesPerGuest, currentUses}
- stackable, isActive
```

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/guests | List guests | Front Desk |
| POST | /api/guests | Create guest | Front Desk |
| GET | /api/guests/:id | Get guest | Front Desk |
| PUT | /api/guests/:id | Update guest | Front Desk |
| GET | /api/guests/:id/bookings | Get guest bookings | Front Desk |
| POST | /api/bookings | Create booking | Auth |
| GET | /api/bookings | List bookings | Front Desk |
| GET | /api/bookings/:id | Get booking | Auth |
| PUT | /api/bookings/:id | Update booking | Front Desk |
| POST | /api/bookings/:id/cancel | Cancel booking | Auth |
| POST | /api/bookings/:id/confirm | Confirm booking | Front Desk |
| POST | /api/bookings/:id/check-in | Check in | Front Desk |
| POST | /api/bookings/:id/check-out | Check out | Front Desk |
| POST | /api/bookings/:id/assign-room | Assign room | Front Desk |
| GET | /api/user/me/bookings | Get my bookings | Auth |
| GET | /api/properties/:propertyId/add-ons | List add-ons | Public |
| POST | /api/bookings/:bookingId/add-ons | Add add-on to booking | Front Desk |
| DELETE | /api/bookings/:bookingId/add-ons/:addOnId | Remove add-on | Front Desk |
| GET | /api/promotions | List promotions | Manager |
| POST | /api/promotions | Create promotion | Manager |
| POST | /api/promotions/validate | Validate promo code | Auth |

---

## Phase 4: Payments & Notifications (Steps 13-14)

### Models

#### Payment Model
```
- bookingId, guestId
- type (deposit, payment, refund, charge)
- amount, currency
- method (card, cash, bank_transfer)
- status (pending, completed, failed, refunded)
- stripePaymentIntentId, stripeRefundId
- metadata {cardLast4, cardBrand}
- processedAt, processedBy, notes
```

#### Folio Model
```
- bookingId (unique), folioNumber (unique)
- lineItems [{date, description, category, amount, quantity, total, reference}]
- subtotal, taxTotal, grandTotal
- amountPaid, balance
- status (open, closed, void)
- closedAt
```

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/bookings/:bookingId/payments/intent | Create payment intent | Auth |
| POST | /api/bookings/:bookingId/payments/confirm | Confirm payment | Auth |
| POST | /api/bookings/:bookingId/payments/cash | Record cash payment | Front Desk |
| POST | /api/bookings/:bookingId/refund | Process refund | Manager |
| GET | /api/bookings/:bookingId/folio | Get folio | Auth |
| POST | /api/bookings/:bookingId/folio/charge | Add charge | Front Desk |
| GET | /api/bookings/:bookingId/payments | Payment history | Front Desk |
| POST | /api/bookings/:bookingId/resend-confirmation | Resend email | Front Desk |

### Email Templates
- Booking Confirmation
- Cancellation Notice
- Pre-Arrival Reminder
- Review Request
- Payment Receipt

---

## Phase 5: Operations (Steps 15-16)

### Models

#### HousekeepingTask Model
```
- propertyId, roomId, bookingId (optional)
- type (daily, checkout, deep, turndown, inspection)
- priority (low, normal, high, urgent)
- status (pending, in-progress, completed, verified)
- assignedTo (ref: User)
- scheduledDate, startedAt, completedAt
- verifiedAt, verifiedBy
- notes, duration
- issues [{description, severity, reportedAt, resolvedAt}]
```

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/housekeeping/tasks | List tasks | Housekeeping |
| GET | /api/housekeeping/dashboard | Dashboard stats | Housekeeping |
| POST | /api/housekeeping/tasks | Create task | Front Desk |
| PATCH | /api/housekeeping/tasks/:id/status | Update status | Housekeeping |
| POST | /api/housekeeping/tasks/:id/complete | Complete task | Housekeeping |
| POST | /api/housekeeping/tasks/:id/verify | Verify task | Front Desk |
| POST | /api/housekeeping/tasks/:id/assign | Assign task | Front Desk |
| POST | /api/housekeeping/tasks/:id/issue | Report issue | Housekeeping |
| GET | /api/front-desk/arrivals | Today's arrivals | Front Desk |
| GET | /api/front-desk/departures | Today's departures | Front Desk |
| GET | /api/front-desk/in-house | In-house guests | Front Desk |
| GET | /api/front-desk/room-rack | Room rack view | Front Desk |
| POST | /api/front-desk/walk-in | Create walk-in | Front Desk |
| POST | /api/front-desk/room-move | Move guest to new room | Front Desk |
| POST | /api/front-desk/extend-stay | Extend stay | Front Desk |
| POST | /api/front-desk/early-checkout | Early checkout | Front Desk |

---

## Phase 6: Reporting (Steps 17-18)

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/reports/occupancy | Occupancy report | Manager |
| GET | /api/reports/revenue | Revenue report | Manager |
| GET | /api/reports/room-type-performance | Room type performance | Manager |
| GET | /api/reports/source-analysis | Booking source analysis | Manager |
| GET | /api/reports/cancellation-analysis | Cancellation analysis | Manager |
| GET | /api/reports/daily-summary | Daily summary | Front Desk |
| GET | /api/dashboard/property | Property dashboard | Front Desk |
| GET | /api/dashboard/manager | Manager dashboard | Manager |

### Key Metrics
- **Occupancy Rate**: Rooms occupied / Total rooms
- **ADR (Average Daily Rate)**: Room revenue / Rooms sold
- **RevPAR (Revenue Per Available Room)**: Room revenue / Total rooms
- **Cancellation Rate**: Cancelled bookings / Total bookings

---

## Phase 7: Advanced (Steps 19-20)

### Models

#### Review Model
```
- propertyId, bookingId (unique), guestId
- ratings {overall (1-5), cleanliness, comfort, location, service, value}
- title, text, pros[], cons[]
- status (pending, approved, rejected)
- response {text, respondedAt, respondedBy}
- verifiedStay, helpful (count)
```

### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/reviews | List reviews (admin) | Manager |
| POST | /api/reviews | Submit review | Auth |
| PUT | /api/reviews/:id | Update review | Auth |
| DELETE | /api/reviews/:id | Delete review | Auth |
| POST | /api/reviews/:id/moderate | Approve/reject review | Manager |
| POST | /api/reviews/:id/respond | Respond to review | Manager |
| POST | /api/reviews/:id/helpful | Mark as helpful | Public |
| GET | /api/properties/:propertyId/reviews | Property reviews | Public |
| GET | /api/properties/:propertyId/reviews/summary | Rating summary | Public |
| GET | /api/user/me/reviews | My reviews | Auth |

---

## Project Structure

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Server entry point
├── common/
│   ├── enums/               # Domain enums
│   ├── errors/              # Custom error classes
│   ├── plugins/             # Mongoose plugins
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Utility functions
├── middleware/
│   ├── errorHandler.ts      # Global error handler
│   ├── validateRequest.ts   # Zod validation
│   ├── requireAuth.ts       # JWT authentication
│   └── requiredRole.ts      # Role authorization
├── models/                   # Mongoose models
├── modules/
│   ├── auth/                # Authentication
│   ├── property/            # Properties
│   ├── roomType/            # Room types
│   ├── room/                # Rooms
│   ├── ratePlan/            # Rate plans
│   ├── inventory/           # Inventory & availability
│   ├── guest/               # Guest profiles
│   ├── booking/             # Bookings
│   ├── addOn/               # Add-on services
│   ├── promotion/           # Promotions & discounts
│   ├── payment/             # Payments & billing
│   ├── notification/        # Email notifications
│   ├── housekeeping/        # Housekeeping tasks
│   ├── frontDesk/           # Front desk operations
│   ├── reports/             # Analytics & reports
│   ├── dashboard/           # Dashboard aggregations
│   └── review/              # Guest reviews
├── routes/                   # Legacy routes
└── lib/                      # External service integrations
```

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/hotel_booking

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
EMAIL_FROM=noreply@example.com
```

---

## Running the Application

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm start
```

---

## API Base URL

All hotel management endpoints are prefixed with `/api`:
- Auth: `/auth/*`
- User: `/user/*`
- Admin: `/admin/*`
- Hotel API: `/api/*`
