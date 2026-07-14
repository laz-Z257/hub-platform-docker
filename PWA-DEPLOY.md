# PWA Deploy - HUB Mobile

## Tabla de Contenidos

1. [Quick Start](#quick-start)
2. [URLs y Credenciales](#urls-y-credenciales)
3. [Logo e Iconos](#logo-e-iconos)
4. [Despliegue Completo](#despliegue-completo)
5. [Cuando cambia el Tunnel](#cuando-cambia-el-tunnel)
6. [Instalación en Celular](#instalación-en-celular)
7. [Archivos del PWA](#archivos-del-pwa)
8. [Debug](#debug)
9. [Errores Comunes](#errores-comunes)

---

## Quick Start

```bash
# 1. Asegurar que servicios Docker están corriendo
docker compose up -d postgres api web ota-server

# 2. Regenerar y desplegar PWA
./deploy-pwa.sh

# 3. Ver URL del tunnel
cat /tmp/cloudflared.log | grep trycloudflare
```

---

## URLs y Credenciales

| Servicio | URL |
|----------|-----|
| **PWA (celular)** | `https://<tunnel>.trycloudflare.com` |
| Dashboard Web | `http://localhost:3000` |
| API Backend | `http://localhost:3001/api` |

| Campo | Valor |
|-------|-------|
| Documento | `123456789` |
| Contraseña | `admin123` |

---

## Logo e Iconos

### Archivos de icono

```
mobile/assets/
├── icon-512.png    # Principal (512x512 PNG con transparencia)
├── icon.png        # Copia del 512
├── favicon.png     # Copia del 512
└── logo.png        # Logo original
```

### Regenerar iconos desde logo.png

Si necesitas regenerar los iconos:

```bash
cd mobile/assets && python3 << 'EOF'
from PIL import Image
logo = Image.open('logo.png')
size = 512
new_img = Image.new('RGBA', (size, size), (245, 246, 250, 255))
logo_ratio = logo.width / logo.height
if logo_ratio > 1:
    new_width = int(size * 0.8)
    new_height = int(new_width / logo_ratio)
else:
    new_height = int(size * 0.8)
    new_width = int(new_height * logo_ratio)
x = (size - new_width) // 2
y = (size - new_height) // 2
logo_resized = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
new_img.paste(logo_resized, (x, y), logo_resized)
new_img.save('icon-512.png')
new_img.save('icon.png')
new_img.save('favicon.png')
print("Iconos generados: icon-512.png, icon.png, favicon.png")
EOF
```

### Generar favicon.ico manualmente

```bash
cd mobile/assets && python3 << 'EOF'
from PIL import Image
img = Image.open('icon-512.png')
sizes = [16, 32, 48]
icons = [img.resize((s, s), Image.Resampling.LANCZOS) for s in sizes]
icons[0].save('favicon.ico', format='ICO', sizes=[(s, s) for s in sizes])
print("favicon.ico generado")
EOF
```

---

## Despliegue Completo

### Paso 1: Obtener URL del tunnel

```bash
# Iniciar cloudflared en background
nohup ./cloudflared tunnel --url http://localhost:3002 > /tmp/cloudflared.log 2>&1 &

# Esperar y obtener URL
sleep 6
grep "trycloudflare.com" /tmp/cloudflared.log
```

### Paso 2: Actualizar .env con la URL

```bash
echo "EXPO_PUBLIC_API_URL=https://TU-URL.trycloudflare.com/api" > mobile/.env
```

**⚠️ IMPORTANTE:** La URL debe terminar en `/api`

```
✅ CORRECTO:  https://tu-dominio.com/api
❌ INCORRECTO: https://tu-dominio.com
```

### Paso 3: Generar build PWA

```bash
cd mobile
rm -rf .expo dist
EXPO_PUBLIC_API_URL=https://TU-URL.trycloudflare.com/api npx expo export --platform web --clear
```

### Paso 4: Copiar iconos y manifest al dist

```bash
# Crear carpeta assets si no existe
mkdir -p dist/assets

# Copiar icono
cp assets/icon-512.png dist/assets/icon-512.png

# Copiar favicon
cp assets/favicon.ico dist/favicon.ico

# Crear manifest.json
cat > dist/manifest.json << 'MANIFEST'
{
  "name": "HUB AI Assistant",
  "short_name": "HUB",
  "description": "HUB AI Assistant - App de soporte",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F6FA",
  "theme_color": "#F5F6FA",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/assets/icon-512.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
MANIFEST
```

### Paso 5: Actualizar index.html con meta tags PWA

```bash
cat > dist/index.html << 'HTML'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="theme-color" content="#F5F6FA">
    <meta name="description" content="HUB AI Assistant - App de soporte">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="HUB">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/assets/icon-512.png">
    <link rel="icon" type="image/png" href="/assets/icon-512.png">
    <title>HUB AI Assistant</title>
    <style id="expo-reset">
      html, body { height: 100%; overflow: hidden; }
      #root { display: flex; height: 100%; flex: 1; }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
HTML
```

### Paso 6: Desplegar al contenedor

```bash
cd ..
docker compose cp mobile/dist/. ota-server:/usr/share/nginx/html/
docker compose restart ota-server
```

---

## Cuando cambia el Tunnel

Cada vez que cloudflared se reinicia, genera una URL nueva.

```bash
# 1. Obtener nueva URL
grep "trycloudflare.com" /tmp/cloudflared.log

# 2. Actualizar mobile/.env
echo "EXPO_PUBLIC_API_URL=https://NUEVA-URL.trycloudflare.com/api" > mobile/.env

# 3. Regenerar y desplegar
cd mobile && npx expo export --platform web --clear
cd ..
docker compose cp mobile/dist/. ota-server:/usr/share/nginx/html/
docker compose restart ota-server
```

---

## Instalación en Celular

### Requisitos

- **Android:** Chrome (no Safari ni otros navegadores)
- **iOS:** Safari (pero notificaciones push no funcionan en iOS)

### Pasos para instalar

1. Abre la URL en Chrome de tu celular
2. Espera ~30 segundos en la página principal
3. Debería aparecer un banner inferior **"Agregar HUB a pantalla de inicio"**
4. Toca **"Agregar"** o **"Instalar"**

### Si no aparece el banner

1. Toca el menú `⋮` (tres puntos arriba a la derecha)
2. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
3. Confirma la instalación

### Si sigue sin aparecer

- Asegúrate de estar en la página principal (`/`)
- Abre en modo incógnito
- Verifica que tienes conexión a internet
- Limpia cache del navegador: Settings → Site settings → Clear storage

---

## Archivos del PWA

Después del build, `mobile/dist/` debe contener:

```
mobile/dist/
├── index.html          # Entry point con meta tags PWA
├── manifest.json       # Manifest de la PWA
├── favicon.ico         # Icono favicon
├── sw.js               # Service worker (opcional)
├── assets/
│   └── icon-512.png    # Icono 512x512
└── _expo/static/      # JS/CSS bundle
```

**⚠️ IMPORTANTE:** Si `npx expo export` no genera el `manifest.json` o el `assets/icon-512.png`, créalos manualmente como se indica arriba.

---

## Debug

```bash
# Ver estado servicios Docker
docker compose ps

# Ver logs ota-server
docker compose logs -f ota-server

# Ver logs cloudflared
cat /tmp/cloudflared.log

# Verificar API responde
curl http://localhost:3002/api/health

# Verificar manifest
curl http://localhost:3002/manifest.json

# Verificar icono
curl -I http://localhost:3002/assets/icon-512.png

# Verificar URL embebida en JS bundle
docker exec hub-ota-server grep -o "https://[a-zA-Z0-9-]*\.trycloudflare\.com/api" /usr/share/nginx/html/_expo/static/js/web/index-*.js | head -1
```

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Sin conexión a internet" | URL del API incorrecta embebida | Regenerar PWA con URL correcta |
| 405 Method Not Allowed | URL sin `/api` | Agregar `/api` al final de la URL |
| No aparece "Instalar" | No es Chrome o PWA no configurada | Usar Chrome, verificar manifest.json |
| Icono borroso | Icono menor a 512x512 | Regenerar iconos a 512x512 |
| Cache old | PWA cacheada con datos antiguos | Desinstalar y reinstallar, o abrir en incógnito |
| Tunnel no conecta | Cloudflared cerrado | Reiniciar cloudflared |

---

## Script deploy-pwa.sh (automático)

```bash
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
rm -rf .expo dist
EXPO_PUBLIC_API_URL=$(grep "EXPO_PUBLIC_API_URL" mobile/.env | cut -d= -f2) npx expo export --platform web --clear

# 2. Copiar iconos si no existen
mkdir -p dist/assets
[ ! -f dist/assets/icon-512.png ] && cp assets/icon-512.png dist/assets/icon-512.png
[ ! -f dist/favicon.ico ] && cp assets/favicon.ico dist/favicon.ico

# 3. Crear manifest.json si no existe
if [ ! -f dist/manifest.json ]; then
cat > dist/manifest.json << 'MANIFEST'
{
  "name": "HUB AI Assistant",
  "short_name": "HUB",
  "description": "HUB AI Assistant - App de soporte",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F6FA",
  "theme_color": "#F5F6FA",
  "orientation": "portrait",
  "icons": [
    { "src": "/assets/icon-512.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/assets/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
MANIFEST
fi

# 4. Volver a raíz y copiar al contenedor
cd ..
echo ""
echo "Copiando archivos al servidor..."
docker compose cp mobile/dist/. ota-server:/usr/share/nginx/html/

# 5. Reiniciar
echo ""
echo "Reiniciando servidor..."
docker compose restart ota-server

echo ""
echo "=== Deploy completado ==="
```

---

*Última actualización: 2026-07-14*
