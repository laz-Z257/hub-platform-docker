# Plan: OTA Updates Propio — App sin Terceros

---

## 1. Objetivo

Que la app móvil reciba actualizaciones automáticas **sin depender de Expo cloud, EAS ni Google Play**.

Actualmente la app apunta a Expo cloud. El plan es reemplazarlo por un servidor **tuyo** dentro de Docker.

---

## 2. Arquitectura final

```
🐳 SERVIDOR DOCKER (tuservidor.com)
├── postgres (5432)
├── api (3001)
├── web (3000) → también sirve APK en /descargar-app
│
├── ota-builder → contenedor TEMPORAL (bajo demanda)
│   comando: docker compose run --rm ota-builder
│   genera bundles en volumen "ota-data"
│
└── ota-server (3002) → sirve los bundles a la app
    mismo volumen: ota-data
```

---

## 3. Archivos nuevos a crear

| Archivo | Propósito |
|---------|-----------|
| `mobile/Dockerfile.ota` | Contenedor que ejecuta `expo export --platform android` |
| `ota-server/Dockerfile` | nginx que sirve los bundles (puerto 3002) |
| `ota-server/nginx.conf` | Config de nginx con CORS y cache control |
| `mobile/scripts/build-ota.sh` | Script para buildear OTA localmente |

### 3.1 mobile/Dockerfile.ota

```
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["sh", "-c", "npx expo export --platform android --output-dir /output && echo 'OTA listo en /output'"]
```

### 3.2 ota-server/Dockerfile

```
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3002
CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 ota-server/nginx.conf

```
server {
    listen 3002;
    root /usr/share/nginx/html;

    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";

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
}
```

### 3.4 mobile/scripts/build-ota.sh

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")/.."
npx expo export --platform android --output-dir ./ota-output
```

---

## 4. Archivos a modificar

### 4.1 docker-compose.yml

Agregar al final, antes de `volumes`:

```yaml
  ota-builder:
    build:
      context: ./mobile
      dockerfile: Dockerfile.ota
    container_name: hub-ota-builder
    profiles:
      - build-only
    volumes:
      - ota-data:/output

  ota-server:
    build: ./ota-server
    container_name: hub-ota-server
    ports:
      - "3002:3002"
    volumes:
      - ota-data:/usr/share/nginx/html:ro
    restart: unless-stopped

volumes:
  pgdata:
  ota-data:
```

### 4.2 mobile/app.json

Cambiar `updates.url` de Expo cloud a tu servidor:

```json
"updates": {
  "url": "http://tuservidor.com:3002",
  "enabled": true,
  "fallbackToCacheTimeout": 0
}
```

> ⚠️ Este cambio requiere buildear APK nueva (porque app.json va dentro del APK).

---

## 5. Orden de implementación

### DÍA 1 — Preparar archivos

```
□ Crear mobile/Dockerfile.ota
□ Crear ota-server/Dockerfile
□ Crear ota-server/nginx.conf
□ Crear mobile/scripts/build-ota.sh (chmod +x)
□ Modificar docker-compose.yml (agregar ota-builder + ota-server + ota-data)
□ Modificar mobile/app.json (cambiar updates.url)
□ git add . && git commit -m "feat: OTA server propio" && git push
□ docker compose up -d --build
□ docker compose run --rm ota-builder
□ Verificar: curl http://localhost:3002/metadata.json
```

### DÍA 2 — Buildear APK final (1 de julio o cuando puedas)

```
□ eas build --platform android --profile preview
   (esto genera APK con la URL de updates apuntando a tu servidor)
□ Descargar APK del link que da EAS
□ Las asesoras instalan esta APK (SOLO UNA VEZ)
```

### DÍA 3 en adelante — Todos los cambios por OTA

```
Cuando modifiques código en mobile/ (UI, pantallas, lógica):
□ docker compose run --rm ota-builder
□ Las asesoras abren la app → detecta cambios → descarga en segundos
□ SIN buildear APK, SIN EAS, SIN Expo cloud
```

---

## 6. Cuándo buildear APK nueva

| Tipo de cambio | Necesita APK nueva |
|---------------|-------------------|
| Cambios de UI (textos, colores, botones) | ❌ Solo OTA |
| Nueva pantalla o flujo | ❌ Solo OTA |
| Nueva librería JS | ❌ Solo OTA |
| **Nueva librería nativa** (cámara, GPS, biometrics) | ✅ Sí |
| **Cambio en app.json** (updates.url, plugins) | ✅ Sí |
| **Cambio en native code** (android/app/, ios/) | ✅ Sí |

---

## 7. Costos de por vida

| Concepto | Costo |
|----------|-------|
| VPS | $5-10/mes |
| Build APK inicial | 1 build gratis EAS (julio) |
| OTA updates (todos los que quieras) | **$0** |
| **Total mensual** | **$5-10** |

Sin Expo cloud, sin EAS recurrente, sin Google Play, sin límites.
