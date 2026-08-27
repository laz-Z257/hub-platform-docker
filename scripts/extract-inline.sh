#!/bin/sh
# extract-inline.sh — Reemplaza <style> y <script> inline en index.html por archivos externos
set -e

DIST_DIR="${1:-/app/mobile/dist}"
INDEX="$DIST_DIR/index.html"

if [ ! -f "$INDEX" ]; then
  echo "ERROR: $INDEX no encontrado"
  exit 1
fi

echo "Extrayendo inline de $INDEX ..."

# Copiar archivos externos a assets/
cp /tmp/extract-assets/reset.css "$DIST_DIR/assets/reset.css"
cp /tmp/extract-assets/sw-register.js "$DIST_DIR/assets/sw-register.js"

# Reemplazar <style id="expo-reset">...</style> por link a reset.css
awk '
  /<style id="expo-reset">/ {
    print "    <link rel=\"stylesheet\" href=\"/assets/reset.css\">"
    skip=1; next
  }
  /<\/style>/ && skip { skip=0; next }
  skip { next }
  { print }
' "$INDEX" > "${INDEX}.tmp"

# Reemplazar primer <script>...</script> (service worker) por script src
awk '
  !done && /<script>$/ {
    print "  <script src=\"/assets/sw-register.js\" defer></script>"
    skip=1; next
  }
  skip && /<\/script>/ { skip=0; done=1; next }
  skip { next }
  { print }
' "${INDEX}.tmp" > "$INDEX"

rm -f "${INDEX}.tmp"
echo "Done: reset.css + sw-register.js extraídos"
