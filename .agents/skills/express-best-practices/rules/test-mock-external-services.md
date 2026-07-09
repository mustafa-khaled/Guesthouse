# Mock External Services

Backend integrates with Stripe, Cloudinary, nodemailer, and Redis. Mock these in tests — never hit real APIs.

## Services to mock

| Service    | Module                   | Mock strategy                           |
| ---------- | ------------------------ | --------------------------------------- |
| Stripe     | `lib/stripe.ts`          | `vi.mock("../../lib/stripe")`           |
| Cloudinary | `lib/cloudinary.ts`      | `vi.mock("../../lib/cloudinary")`       |
| Email      | `lib/email.ts` / workers | `vi.mock("../../lib/email")`            |
| Redis      | `lib/redis.ts`           | Falls back to in-memory for rate limits |
| BullMQ     | `lib/queue.ts`           | Mock queue add; or test sync fallback   |

## Good

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({ id: 'pi_test', client_secret: 'secret' }),
    },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({ type: 'payment_intent.succeeded', data: {} }),
    },
  },
}));

describe('PaymentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates payment intent', async () => {
    const result = await paymentService.createIntent(bookingId);
    expect(result.clientSecret).toBe('secret');
  });
});
```

## Bad

```typescript
// Real Stripe call in test — needs API key, flaky, costs money
const intent = await stripe.paymentIntents.create({ amount: 1000, currency: 'usd' });

// Real email send in test
await sendEmail({ to: 'test@example.com', subject: 'Test' });

// No mock — webhook test depends on Stripe CLI running
```

## Rules

- Unit tests for services: mock external `lib/` clients with `vi.mock`
- Integration tests: mock at the `lib/` boundary, not inside service business logic
- Webhook tests: mock `constructEvent` to return typed event payloads
- Verify mock calls with `expect(stripe.paymentIntents.create).toHaveBeenCalledWith(...)`
- Queue workers: test job handler function directly, not the BullMQ connection
