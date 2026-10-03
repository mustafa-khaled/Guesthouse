# Guesthouse worker

BullMQ process isolation for the same business modules as `apps/api`. This is **not** a microservice.

Set `RUN_WORKERS=false` on the API process when this worker is running so jobs are not processed twice.

```bash
pnpm --filter guesthouse-worker dev
```
