#!/bin/bash
set -e

echo "=== Desplegando PWA ==="

# Verificar que mobile/.env existe
if [ ! -f mobile/.env ]; then
    echo "ERROR: mobile/.env no existe"
    exit 1
fi

# Verificar que EXPO_PUBLIC_API_URL está configurada
if ! grep -q "EXPO_PUBLIC_API_URL" mobile/.env; then
    echo "ERROR: EXPO_PUBLIC_API_URL no está definida en mobile/.env"
    exit 1
fi

# Mostrar URL actual
echo "URL del API:"
grep "EXPO_PUBLIC_API_URL" mobile/.env

# 1. Ir a mobile y exportar
cd mobile
echo ""
echo "Generando build..."
npx expo export --platform web --clear

# 2. Volver a raíz y copiar al contenedor (raíz, no /hub-mobile/)
cd ..
echo ""
echo "Copiando archivos al servidor..."
docker compose cp mobile/dist/. ota-server:/usr/share/nginx/html/

# 3. Reiniciar
echo ""
echo "Reiniciando servidor..."
docker compose restart ota-server

echo ""
echo "=== Deploy completado ==="
echo ""
echo "IMPORTANTE: Si cambiaste el tunnel de cloudflared,"
echo "actualiza mobile/.env con la nueva URL ANTES de correr este script"
