#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost}"
BACKEND_URL="${BACKEND_URL:-$BASE_URL}"

echo "Running smoke tests against ${BASE_URL}"

curl -fsS "${BACKEND_URL}/health/ready" > /dev/null
echo "✓ Backend readiness"

curl -fsS "${BACKEND_URL}/health/live" > /dev/null
echo "✓ Backend liveness"

STATUS="$(curl -s -o /dev/null -w '%{http_code}' "${BACKEND_URL}/api/v1/search/properties")"
if [ "$STATUS" != "200" ]; then
  echo "✗ Public search endpoint returned ${STATUS}"
  exit 1
fi
echo "✓ Public property search"

FRONTEND_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/" -k 2>/dev/null || curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/")"
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "301" ] || [ "$FRONTEND_STATUS" = "302" ]; then
  echo "✓ Frontend reachable (${FRONTEND_STATUS})"
else
  echo "✗ Frontend returned ${FRONTEND_STATUS}"
  exit 1
fi

if [ -n "${SMOKE_TEST_EMAIL:-}" ] && [ -n "${SMOKE_TEST_PASSWORD:-}" ]; then
  LOGIN_STATUS="$(curl -s -o /dev/null -w '%{http_code}' \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${SMOKE_TEST_EMAIL}\",\"password\":\"${SMOKE_TEST_PASSWORD}\"}" \
    "${BACKEND_URL}/auth/login")"
  if [ "$LOGIN_STATUS" != "200" ]; then
    echo "✗ Auth login returned ${LOGIN_STATUS}"
    exit 1
  fi
  echo "✓ Auth login"
fi

echo "All smoke tests passed"
