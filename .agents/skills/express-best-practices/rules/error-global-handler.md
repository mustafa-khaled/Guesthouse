# Global Error Handler

`middleware/errorHandler.ts` is the single place for unhandled error mapping. Trust it.

## Good

```typescript
// service.ts
import { HttpError } from '../../common/errors/http.errors';

if (!booking) throw new HttpError(404, 'Booking not found');
if (booking.status === 'cancelled') throw new HttpError(400, 'Booking already cancelled');

// wrapController maps HttpError → res.status(code).json({ message })
// errorHandler maps unhandled → 500 { message, error?, requestId }
```

```typescript
// app.ts — always last
app.use(notFoundHandler);
app.use(errorHandler);
```

## Bad

```typescript
// Controller catches everything and returns ad-hoc shape
catch (error: any) {
  res.status(error.status || 500).json({
    message: error.message,
    stack: error.stack, // leaks internals in production
  });
}

// Multiple error response formats in the same API
{ message: "Not found" }
{ error: "Not found" }
{ success: false, msg: "Not found" }
```

## Error response shapes (by layer)

| Source                      | Shape                                             |
| --------------------------- | ------------------------------------------------- |
| `wrapController` validation | `400 { message: "Validation failed", errors }`    |
| `wrapController` HttpError  | `{status} { message }`                            |
| `errorHandler` HttpError    | `{status} { message, error }`                     |
| `errorHandler` unhandled    | `500 { message, error?, requestId }`              |
| `notFoundHandler`           | `404 { message: "Route METHOD /path not found" }` |

## Rules

- Throw `HttpError(statusCode, message)` from services for expected failures
- Do not log-and-swallow in controllers — `errorHandler` logs via `req.log.error`
- Sentry capture happens in `errorHandler` for unhandled errors
- Include `requestId` in 500 responses (already handled by errorHandler)
