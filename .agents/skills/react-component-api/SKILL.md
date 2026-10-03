---
name: react-component-api
description: >-
  Intentional React props for Guesthouse UI. Use when creating or changing
  components, callbacks, composition, or prop drilling. Apply after react-state-architect.
---

# React component API

Every prop is a real dependency of that component. Do not add props for one caller, styling escape hatches, or to tunnel data through intermediates that do not use them.

Prefer composition (`children`, slots) over configuration flags (`variant="specialGuestModal"`).

Callbacks should name events the component emits (`onClose`, `onSubmit`), not the caller's workflow (`onChargeStripeAndNavigate`).

Do not forward `className` through domain screens to dodge Matcha. Primitives live in `components/ui`.

Apply after `react-state-architect`. If a parent only exists to pass props, move the consumer closer to the owner (Query, RHF, URL, Auth).
