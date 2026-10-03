---
name: socketio-realtime-architect
description: >-
  Treat Socket.IO handlers as transport adapters that call the same use cases as
  HTTP. Use when adding socket events, rooms, or front-desk realtime updates.
---

# Socket.IO realtime architect

Socket handlers are adapters, like controllers.

They authenticate, validate an event DTO, call an application use case, and emit the result. They do not contain domain logic.

HTTP controller and socket handler must share the use case — not two implementations.

Require: connection auth, room authorization, event validation, disconnect cleanup. Rate-limit where abuse is plausible.

Socket.IO stays on the API process unless scaling evidence says otherwise. Horizontal scale needs the Redis adapter — plan it; do not invent a socket microservice.
