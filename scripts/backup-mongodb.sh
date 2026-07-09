#!/usr/bin/env bash
# Automated MongoDB backup script for Guesthouse
# Usage: bash scripts/backup-mongodb.sh [backup-dir]
# Cron example (daily at 2 AM):
#   0 2 * * * cd /path/to/guesthouse && bash scripts/backup-mongodb.sh /var/backups/guesthouse >> /var/log/guesthouse-backup.log 2>&1

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="${MONGO_CONTAINER:-guesthouse-mongodb}"
DB_NAME="${MONGO_DB:-guesthouse}"
OFFSITE_PATH="${BACKUP_OFFSITE_PATH:-}"

mkdir -p "$BACKUP_DIR"

if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  MONGO_USER="${MONGO_ROOT_USERNAME:-admin}"
  MONGO_PASS="${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD must be set}"

  docker exec "$CONTAINER" mongodump \
    --uri="mongodb://${MONGO_USER}:${MONGO_PASS}@localhost:27017/${DB_NAME}?authSource=admin" \
    --out="/data/db/backup_${DATE}"

  docker cp "${CONTAINER}:/data/db/backup_${DATE}" "${BACKUP_DIR}/backup_${DATE}"

  docker exec "$CONTAINER" rm -rf "/data/db/backup_${DATE}"

  tar -czf "${BACKUP_DIR}/guesthouse_${DATE}.tar.gz" -C "${BACKUP_DIR}" "backup_${DATE}"
  rm -rf "${BACKUP_DIR}/backup_${DATE}"

  find "$BACKUP_DIR" -name 'guesthouse_*.tar.gz' -mtime +30 -delete

  echo "[$(date -Iseconds)] Backup created: ${BACKUP_DIR}/guesthouse_${DATE}.tar.gz"

  if [ -n "$OFFSITE_PATH" ]; then
    rsync -av "${BACKUP_DIR}/guesthouse_${DATE}.tar.gz" "${OFFSITE_PATH}/"
    echo "[$(date -Iseconds)] Copied to off-site: ${OFFSITE_PATH}"
  fi
else
  echo "[$(date -Iseconds)] ERROR: MongoDB container '${CONTAINER}' not running" >&2
  exit 1
fi
