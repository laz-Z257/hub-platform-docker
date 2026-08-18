#!/usr/bin/env bash
# Backup de PostgreSQL (volumen pgdata) vía docker exec + retención.
# Uso: ./scripts/backup-db.sh  (opcional: BACKUP_DIR=./backups KEEP_DAYS=14)
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
CONTAINER="${POSTGRES_CONTAINER:-hub-postgres}"
PG_USER="${POSTGRES_USER:-hub_admin}"
PG_DB="${POSTGRES_DB:-hub_platform}"
STAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER" pg_dump -U "$PG_USER" "$PG_DB" | gzip > "$BACKUP_DIR/${PG_DB}_${STAMP}.sql.gz"

find "$BACKUP_DIR" -name "${PG_DB}_*.sql.gz" -mtime "+$KEEP_DAYS" -delete

echo "Backup OK: $BACKUP_DIR/${PG_DB}_${STAMP}.sql.gz (retención ${KEEP_DAYS} días)"
