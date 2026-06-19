# Plan Completo: Todo en Docker

---

## Servicios

| Servicio | Contenedor | Puerto | Estado |
|----------|-----------|--------|--------|
| postgres | postgres:16-alpine | 5432 | ✅ Ya existe |
| api | Express (backend/Dockerfile) | 3001 | ✅ Ya existe |
| web | Next.js (NUEVO web/Dockerfile) | 3000 | ❌ Por crear |
| ota-server | nginx (NUEVO ota-server/Dockerfile) | 3002 | ❌ Por crear |
| ota-builder | Expo (NUEVO mobile/Dockerfile.ota) | — | ❌ Por crear |

---

## Archivos a crear

| Archivo | Propósito | Líneas |
|---------|-----------|--------|
| `docker-compose.yml` (raíz) | Orquestar todos los servicios | ~60 |
| `web/Dockerfile` | Multi-stage build de Next.js | ~20 |
| `web/next.config.ts` | Agregar `output: "standalone"` | +1 línea |
| `ota-server/Dockerfile` | nginx para servir bundles OTA | ~5 |
| `ota-server/nginx.conf` | Config con CORS y cache | ~25 |
| `mobile/Dockerfile.ota` | Generar bundles OTA desde Expo | ~8 |

---

## docker-compose.yml (raíz)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: hub-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-hub_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-hub_secret}
      POSTGRES_DB: ${POSTGRES_DB:-hub_platform}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hub_admin -d hub_platform"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: ./backend
    container_name: hub-api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgres://hub_admin:hub_secret@postgres:5432/hub_platform
      JWT_SECRET: ${JWT_SECRET:-hub_jwt_secret_dev_2026}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-hub_jwt_refresh_secret_dev_2026}
      PORT: ${PORT:-3001}
      NODE_ENV: ${NODE_ENV:-development}
    depends_on:
      postgres:
        condition: service_healthy

  web:
    build: ./web
    container_name: hub-web
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://api:3001/api
    depends_on:
      - api

  ota-server:
    build: ./ota-server
    container_name: hub-ota-server
    ports:
      - "3002:3002"
    volumes:
      - ota-data:/usr/share/nginx/html:ro
    restart: unless-stopped

  ota-builder:
    build:
      context: ./mobile
      dockerfile: Dockerfile.ota
    container_name: hub-ota-builder
    profiles:
      - build-only
    volumes:
      - ota-data:/output

volumes:
  pgdata:
  ota-data:
```

---

## web/Dockerfile

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ota-server/Dockerfile

```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3002
CMD ["nginx", "-g", "daemon off;"]
```

---

## ota-server/nginx.conf

```nginx
server {
    listen 3002;
    server_name _;
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

---

## mobile/Dockerfile.ota

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["sh", "-c", "npx expo export --platform android --output-dir /output && echo 'OTA listo'"]
```

---

## web/next.config.ts (agregar output standalone)

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
};
```

---

## Comunicación entre servicios

```
web:3000 ──HTTP──> api:3001 ──> postgres:5432
celular ──HTTP──> tuservidor.com:3001/api
celular ──HTTP──> ota-server:3002 (buscar updates)
celular ──HTTP──> web:3000/descargar-app (APK)
```

---

## Comandos

```bash
# Levantar todo
docker compose up -d

# Rebuildear tras cambios
docker compose up -d --build api web

# OTA update (cambios en mobile JS/UI)
docker compose run --rm ota-builder

# Buildear APK (cambios nativos en mobile)
docker compose run --rm mobile-builder

# Ver logs
docker compose logs -f
```

---

## Dependencias eliminadas

| Servicio | Antes | Después |
|----------|-------|---------|
| Web host | **Vercel** (tercero) | Docker propio |
| API host | **Render** (tercero) | Docker propio |
| DB host | **Render PostgreSQL** (tercero) | Docker propio |
| OTA updates | **Expo cloud** (tercero, límite gratis) | Docker propio |
| Build APK | **EAS cloud** (tercero, límite gratis) | Docker propio |

---

## Costo mensual

| Concepto | Costo |
|----------|-------|
| VPS | $5-10/mes |
| Dominio (opcional) | ~$10/año |
| SSL (Let's Encrypt) | Gratis |
| **Total** | **$5-10/mes** |

Sin Vercel, sin Render, sin Expo cloud, sin EAS, sin límites, cero terceros.
