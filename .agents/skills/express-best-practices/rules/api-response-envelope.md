# API Response Envelope

Use helpers from `common/utils/controller-wrapper.ts` for consistent JSON shapes.

## Standard shapes

| Status  | Helper                         | Body                                  |
| ------- | ------------------------------ | ------------------------------------- |
| 201     | `created(res, data, message?)` | `{ message, data }`                   |
| 200     | `ok(res, data)`                | `{ data }`                            |
| 200     | `ok(res, data, message)`       | `{ message, data }`                   |
| 200     | `okPaginated(res, result)`     | paginated object as-is                |
| 200     | `okMessage(res, message)`      | `{ message }`                         |
| 204     | `noContent(res)`               | empty body                            |
| 4xx/5xx | `HttpError` or `errorHandler`  | `{ message }` or `{ message, error }` |

## Good

```typescript
return created(res, booking, 'Booking created successfully');
// → 201 { message: "Booking created successfully", data: { ... } }

return ok(res, booking);
// → 200 { data: { ... } }

return okPaginated(res, { data, total, page, limit, totalPages });
// → 200 { data: [...], total, page, limit, totalPages }
```

## Bad

```typescript
res.status(200).json(booking); // no envelope
res.status(201).json({ success: true, booking }); // non-standard keys
res.status(500).json({ error: 'Something broke' }); // bypass errorHandler
return res.json({ message: 'OK', result: data }); // use `data` not `result`
```

## Rules

- Controllers shape responses; services return plain objects/documents
- Never expose passwords, `tokenVersion`, or internal fields — use model `toJSON` transforms or `.select()`
- Paginated lists use `okPaginated` with `{ data, total, page, limit, totalPages }`
