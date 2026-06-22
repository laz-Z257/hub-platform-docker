# Dockerización — hub-platform

Plan para dockerizar todo el proyecto (web + api + mobile + db) y eliminar dependencias de terceros (Vercel, Render, EAS cloud).

---

## Servicios

| Servicio | Contenedor | Puerto | Siempre activo |
|----------|-----------|--------|----------------|
| **postgres** | postgres:16-alpine | 5432 | ✅ |
| **api** | Express (backend/Dockerfile) | 3001 | ✅ |
| **web** | Next.js (nuevo web/Dockerfile) | 3000 | ✅ |
| **mobile-builder** | Android SDK + Gradle (nuevo mobile/Dockerfile.builder) | — | ❌ (bajo demanda) |
| **nginx** | nginx:alpine + Let's Encrypt | 80/443 | ❌ (opcional) |

Sin Expo, sin EAS, sin Vercel, sin Render.

---

## Archivos nuevos a crear

| Archivo | Descripción |
|---------|-------------|
| `web/Dockerfile` | Multi-stage build de Next.js con output standalone |
| `mobile/Dockerfile.builder` | Contenedor con Node + Java 17 + Android SDK + Gradle para buildear APK |
| `mobile/scripts/build-apk.sh` | Script que ejecuta `gradle assembleRelease` y copia APK a `/output` |

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `docker-compose.yml` | Agregar servicios `web` y `mobile-builder` |
| `web/next.config.ts` | Agregar `output: "standalone"` |
| `web/src/lib/api.ts` | Fallback de API_URL a `http://api:3001/api` cuando esté en Docker |

---

## Comunicación

| Conexión | Origen → Destino | Puerto |
|----------|-----------------|--------|
| API → DB | api → postgres | 5432 |
| Web → API | web → api | 3001 |
| Mobile → API | celular → servidor:3001 | HTTP |
| Mobile → APK | celular → servidor/descargar-app | HTTP |

---

## Comandos

```bash
# Levantar todo
docker compose up -d

# Rebuildear tras cambios
docker compose up -d --build

# Buildear APK (bajo demanda)
docker compose run --rm mobile-builder
```

## Costos

Solo el VPS (~$5-10/mes). Cero dependencias externas.

## Requisitos del servidor

- Linux (Ubuntu 22.04+)
- Docker Engine + Docker Compose
- 4 GB RAM mínimo
- 20 GB disco

---

## Estado de la Dockerización — 22 Junio 2026

### ✅ Completado
| Servicio/Archivo | Detalle |
|---|---|
| `docker-compose.yml` | postgres, api, web, ota-server, ota-builder |
| `backend/Dockerfile` | Multi-stage build (build + prod), healthcheck |
| `web/Dockerfile` | Multi-stage build (deps + build + runner), standalone output |
| `web/next.config.ts` | `output: "standalone"` + rewrites API a `api:3001` |
| `web/src/lib/api.ts` | Fallback API_URL a `/api` (proxy vía Next rewrites) |
| `ota-server/Dockerfile` | Nginx Alpine sirviendo bundles OTA |
| `mobile/Dockerfile.ota` | Builder de bundles OTA (expo export) |

### ❌ Pendiente de implementar
| Servicio/Archivo | Detalle |
|---|---|
| `mobile/Dockerfile.builder` | Contenedor con Node + Java 17 + Android SDK + Gradle para buildear APK |
| `mobile/scripts/build-apk.sh` | Script que ejecuta `gradle assembleRelease` y copia APK a `/output` |
| Servicio `mobile-builder` en `docker-compose.yml` | Con `profiles: [build-only]` para ejecución bajo demanda |
| Nginx reverse proxy + Let's Encrypt | Opcional — puertos 80/443 para producción con SSL |

**Resumen:** API, web y OTA están dockerizados. Falta el builder de APK Android para eliminar dependencia de EAS Cloud.
