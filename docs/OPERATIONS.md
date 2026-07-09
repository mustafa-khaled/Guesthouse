# Operations Runbook

## Health monitoring

| Probe       | Endpoint            | Expected                       |
| ----------- | ------------------- | ------------------------------ |
| Liveness    | `GET /health/live`  | `200`, `{ "status": "alive" }` |
| Readiness   | `GET /health/ready` | `200`, `{ "status": "ready" }` |
| Full health | `GET /health`       | `200`, MongoDB `pass`          |

Configure external uptime monitoring on `/health/live`. Alert when `/health/ready` fails for > 2 minutes.

## Logs

All services log JSON to stdout (Pino on backend). Docker log rotation is configured in `docker-compose.prod.yml` (10 MB × 3 files).

Correlate requests using `X-Request-Id` header (set by backend middleware).

## Database operations

### Index synchronization (run after deploy)

```bash
pnpm --filter backend ensure-indexes
```

### Backup

Automated backup script:

```bash
bash scripts/backup-mongodb.sh /var/backups/guesthouse
```

Set `BACKUP_OFFSITE_PATH` for rsync to remote storage. Cron example (daily at 2 AM):

```bash
0 2 * * * cd /path/to/guesthouse && bash scripts/backup-mongodb.sh /var/backups/guesthouse
```

Manual backup:
docker exec guesthouse-mongodb mongodump \
--uri="mongodb://admin:<password>@localhost:27017/guesthouse?authSource=admin" \
--out=/data/backup/$(date +%Y%m%d)

````

### Restore

```bash
docker exec guesthouse-mongodb mongorestore \
  --uri="mongodb://admin:<password>@localhost:27017/guesthouse?authSource=admin" \
  /data/backup/<date>
````

## Redis

Redis is required for BullMQ email/notification queues and distributed rate limiting. If Redis is unavailable:

- Rate limiting falls back to in-memory (single instance only)
- Email jobs fall back to synchronous send

## Smoke testing

```bash
bash scripts/smoke-test.sh https://your-domain.com
```

Optional auth check:

```bash
SMOKE_TEST_EMAIL=admin@example.com SMOKE_TEST_PASSWORD=secret \
  bash scripts/smoke-test.sh https://your-domain.com
```

## Incident response

### API returns 503 on `/health/ready`

1. Check MongoDB container: `docker compose ps mongodb`
2. Check logs: `docker compose logs backend mongodb`
3. Verify `MONGODB_URI` credentials

### Frontend cannot reach API

1. Verify `NEXT_PUBLIC_API_URL` was set at **build time**
2. Check `CORS_ORIGINS` includes the frontend URL
3. Confirm Nginx routes `/api` and `/auth` to backend

### Image uploads fail

1. Verify `CLOUDINARY_*` env vars on backend
2. Check upload size (max 5 MB per file)
3. Confirm `/api/upload/*` BFF route is reachable

### Rollback deployment

```bash
cd /path/to/guesthouse
export IMAGE_TAG=<previous-good-sha>
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
bash scripts/smoke-test.sh $DEPLOY_URL
```

## Security notes

- **Never** run `pnpm seed` in production (blocked by script guard)
- Rotate JWT secrets periodically; invalidates all sessions
- Restrict MongoDB and Redis ports in production (`docker-compose.prod.yml` does not expose them)
- Review Dependabot PRs weekly

## Graceful shutdown

Backend handles `SIGTERM` / `SIGINT`:

1. Stops accepting HTTP connections
2. Closes Socket.io
3. Stops BullMQ workers
4. Disconnects Redis and MongoDB

Compose `stop_grace_period: 30s` allows time for in-flight requests.
