#!/bin/sh
# gc-uploads.sh — Limpia archivos en uploads/ que no tengan registro en BD
# Uso: ./gc-uploads.sh [--dry-run] [--limit N]

set -eu

DRY_RUN=false
LIMIT=0

for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --limit=*) LIMIT="${arg#*=}" ;;
    *) echo "Uso: $0 [--dry-run] [--limit=N]"; exit 1 ;;
  esac
done

UPLOAD_DIR="${UPLOAD_DIR:-/app/uploads}"
DB_URL="${DATABASE_URL:-}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL no definida"
  exit 1
fi

if [ ! -d "$UPLOAD_DIR" ]; then
  echo "Directorio $UPLOAD_DIR no existe"
  exit 0
fi

echo "=== GC Uploads $(date) ==="
echo "Directorio: $UPLOAD_DIR"
echo "Dry-run: $DRY_RUN"
[ $LIMIT -gt 0 ] && echo "Límite: $LIMIT archivos"

# Obtener lista de archivos referenciados en BD (solo incidents no borrados)
REFERENCED=$(psql "$DB_URL" -t -A -c "
  SELECT imagen_url FROM incidents
  WHERE imagen_url IS NOT NULL
    AND deleted_at IS NULL
" 2>/dev/null | sed 's|^/uploads/||' | sort -u)

# Contar archivos en disco
TOTAL=0
for f in "$UPLOAD_DIR"/*; do
  [ -f "$f" ] && TOTAL=$((TOTAL + 1))
done
echo "Archivos en disco: $TOTAL"

DELETED=0
FREED=0

for f in "$UPLOAD_DIR"/*; do
  [ $LIMIT -gt 0 ] && [ $DELETED -ge $LIMIT ] && break
  [ -f "$f" ] || continue

  BASENAME=$(basename "$f")
  if ! echo "$REFERENCED" | grep -qx "$BASENAME"; then
    SIZE=$(stat -c%s "$f" 2>/dev/null || echo 0)
    if [ "$DRY_RUN" = "true" ]; then
      echo "[DRY-RUN] Borraría: $BASENAME (${SIZE} bytes)"
    else
      rm -f "$f"
      echo "Borrado: $BASENAME (${SIZE} bytes)"
    fi
    DELETED=$((DELETED + 1))
    FREED=$((FREED + SIZE))
  fi
done

echo "=== Resumen ==="
echo "Archivos procesados: $TOTAL"
echo "Eliminados: $DELETED"
echo "Espacio liberado: $(numfmt --to=iec $FREED 2>/dev/null || echo "${FREED} bytes")"
echo "================="