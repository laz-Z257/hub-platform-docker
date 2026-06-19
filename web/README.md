# Plan Completo: Todo en Docker

## Servidores

| Servicio | Contenedor | Puerto | Estado |
|----------|-----------|--------|--------|
| postgres | postgres:16-alpine | 5432 | ✅ Listo |
| api | Express (backend/Dockerfile) | 3001 | ✅ Listo |
| web | Next.js (web/Dockerfile) | 3000 | ✅ Creado |
| ota-server | nginx (ota-server/Dockerfile) | 3002 | ✅ Creado |
| ota-builder | Expo (mobile/Dockerfile.ota) | — | ✅ Creado |

## Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `docker-compose.yml` (raíz) | Orquestación de todos los servicios |
| `web/Dockerfile` | Multi-stage build de Next.js |
| `web/next.config.ts` | output: "standalone" |
| `ota-server/Dockerfile` | nginx para servir bundles OTA |
| `ota-server/nginx.conf` | Config con CORS y cache |
| `mobile/Dockerfile.ota` | Build de bundles OTA |

## Comandos

```bash
# Levantar servidores
docker compose up -d

# Rebuildear tras cambios
docker compose up -d --build

# OTA update (cambios en mobile)
docker compose run --rm ota-builder

# Logs
docker compose logs -f
```

## Comunicación

```
web:3000 ──HTTP──> api:3001 ──> postgres:5432
celular ──HTTP──> tuservidor.com:3001/api
celular ──HTTP──> ota-server:3002 (updates)
celular ──HTTP──> web:3000/descargar-app (APK)
```

## Dependencias eliminadas

| Servicio | Antes | Ahora |
|----------|-------|-------|
| Web host | Vercel | Docker propio |
| API host | Render | Docker propio |
| DB host | Render | Docker propio |
| OTA updates | Expo cloud | Docker propio |
| Build APK | EAS cloud | Docker propio (pendiente mobile-builder) |

## Costo

Solo VPS (~$5-10/mes). Cero dependencias externas.
