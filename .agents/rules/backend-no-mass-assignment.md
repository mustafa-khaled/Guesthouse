---
trigger: glob
globs: 'apps/api/**/*.ts'
description: Never persist req.body or Object.assign untrusted objects into Mongo
---

# No mass assignment

Never:

```ts
await User.updateOne({ _id }, req.body);
Object.assign(user, req.body);
```

Parse with a Zod schema, then persist only explicit allowlisted fields.

This blocks clients from setting `role`, `isVerified`, balances, or other privileged fields.
