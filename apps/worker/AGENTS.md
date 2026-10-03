# Guesthouse worker

BullMQ process for the same modules as `apps/api`. Not a microservice.

```bash
pnpm --filter guesthouse-worker dev
```

Set `RUN_WORKERS=false` on the API when this process is running. Skills: `bullmq-job-architect`, `production-readiness`.
