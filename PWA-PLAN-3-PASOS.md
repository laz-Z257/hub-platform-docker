# PLAN PWA: 3 PASOS

## Resumen Rápido

| Paso | Qué | Archivos a Modificar |
|------|-----|---------------------|
| **1. PREPARAR** | Configurar mobile para web | `mobile/app.json`, `mobile/package.json` |
| **2. CONSTRUIR** | Generar build web y copiar a nginx | Archivos nuevos en `ota-server/` |
| **3. DESPLEGAR** | Actualizar nginx y rebuild | `ota-server/nginx.conf`, `docker-compose.yml` |

---

## PASO 1: PREPARAR

### 1.1 Modificar `mobile/app.json`

**ANTES** (líneas 32-35):
```json
"web": {
  "bundler": "metro",
  "favicon": "./assets/favicon.png"
}
```

**DESPUÉS**:
```json
"web": {
  "bundler": "metro",
  "favicon": "./assets/favicon.png",
  "backgroundColor": "#F5F6FA",
  "themeColor": "#F5F6FA",
  "description": "HUB AI Assistant - App de soporte"
}
```

### 1.2 Modificar `mobile/package.json`

**ANTES** (líneas 39-44):
```json
"scripts": {
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web"
}
```

**DESPUÉS**:
```json
"scripts": {
  "start": "expo start",
  "start:web": "expo start --web",
  "build:web": "expo export --platform web",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "npx serve dist"
}
```

### 1.3 Verificar que existe la carpeta de iconos

Necesitas estos archivos en `mobile/assets/`:
- `favicon.png` (ya existe según app.json)
- `icon.png` (ya existe según app.json)
- `splash-icon.png` (ya existe según app.json)

---

## PASO 2: CONSTRUIR

### 2.1 Crear carpeta destino en ota-server

```bash
mkdir -p ota-server/usr/share/nginx/html/hub-mobile
```

### 2.2 Generar el build web de Expo

```bash
cd mobile
npx expo export --platform web
```

Esto genera una carpeta `mobile/dist/` con todos los archivos estáticos.

### 2.3 Copiar archivos al servidor nginx

```bash
cp -r mobile/dist/* ota-server/usr/share/nginx/html/hub-mobile/
```

### 2.4 Estructura esperada en ota-server

```
ota-server/
├── Dockerfile
├── nginx.conf
└── usr/share/nginx/html/
    ├── hub-mobile/           ← NUEVO (la PWA)
    │   ├── _expo/
    │   ├── assets/
    │   ├── index.html
    │   └── ...
    └── (archivos OTA existentes)
```

---

## PASO 3: DESPLEGAR

### 3.1 Actualizar `ota-server/nginx.conf`

**ANTES**:
```nginx
server {
    listen 3002;
    server_name _;
    root /usr/share/nginx/html;

    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header X-Content-Type-Options "nosniff";

    location /_expo/ {
        types { application/javascript hbc; }
        add_header Cache-Control "no-cache";
    }

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = /metadata.json {
        add_header Cache-Control "no-store";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

**DESPUÉS**:
```nginx
server {
    listen 3002;
    server_name _;
    root /usr/share/nginx/html;

    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header X-Content-Type-Options "nosniff";

    # ===== PWA HUB MOBILE =====
    location /hub-mobile/ {
        alias /usr/share/nginx/html/hub-mobile/;
        try_files $uri $uri/ /hub-mobile/index.html;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # SPA fallback para Expo Router
    location = /hub-mobile {
        try_files $uri $uri/ /hub-mobile/index.html;
    }

    # ===== OTA EXISTENTE =====

    location /_expo/ {
        types { application/javascript hbc; }
        add_header Cache-Control "no-cache";
    }

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = /metadata.json {
        add_header Cache-Control "no-store";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 3.2 Rebuild del ota-server

```bash
docker compose build ota-server
```

### 3.3 Reiniciar el servicio

```bash
docker compose up -d ota-server
```

---

## VERIFICACIÓN

### Probar que la PWA funciona:

1. Abrir navegador en: `http://localhost:3002/hub-mobile`
2. Debería aparecer la pantalla de login de la app mobile
3. En Chrome Android: debería aparecer el banner de "Instalar"

### Probar que el OTA sigue funcionando:

1. Abrir: `http://localhost:3002/metadata.json`
2. Debería mostrar el JSON de updates de Expo

---

## URLs RESULTANTES

| Servicio | URL |
|----------|-----|
| PWA Mobile | `http://localhost:3002/hub-mobile` |
| OTA Updates | `http://localhost:3002` (existente) |
| Dashboard Web | `http://localhost:3000` (existente) |
| API Backend | `http://localhost:3001/api` (existente) |

---

## DESHACER SI ALGO SALE MAL

### Rollback completo:

```bash
# 1. Restaurar app.json original
cd mobile
git checkout app.json

# 2. Restaurar package.json original
git checkout package.json

# 3. Eliminar carpeta del PWA
rm -rf ../ota-server/usr/share/nginx/html/hub-mobile

# 4. Restaurar nginx.conf original
git checkout ../ota-server/nginx.conf

# 5. Rebuild nginx
docker compose build ota-server
docker compose up -d ota-server
```

---

## MANTENER AMBOS (EXPO APK + PWA)

Si quieres tener **los dos disponibles**:

- **APK**: `docker compose --profile build-only run mobile-builder` (compila APK)
- **PWA**: `http://localhost:3002/hub-mobile` (siempre disponible)

La URL del `app.json` para updates seguiría siendo `https://u.expo.dev/...` si usas Expo, o puedes cambiarla a `http://localhost:3002` para updates locales.

---

*Plan creado: 2026-07-08*
*Versión: 1.0*
