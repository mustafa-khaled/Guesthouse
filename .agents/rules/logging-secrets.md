---
trigger: always_on
description: Never log credentials, tokens, payment secrets, or sensitive PII
alwaysApply: true
---

# Logging secrets

Never log:

- passwords, OTP codes, password-reset tokens
- JWT access or refresh tokens, authorization headers, cookie contents
- Stripe secret keys, webhook secrets, full payment method / card data
- Cloudinary API secrets, SMTP passwords
- full government IDs or unnecessary sensitive PII

Log `requestId`, route, status, and duration. Log `userId` when it is already in request context. Redact before structured logging.
