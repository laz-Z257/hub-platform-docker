#!/usr/bin/env bash
# Backup de PostgreSQL (volumen pgdata) vía docker exec + retención.
# Uso: ./scripts/backup-db.sh  (opcional: BACKUP_DIR=./backups KEEP_DAYS=14)
#
# Cron (instalar con ./scripts/backup-db.sh --install-cron):
#   0 3 * * * cd /home/linux/Escritorio/hub-platform-docker && ./scripts/backup-db.sh >> backups/cron.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
CONTAINER="${POSTGRES_CONTAINER:-hub-postgres}"
PG_USER="${POSTGRES_USER:-hub_admin}"
PG_DB="${POSTGRES_DB:-hub_platform}"
STAMP=$(date +%Y%m%d_%H%M%S)

# --- Instalación del cron (opcional) ---
if [[ "${1:-}" == "--install-cron" ]]; then
  CRON_LINE="0 3 * * * cd $(pwd) && $(pwd)/scripts/backup-db.sh >> $(pwd)/backups/cron.log 2>&1 # hub-backup"
  mkdir -p backups
  if (crontab -l 2>/dev/null || true) | grep -qF "# hub-backup"; then
    echo "El cron de backup ya está instalado:"
    (crontab -l 2>/dev/null || true) | grep -F "# hub-backup"
  else
    (crontab -l 2>/dev/null || true; echo "$CRON_LINE") | crontab -
    echo "Cron instalado (backup diario a las 3:00 AM):"
    echo "  $CRON_LINE"
  fi
  exit 0
fi

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER" pg_dump -U "$PG_USER" "$PG_DB" | gzip > "$BACKUP_DIR/${PG_DB}_${STAMP}.sql.gz"

find "$BACKUP_DIR" -name "${PG_DB}_*.sql.gz" -mtime "+$KEEP_DAYS" -delete

echo "Backup OK: $BACKUP_DIR/${PG_DB}_${STAMP}.sql.gz (retención ${KEEP_DAYS} días)"
