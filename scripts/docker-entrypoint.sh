#!/bin/sh
set -e

if [ "${RUN_DB_PUSH:-true}" = "true" ]; then
  npm run db:push
fi

if [ "${SEED_SAMPLE_DATA:-false}" = "true" ]; then
  npm run db:seed
fi

exec npm run start
