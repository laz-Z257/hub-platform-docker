#!/bin/bash
set -e

echo "=== Desplegando PWA ==="

# 1. Ir a mobile y exportar
cd mobile
echo "Generando build..."
npx expo export --platform web --clear

# 2. Volver a raíz y copiar al contenedor
cd ..
echo "Copiando archivos al servidor..."
docker compose cp mobile/dist/. ota-server:/usr/share/nginx/html/hub-mobile/

# 3. Reiniciar si es necesario
echo "Reiniciando servidor..."
docker compose restart ota-server

echo "=== Deploy completado ==="
echo "La PWA está disponible en:"
echo "https://push-simulation-plc-trout.trycloudflare.com"
