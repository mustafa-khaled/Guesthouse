# Security Middleware Chain

Middleware order in `app.ts` is fixed. Do not reorder without understanding side effects.

## Order

```
1. helmet          — security headers, CSP for Stripe/Swagger
2. cors            — origin whitelist from config/cors.ts
3. compression     — gzip responses > 1KB
4. mongoSanitize   — strip $ and . from user input
5. hpp             — prevent HTTP parameter pollution
6. requestId       — X-Request-Id for tracing
7. pinoHttp        — structured request logging
8. webhooks        — express.raw BEFORE json parser
9. express.json    — JSON body parsing
10. cookieParser   — httpOnly refresh token cookies
11. routes         — feature routers with rate limiters
12. notFoundHandler
13. errorHandler
```

## Good

```typescript
// Webhooks need raw body for Stripe signature verification
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRouter);
app.use(express.json()); // after webhooks only
```

## Bad

```typescript
app.use(express.json()); // global json first
app.use('/api/v1/webhooks', webhookRouter); // Stripe signature verify fails

// Skip sanitize on user-facing routes
app.use('/api/v1', apiRouter); // before mongoSanitize

// Disable helmet in production
if (env.NODE_ENV === 'production') {
  /* no helmet */
}
```

## Rules

- Never mount `express.json()` before webhook routes
- `mongoSanitize` and `hpp` apply globally — do not bypass
- CORS origins come from `getCorsOrigins()` — do not hardcode
- Add new security middleware near the top of the chain, before routes
