#!/usr/bin/env bash
# Smoke test post-deploy: verifica que la PWA mobile y el API estén realmente sanos.
# Atrapa regresiones donde el contenedor responde 200 pero el bundle está roto
# (ej: variables EXPO_PUBLIC_* vacías por .env excluido del contexto de build).
#
# Uso: ./scripts/smoke-test.sh [base_url_mobile] [base_url_api]

set -euo pipefail

MOBILE_URL="${1:-http://localhost:8081}"
API_URL="${2:-http://localhost:3001/api}"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

fail() { echo "❌ FALLO: $1" >&2; exit 1; }
ok()   { echo "✅ $1"; }

command -v curl >/dev/null || fail "curl no está instalado"
command -v grep >/dev/null || fail "grep no está instalado"

# NOTA: no usar `curl ... | grep -q` en este script — con `set -o pipefail`,
# grep -q sale temprano y curl recibe SIGPIPE, marcando la tubería como fallida.
# Se descarga a archivo temporal y se grepea el archivo.

# 1. API responde
curl -sf --max-time 10 "$API_URL/health" >/dev/null || fail "API no responde en $API_URL/health"
ok "API healthy ($API_URL/health)"

# 2. PWA mobile sirve el index
curl -sf --max-time 10 -o "$TMP_DIR/index.html" "$MOBILE_URL/" || fail "PWA mobile no responde en $MOBILE_URL"
ok "PWA mobile sirve index.html"

# 3. El bundle JS existe y no contiene el error de variable faltante
BUNDLE=$(grep -o 'index-[^"]*\.js' "$TMP_DIR/index.html" | head -1)
[ -n "$BUNDLE" ] || fail "No se encontró el bundle JS en el index.html"

# Expo sirve el bundle real bajo _expo/static/js/web/; el path raíz cae al
# fallback SPA de nginx y devuelve HTML — hay que descargar el archivo real.
if ! curl -sf --max-time 20 -o "$TMP_DIR/bundle.js" "$MOBILE_URL/_expo/static/js/web/$BUNDLE"; then
  curl -sf --max-time 20 -o "$TMP_DIR/bundle.js" "$MOBILE_URL/$BUNDLE" \
    || fail "No se pudo descargar el bundle $BUNDLE"
fi
[ -s "$TMP_DIR/bundle.js" ] || fail "El bundle $BUNDLE está vacío"

if grep -aq "environment variable is required" "$TMP_DIR/bundle.js"; then
  fail "El bundle contiene el error 'EXPO_PUBLIC_API_URL environment variable is required' (variable vacía en build)"
fi
ok "Bundle $BUNDLE sin errores de variables de entorno"

# 4. El bundle tiene la URL del API inlinada (no vacía)
if grep -aqE '"/api"|https?://[^"]+/api' "$TMP_DIR/bundle.js"; then
  ok "URL del API (/api) presente en el bundle"
else
  fail "No se encontró la URL del API inlinada en el bundle — revisar EXPO_PUBLIC_API_URL en el build"
fi

echo ""
echo "🎉 Smoke test OK"
