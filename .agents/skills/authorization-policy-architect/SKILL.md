---
name: authorization-policy-architect
description: >-
  Put authorization in policies over domain resources, not role ifs in
  controllers. Use when adding RBAC, canView/canCancel, staff vs guest access.
---

# Authorization policy architect

Do not scatter `if (user.role === 'admin')` in controllers.

Use policies:

```ts
bookingPolicy.canView(user, booking);
bookingPolicy.canCancel(user, booking);
roomPolicy.canUpdate(user, property);
```

The controller authenticates and passes the actor. The use case enforces authorization on the **loaded resource**.

Route middleware (`requireAuth`, `requireFrontDesk`, …) is a coarse gate. Resource rules still belong in application/domain.

Never trust client-sent role or "I own this id" without loading the entity.
