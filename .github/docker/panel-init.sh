#!/usr/bin/env bash
set -euo pipefail

cd /var/www/pterodactyl

# Generate app key if missing (safe to retry)
php artisan key:generate --force >/dev/null 2>&1 || true

SEED_FLAG="/var/www/pterodactyl/storage/app/.seeded"

if [ ! -f "$SEED_FLAG" ]; then
  echo "[panel-init] First run detected: running migrations + seeds"
  php artisan migrate --force --seed
  touch "$SEED_FLAG"
else
  echo "[panel-init] Already seeded; running migrations only"
  php artisan migrate --force
fi

exit 0
