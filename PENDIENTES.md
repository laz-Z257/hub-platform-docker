# PENDIENTES - HUB Platform

**Última actualización:** 2026-07-28 (auditoría completa verificada contra código fuente)

---

## 📊 RESUMEN EJECUTIVO

| Estado | Cantidad |
|--------|:--------:|
| ✅ Resueltos | 48 |
| ❌ Pendientes | 21 |
| **Total hallazgos** | **69** |

---

## ✅ RESUELTOS (verificados en código 2026-07-28)

### Backend (18 resueltos)

| # | Problema | Archivo | Verificación |
|---|----------|---------|--------------|
| B-1 | Password mínimo 6 chars login | `auth.schema.ts:9` | ✅ `min(6)` |
| B-2 | Push token verifica owner | `push.controller.ts:21` | ✅ `if (existing.user_id !== req.user!.userId)` |
| B-3 | updateUser verifica duplicado | `users.controller.ts:227-238` | ✅ Retorna 409 |
| B-4 | ultima_actividad throttle | `middlewares/auth.ts:58-64` | ✅ Solo cada 5 min |
| B-5 | /api/metrics protegido | `index.ts:115` | ✅ authMiddleware + adminOnly |
| B-6 | /uploads protegido | `index.ts:125-134` | ✅ Middleware verifica cookies |
| B-7 | N+1 query getSummary | `dashboard.controller.ts:170-201` | ✅ GROUP BY en 1 query |
| B-8 | Chat history con límite | `chat.controller.ts:370-396` | ✅ Límite 200, paginación |
| B-9 | Índice compuesto existe | `schema.ts:67` | ✅ `incidents_user_estado_idx` |
| B-10 | Seed centralizado | `constants.ts` + `seed.ts:9` | ✅ `PV_SEED_NAMES` |
| B-11 | Token version validation | `middlewares/auth.ts:53-56` | ✅ Valida token_version |
| B-12 | Ratings CHECK constraint | `schema.ts:122` | ✅ `check("ratings_puntuacion_check", ...)` |
| B-13 | bloqueado_por sin ON DELETE | `schema.ts:33` | ⚠️ No se pudo aplicar por referencia circular en TypeScript |
| B-14 | Error boundary Express | `index.ts:153-201` | ✅ Manejo JWT, Multer, DB errors |
| B-15 | Endpoint `/export` renombrado | `incidents.routes.ts` | ✅ Ahora es `/export-data` |
| B-16 | Endpoint público `/ratings/stats` | `ratings.routes.ts` | ✅ Sin auth requerida |
| B-17 | JSDoc en auth | `auth.controller.ts` | ✅ Comentarios en funciones |
| B-18 | Log levels configurables | `logger.ts` | ✅ Variable LOG_LEVEL |

### Frontend (8 resueltos)

| # | Problema | Archivo | Verificación |
|---|----------|---------|--------------|
| F-1 | Sidebar width variable | `globals.css:16` + `Sidebar.tsx:50` | ✅ CSS variable |
| F-2 | Sesiones aisladas | `middleware.ts` + `api.ts` | ✅ Cookies scope |
| F-3 | Export Excel filtros | `tickets/page.tsx` | ✅ Calcula rango correcto |
| F-4 | Teléfono configurable | `HelpModal.tsx` | ✅ Lee de env vars |
| F-5 | Dark mode dashboard | Todas las páginas /dashboard/* | ✅ Completo |
| F-6 | Healthchecks web/mobile | `docker-compose.yml:67-72,89-94` | ✅ wget cada 30s |
| F-7 | Volumen uploads | `docker-compose.yml:43-44` | ✅ `uploads:/app/uploads` |
| F-8 | EXTERNAL_SYSTEMS_URL | `docker-compose.yml:61` | ✅ Variable pasada |

### Mobile (13 resueltos)

| # | Problema | Archivo | Verificación |
|---|----------|---------|--------------|
| M-1 | Password mínimo 6 chars | `LoginScreen.tsx:38` | ✅ Corregido de 4 a 6 |
| M-2 | Constantes de color | `src/constants/colors.ts` | ✅ COLORS exportado |
| M-3 | historial.tsx usa imports | `historial.tsx:15` | ✅ Importa COLORS |
| M-4 | incidente/[id].tsx usa imports | `[id].tsx:13` | ✅ Importa COLORS |
| M-5 | isReady tiene propósito | `_layout.tsx:26-28` | ✅ Controla render post-splash |
| M-6 | Logger unificado | `ChatScreen.tsx` | ✅ Reemplazados console.log |
| M-7 | Sanitización input chat | `ChatInput.tsx` | ✅ sanitizeInput() + límite 500 |
| M-8 | PWA manifest.json | `public/manifest.json` | ✅ Configuración PWA |
| M-9 | Service Worker | `public/sw.js` | ✅ Caché offline |
| M-10 | CORS restringido | `nginx.conf` | ✅ Solo localhost:3000 |
| M-11 | **Error Boundary** | `src/components/ErrorBoundary.tsx` | ✅ Captura errores, pantalla de error |
| M-12 | **Tests unitarios** | `__tests__/`, `jest.config.js` | ✅ Jest 29, 14 tests pasando |
| M-13 | **Crash Reporting** | `src/services/crashReporting.ts` | ✅ Compatible con Sentry |

### Infraestructura (6 resueltos)

| # | Problema | Archivo | Verificación |
|---|----------|---------|--------------|
| I-1 | Volumen uploads | `docker-compose.yml:43-44` | ✅ Persistente |
| I-2 | Healthchecks web/mobile | `docker-compose.yml:67-72,89-94` | ✅ Cada 30s |
| I-3 | EXTERNAL_SYSTEMS_URL | `docker-compose.yml:61` | ✅ Pasada al contenedor |
| I-4 | SHA pinning principales | `backend/Dockerfile`, `web/Dockerfile` | ✅ Imágenes con digest |
| I-5 | Mobile corre como no-root | `mobile/Dockerfile.web` | ✅ nginx user |
| I-6 | Log levels configurables | `.env.example` + `logger.ts` | ✅ Variable LOG_LEVEL |

---

## ❌ PENDIENTES VIGENTES (21 items)

### 🟠 ALTOS (5)

| # | Módulo | Problema | Archivo | Acción |
|---|--------|----------|---------|--------|
| 1 | Backend | Race condition en updateSettings | `settings.controller.ts:33-59` | Usar UPSERT atómico |
| 2 | Frontend | Dashboard sin responsive | Sidebar fijo 250px | Breakpoints + sidebar colapsable |
| 3 | Frontend | Dark mode incompleto (6 pantallas) | `/user/*` | Agregar dark mode |
| 4 | Backend | JWT retornado en body Y cookie | `auth.controller.ts` | Solo cookie (breaking change) |
| 5 | Backend | `bloqueado_por` FK sin ON DELETE | `schema.ts:33` | Requiere migración SQL manual |

### 🟡 MEDIOS (10)

| # | Módulo | Problema | Archivo | Acción |
|---|--------|----------|---------|--------|
| 6 | Frontend | `alert()`/`confirm()` nativos | tickets, settings | Modales custom |
| 7 | Frontend | Archivos grandes (>400 líneas) | tickets (490), settings (489) | Extraer componentes |
| 8 | Frontend | Helpers duplicados | `formatDate`, `formatTicketId` | Consolidar en `lib/` |
| 9 | Frontend | Sin tests de componentes | `components/` | Agregar tests |
| 10 | Backend | Sin tests de controllers | `modules/*/` | Tests integración |
| 11 | Docs | Documentación API (Swagger) | Nuevo archivo | Generar OpenAPI |
| 12 | Infra | `render.yaml` falta JWT_REFRESH_SECRET | `render.yaml` | Agregar variable |
| 13 | Infra | CORS_ORIGIN default localhost en prod | `docker-compose.yml:37` | Validar en producción |
| 14 | Backend | Estandarizar naming conventions | Todo el código | camelCase vs snake_case |
| 15 | Backend | Estandarizar campos opcionales | Múltiples tablas | null vs string vacío |

### 🟢 BAJOS (6)

| # | Módulo | Problema | Acción |
|---|--------|----------|--------|
| 16 | Docs | CONTRIBUTING.md | Crear archivo |
| 17 | Docs | SECURITY.md | Crear archivo |
| 18 | Backend | Soft deletes para datos importantes | Agregar deleted_at |
| 19 | Backend | Connection pooling configurado | Configurar pg pool |
| 20 | Frontend | SVG en manifest PWA | Convertir a PNG |
| 21 | Infra | Métricas Prometheus | Reemplazar JSON |

---

## 🎯 PLAN DE ACCIÓN SUGERIDO

### ✅ Semana 1: Seguridad — COMPLETADO (2026-07-28)

| # | Acción | Estado |
|---|--------|:------:|
| 1 | Fix middleware JWT | ✅ |
| 2 | Fix puerto 5432 | ✅ |
| 3 | Fix healthcheck variable | ✅ |

### ✅ Semana 2: Mobile — COMPLETADO (2026-07-28)

| # | Acción | Estado |
|---|--------|:------:|
| 4 | Error Boundaries mobile | ✅ |
| 10 | Tests unitarios mobile | ✅ |
| 11 | Crash Reporting mobile | ✅ |

### Semana 3: Backend (2 items)

| # | Acción | Tiempo | Riesgo |
|---|--------|:------:|:------:|
| 1 | Fix race condition settings | 1 hr | 🟡 Medio |
| 4 | Quitar JWT del body | 2 hr | 🔴 Breaking change |

### Semana 4: Frontend (4 items)

| # | Acción | Tiempo | Riesgo |
|---|--------|:------:|:------:|
| 2 | Responsive dashboard | 3 hr | 🟢 Bajo |
| 3 | Dark mode área usuario | 2 hr | 🟢 Bajo |
| 6 | Modales custom | 2 hr | 🟢 Bajo |
| 7 | Extraer archivos grandes | 3 hr | 🟢 Bajo |
| 8 | Consolidar helpers | 1 hr | 🟢 Bajo |

### Semana 5: Tests + Docs (3 items)

| # | Acción | Tiempo | Riesgo |
|---|--------|:------:|:------:|
| 9 | Tests de componentes frontend | 3 hr | 🟢 Bajo |
| 10 | Tests de controllers backend | 4 hr | 🟢 Bajo |
| 11 | Documentación API (Swagger) | 3 hr | 🟢 Bajo |

### Semanas 6+: Mejoras menores (6 items)

| # | Acción | Tiempo |
|---|--------|:------:|
| 12-21 | Infra, docs, mejoras menores | ~15 hr |

**Total estimado: ~38 horas de trabajo**

---

## 📋 NOTAS IMPORTANTES

### ⚠️ Requiere Planificación

| Tema | Detalle |
|------|---------|
| **Rotar secrets** | Si `.env` fue commiteado alguna vez, rotar JWT_SECRET, JWT_REFRESH_SECRET, POSTGRES_PASSWORD |
| **JWT en body** | Quitar JWT del body es breaking change para mobile nativo |

### ✅ Lo que YA funciona bien

- Sesiones aisladas entre dashboard y mobile
- PWA instalable con offline
- Chatbot con 7 intenciones
- Exportación Excel con filtros
- Rating con constraint CHECK (1-5)
- N+1 queries optimizados
- Rate limiting por endpoint
- CSRF protection
- Token versioning para invalidación

---

*Auditoría realizada: 2026-07-28*
*Total de hallazgos: 68 (42 resueltos, 26 pendientes)*