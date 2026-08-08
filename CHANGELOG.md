# Changelog

## 2026-08-05 — Dashboard: módulos externos vacíos

- Se agregaron 10 tarjetas vacías adicionales en Sistemas Externos para futuras integraciones.
- Las tarjetas aparecen como "Próximamente" y no tienen endpoints ni URLs configuradas.

## 2026-07-31 — Documentación: README reescrito + módulos del backend

- **README.md reescrito** por componente: Estructura, Arquitectura, Quick Start, Backend API (endpoints, roles, intenciones del bot, sesiones aisladas), Dashboard Web, Mobile PWA, Deploy VPS (Nginx + certbot), Variables, Comandos, Infra, Documentación y Estado de Calidad.
- **Guía de deploy corregida**: orden Nginx HTTP → certbot, `EXPO_PUBLIC_API_URL=/api` (era una URL pública inexistente), firewall `ufw`, `EXTERNAL_SYSTEMS_URL` documentada, `NEXT_PUBLIC_API_URL` marcada opcional.
- **`backend/src/modules/README.md` (nuevo)**: documentación uniforme de los 11 módulos (endpoints, auth, límites y comportamientos clave).
- **`PENDIENTES.md` eliminado**: 75/76 ítems resueltos, 0 pendientes (se referenciaba desde la tabla Documentación).

---

## 2026-07-31 — Infraestructura: retirada la distribución APK/OTA desde Docker

- Se eliminaron los builders y el servidor OTA propios (`mobile/Dockerfile.builder`, `mobile/Dockerfile.ota` y `ota-server/`).
- Los builds nativos y las actualizaciones OTA mediante Expo EAS siguen siendo opcionales y están configurados en `mobile/eas.json` y `mobile/app.json`.

---

## 2026-07-31 — Seguridad: URL sistema externo movida al backend (redirect server-side)

### Motivación

La URL del sistema externo (`http://192.168.60.66:8100/...`) estaba inyectada en el bundle JS del frontend (visible con F12 para cualquier visitante). Se movió al backend para que nunca llegue al navegador.

### Cambios

| Cambio | Archivo | Detalle |
|--------|---------|---------|
| **Nuevo módulo `external-systems`** | `backend/src/modules/external-systems/` | Controller + routes con `GET /api/external-systems/:module` que responde 302 al destino real |
| **Protección** | `external-systems.routes.ts` | `authMiddleware` + `adminOnly` (solo admin/tecnico logueados) |
| **Variable de entorno** | `env.ts`, `docker-compose.yml` | `EXTERNAL_SYSTEMS_URL` solo en backend |
| **Frontend sin URL** | `web/.../external-systems/page.tsx` | Link a ruta relativa `/api/external-systems/traslados` |
| **Build args limpiados** | `docker-compose.yml`, `web/Dockerfile` | Eliminado `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL` (ya no se usa) |
| **Tests** | `external-systems.controller.test.ts` | 2 tests: redirect 302 y 404 para módulo no configurado |

### Verificación

- ✅ URL real NO aparece en el bundle del frontend (0 ocurrencias)
- ✅ Sin auth: 401 · Con admin: 302 al sistema externo · Módulo no configurado: 404
- ✅ Backend: 148/148 tests pasando
- ✅ tsc OK, contenedores `hub-api` y `hub-web` reconstruidos y healthy

---

## 2026-07-31 — Revisión completa: fix CSRF, TS mobile, catches vacíos y lint

### Fix: 403 CSRF al cerrar ticket en dashboard (multi-pestaña)

### Bug

El backend **rotaba la cookie `csrf-token`** en cada llamada a `/auth/me`, `/auth/login` y `/auth/refresh`. Como el frontend guarda el token en memoria JS (por pestaña) pero la cookie es compartida entre pestañas del navegador, abrir una segunda pestaña o recargar invalidaba el token en memoria de la primera → `403 CSRF token inválido` al hacer `PATCH /api/incidents/:id` (cerrar/resolver ticket).

### Corregido

| Cambio | Archivo | Detalle |
|--------|---------|---------|
| **Nuevo `getOrCreateCsrfToken()`** | `backend/src/middlewares/csrf.ts` | Reutiliza el token existente en cookie; solo genera uno nuevo si no hay cookie o es inválida |
| **Sin rotación** | `auth.controller.ts` | `login`, `register`, `me` y `refresh` usan `getOrCreateCsrfToken` en vez de generar siempre uno nuevo |
| **Tests actualizados** | `auth.controller.test.ts` | Mock de `getOrCreateCsrfToken` en register y login |

### Verificación

- ✅ Reproducido el fallo multi-pestaña (403) antes del fix
- ✅ Confirmado que pasa después del fix (mismo token en `me` + PATCH OK)
- ✅ Tests backend: 146/146 pasando
- ✅ TypeScript: 0 errores
- ✅ Contenedor `hub-api` reconstruido y healthy

### Fix: Error TS en mobile (bloqueaba compilación)

| Cambio | Archivo | Detalle |
|--------|---------|---------|
| **useRef sin valor inicial** | `mobile/src/screens/ChatScreen.tsx:78` | `useRef<ReturnType<typeof setTimeout>>()` → `useRef<... | null>(null)`. TypeScript 5.5+ exige argumento en `useRef`. |

### Fix: `.catch(() => {})` silenciosos en páginas `/user/*`

| Archivo | Líneas | Detalle |
|---------|--------|---------|
| `chat/page.tsx` | 80, 84, 228 | Agregado `logger.error` a los catch de incidents, ratings y resolved incident |
| `reportar/page.tsx` | 46, 49 | Agregado import de `logger` + `logger.error` en history y puntos de venta |

### Fix: Lint web — de 4 warnings a 0

| Archivo | Detalle |
|---------|---------|
| `user/(main)/layout.tsx` | Agregado `router` a deps de useEffect (estable en Next.js) |
| `user/(main)/page.tsx` | Idem |
| `user/(main)/chat/page.tsx` | Idem |
| `contexts/AuthContext.tsx` | Silenciado con `eslint-disable` + comentario (agregar `pathname` re-ejecutaría `/auth/me` en cada navegación) |

### Verificación final

- ✅ Backend: 146/146 tests, tsc OK, build OK
- ✅ Web: 46/46 tests, tsc OK, build OK, lint 0 warnings
- ✅ Mobile: 14/14 tests, tsc OK
- ✅ Contenedores `hub-api`, `hub-web`, `hub-mobile` reconstruidos y healthy
- ✅ Smoke test: health OK, web/mobile 200

---

## 2026-07-29 — Frontend: Refactor y Tests de Componentes

### Refactor de Archivos Grandes

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **tickets/page.tsx** | 505→362 líneas | Extraído CreateTicketModal.tsx |
| **settings/page.tsx** | 511→230 líneas | Extraídos SettingsEmpresaTab, SettingsAparienciaTab, SettingsMantenimientoTab |

### Tests de Componentes

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Modal.test.tsx** | 7 tests | Tests para renderizado, interacciones, tipos |
| **TicketTable.test.tsx** | 5 tests | Tests para renderizado, estados, acciones |
| **CreateTicketModal.test.tsx** | 6 tests | Tests para formulario, validación, submit |
| **useModal.test.ts** | 5 tests | Tests para hook de modales |

### Configuración de Tests

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **vitest.config.ts** | Actualizado | Agregado plugin-react para soporte JSX |
| **vitest.setup.ts** | Nuevo | Setup para jest-dom |
| **package.json** | Actualizado | Agregadas dependencias de testing |

### Estado Frontend

- ✅ Tests: 46/46 pasando
- ✅ TypeScript: 0 errores
- ✅ Build exitoso
- ✅ Archivos refactorizados bajo 400 líneas
- ✅ Cobertura de tests en componentes principales

---

## 2026-07-29 — Frontend e Infra: Pendientes Completados

### Frontend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Dashboard responsive** | Docker | Reconstruido sin caché, responsive aplicado |
| **Dark mode parcial** | `user/ajustes/page.tsx` | Clases dark: agregadas |
| **Modales custom** | `Modal.tsx`, `useModal.ts` | Componente Modal y hook useModal creados |
| **Reemplazo alert/confirm** | `ajustes/page.tsx`, `tickets/page.tsx`, `settings/page.tsx` | 6 usos reemplazados con modales custom |
| **Helpers centralizados** | `lib/utils.ts` | formatTicketId centralizado, eliminadas 3 copias duplicadas |

### Infraestructura

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Iconos PNG PWA** | `public/icons/`, `manifest.json` | Iconos PNG 192x192 y 512x512 generados |
| **Métricas Prometheus** | `middlewares/metrics.ts`, `package.json` | prom-client instalado, middleware actualizado a formato Prometheus |

### Estado Frontend/Infra

- ✅ Tests: 146/146 pasando en backend
- ✅ TypeScript: 0 errores
- ✅ Build exitoso
- ✅ Responsive aplicado
- ✅ Dark mode parcial
- ✅ Modales custom implementados
- ✅ Métricas Prometheus operativas

---

## 2026-07-29 — Backend: Pendientes Completados (Parte 2)

### Fixes de Seguridad y Calidad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Queries sin filtro deleted_at** | `incidents.controller.ts`, `ratings.controller.ts` | 3 queries corregidas para filtrar soft deletes |
| **Tests de controllers** | 8 archivos `.test.ts` nuevos | Tests para chat, dashboard, incidents, puntos-venta, push, ratings, upload, users |
| **openapi.yaml completo** | `backend/openapi.yaml` | 14 endpoints agregados + fix PUT/PATCH en settings |
| **`as any` en tests** | `auth.schema.test.ts` | Reemplazado con `@ts-expect-error` |

### Estado Backend

- ✅ Tests: 146/146 pasando (antes 114)
- ✅ TypeScript: 0 errores
- ✅ API healthy
- ✅ Soft deletes completamente implementados
- ✅ Documentación API completa

---

## 2026-07-29 — Backend: Pendientes Completados

### Seguridad y Estabilidad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Race condition fix** | `settings.controller.ts` | UPSERT atómico con `onConflictDoUpdate` para evitar condiciones de carrera |
| **FK bloqueado_por** | SQL manual | Migración SQL para agregar ON DELETE SET NULL |
| **JWT solo en cookies** | `auth.controller.ts`, `mobile/src/services/api.ts`, `web/src/lib/api.ts` | Token eliminado del body, solo cookies httpOnly |
| **Soft deletes** | `schema.ts`, múltiples controllers | Campo `deleted_at` en `users` e `incidents`, todas las queries filtran por `IS NULL` |

### Documentación y Tests

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **OpenAPI/Swagger** | `backend/openapi.yaml` | Documentación completa de la API REST |
| **Tests controllers** | `settings.controller.test.ts`, `auth.controller.test.ts` | 114 tests pasando |

### Archivos Modificados

- `backend/src/db/schema.ts` - Agregados `deleted_at` y columna `key` única
- `backend/src/modules/settings/settings.controller.ts` - UPSERT atómico
- `backend/src/modules/auth/auth.controller.ts` - JWT solo en cookies, filtros soft delete
- `backend/src/modules/incidents/incidents.controller.ts` - Soft delete + filtros
- `backend/src/modules/users/users.controller.ts` - Filtros soft delete
- `backend/src/modules/dashboard/dashboard.controller.ts` - Filtros soft delete
- `backend/src/modules/chat/chat.controller.ts` - Filtros soft delete
- `backend/src/modules/ratings/ratings.controller.ts` - Filtros soft delete
- `backend/src/middlewares/auth.ts` - Filtros soft delete
- `mobile/src/services/api.ts` - Solo cookies
- `mobile/src/contexts/AuthContext.tsx` - Solo cookies
- `web/src/lib/api.ts` - Solo cookies
- `web/src/contexts/AuthContext.tsx` - Solo cookies

### Estado Backend

- ✅ Tests: 114/114 pasando
- ✅ TypeScript: 0 errores
- ✅ API healthy
- ✅ Soft deletes operativos
- ✅ UPSERT atómico implementado
- ✅ JWT solo en cookies

---

## 2026-07-28 — Dashboard Responsive (pendiente de aplicar)

### Frontend Web

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Sidebar colapsable en móvil** | `Sidebar.tsx` | Drawer que se abre/cierra con overlay en pantallas < 1024px |
| **Botón menú hamburguesa** | `Topbar.tsx` | Visible solo en móvil (< 1024px) |
| **Layout responsive** | `dashboard/layout.tsx` | Estado para manejar sidebar móvil, contenido adaptable |
| **Dashboard page responsive** | `dashboard/page.tsx` | Grid adaptable (1/2/3 columnas), títulos y padding responsive |
| **TicketsTable responsive** | `TicketsTable.tsx` | Scroll horizontal en móvil, padding adaptable |
| **UserManagement responsive** | `UserManagement.tsx` | Tamaños y padding adaptables a pantallas pequeñas |

**⚠️ Estado:** Código implementado pero no visible en el contenedor Docker. Requiere reconstruir sin caché:
```bash
docker compose build --no-cache web && docker compose up -d web
```

### Breakpoints

- **Móvil**: < 640px (sidebar oculto, 1 columna)
- **Tablet**: 640px - 1024px (sidebar oculto, 2 columnas)
- **Desktop**: >= 1024px (sidebar fijo, 3 columnas)

---

## 2026-07-28 — Mobile: TypeScript limpio al 100%

### Mobile

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Fix TypeScript Input.tsx** | `src/components/Input.tsx` | Reemplazados `name` e `id` (HTML) por `testID` (React Native) |
| **Fix TypeScript SafeAreaProviderWrapper** | `src/components/SafeAreaProviderWrapper.tsx` | Agregado type assertion para compatibilidad de tipos |

### Estado Mobile

- ✅ TypeScript: 0 errores
- ✅ Tests: 14/14 pasando
- ✅ Error Boundaries: Implementados
- ✅ Crash Reporting: Implementado
- ✅ Sesiones aisladas: Funcionando

---

## 2026-07-28 — Mobile: Error Boundaries, Tests y Crash Reporting

### Mobile

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Error Boundary** | `mobile/src/components/ErrorBoundary.tsx`, `mobile/app/_layout.tsx` | Captura errores de React, muestra pantalla de error, permite recargar |
| **Crash Reporting Service** | `mobile/src/services/crashReporting.ts` | Servicio compatible con Sentry, captura errores con device info |
| **Tests Unitarios** | `mobile/__tests__/`, `mobile/jest.config.js` | Jest 29 + Testing Library, 14 tests pasando |
| **Crash Reporting integrado** | `mobile/src/components/ErrorBoundary.tsx` | ErrorBoundary envía reportes a Sentry si está configurado |

### Detalles

**Error Boundary:**
- Wrapper en `_layout.tsx` que captura errores de toda la app
- Pantalla de error con opciones: "Ir al Inicio" y "Recargar"
- En modo DEV muestra detalles del error
- Loguea errores con logger + crash reporting

**Crash Reporting:**
- Servicio compatible con Sentry (configurable via `EXPO_PUBLIC_SENTRY_DSN`)
- Captura: error message, stack trace, component stack, device info
- Device info: modelo, OS, versión de app
- Si no hay DSN, solo loguea localmente
- Integrado con ErrorBoundary

**Tests:**
- Jest 29 con preset `@react-native/jest-preset`
- Testing Library para React Native
- Tests de constantes de color (URGENCIA_COLORS, ESTADO_COLORS, etc.)
- Tests de logger service
- 14 tests pasando

---

## 2026-07-28 — Fix sesiones aisladas (logout + refresh)

### Bug Fix

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Logout aislado por scope** | `backend/src/modules/auth/auth.controller.ts` | Logout solo limpia cookies del scope (admin/user), NUNCA todas |
| **Refresh aislado por scope** | `backend/src/modules/auth/auth.controller.ts` | Refresh solo limpia cookies del scope si falla, NUNCA todas |
| **Mobile envía X-Auth-Scope** | `mobile/src/services/api.ts` | Header `X-Auth-Scope: user` en todas las peticiones y refresh |

### Problema resuelto

**Síntoma:** Cerrar sesión en mobile también cerraba la sesión del dashboard.

**Causa raíz:** Mobile y dashboard comparten cookies en `localhost` (mismo dominio, distinto puerto). El backend usaba `clearAllTokenCookies()` que borraba admin_token TAMBIÉN.

**Dónde ocurría:**
1. `logout()` catch → `clearAllTokenCookies()` → borraba admin_token
2. `refresh()` fail → `clearAllTokenCookies()` → borraba admin_token
3. `refresh()` token_version mismatch → `clearAllTokenCookies()` → borraba admin_token

**Solución:**
- `logout()` ahora usa `clearTokenCookies(res, scope)` — solo limpia user_* o admin_*
- `refresh()` ahora usa `clearTokenCookies(res, scope)` — solo limpia user_* o admin_*
- `clearAllTokenCookies` ya NO se usa en auth.controller.ts
- Mobile envía `X-Auth-Scope: user` para que el backend sepa qué scope limpiar

---

## 2026-07-28 — 3 fixes críticos de seguridad

### Seguridad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Puerto 5432 no expuesto** | `docker-compose.yml:10` | Postgres ya no es accesible desde el host. Backend se conecta por red interna Docker |
| **Healthcheck parametrizado** | `docker-compose.yml:14` | Usa `${POSTGRES_USER}` y `${POSTGRES_DB}` en vez de valores hardcodeados |
| **Middleware valida JWT** | `web/src/middleware.ts` | Verifica estructura y expiración del token (sin validar firma). Previene acceso con cookies falsas |

### Detalles del middleware JWT

- Decodifica JWT (base64url) sin verificar firma (eso lo hace el backend)
- Verifica 3 partes separadas por `.`
- Verifica claim `exp` > timestamp actual
- Si token inválido/expirado → redirect a login
- Si token válido → acceso normal
- Evita loops de redirect: token inválido en /login NO redirecta a dashboard

---

## 2026-07-28 — Auditoría completa + fixes de seguridad

### Auditoría

| Cambio | Detalle |
|--------|---------|
| **Auditoría completa del código** | Revisión línea por línea de backend, frontend, mobile e infraestructura |
| **PENDIENTES.md actualizado** | 42 resueltos verificados, 26 pendientes reales identificados |
| **READMEs actualizados** | Todos los READMEs sincronizados con estado actual |

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Constraint CHECK en ratings** | `backend/src/db/schema.ts` | Agregado `check("ratings_puntuacion_check", ...)` para validar 1-5 en BD |

### Mobile

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Password mínimo 6 chars** | `mobile/src/screens/LoginScreen.tsx:38` | Corregido de 4 a 6 caracteres (consistente con backend) |

---

## 2026-07-27 — Fix isReady state en mobile

### Mobile

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **isReady state restaurado** | `mobile/app/_layout.tsx` | Agregado `if (!isReady) return null;` para prevenir flash de contenido antes de ocultar splash screen |

---

## 2026-07-27 — 10 mejoras de calidad y seguridad

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Renombrar `/export` a `/export-data`** | `backend/src/modules/incidents/incidents.routes.ts`, `web/src/components/AnalyticsFilters.tsx`, `web/src/app/dashboard/tickets/page.tsx` | Ruta más descriptiva |
| **Endpoint público `/api/ratings/stats`** | `backend/src/modules/ratings/ratings.controller.ts`, `ratings.routes.ts` | Estadísticas básicas sin autenticación |
| **Límite/paginación en chat history** | `backend/src/modules/chat/chat.controller.ts` | Límite máximo 200, paginación con offset |
| **Seed duplicado eliminado** | `backend/src/db/constants.ts` (nuevo), `seed.ts`, `puntos-venta.controller.ts` | Lista centralizada en constants.ts |

### Web Dashboard

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Teléfono HelpModal configurable** | `web/src/components/HelpModal.tsx`, `.env.example`, `docker-compose.yml` | Variables `NEXT_PUBLIC_SUPPORT_WHATSAPP` y `NEXT_PUBLIC_SUPPORT_PHONE` |
| **Sidebar width variable** | `web/src/app/globals.css`, `Sidebar.tsx`, `Topbar.tsx`, `dashboard/layout.tsx` | Variable CSS `--sidebar-width` |

### Mobile

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **isReady state eliminado** | `mobile/app/_layout.tsx` | Código muerto removido |

---

## 2026-07-27 — Seguridad y error handling mejorado

### Seguridad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Validación token_version** | `backend/src/middlewares/auth.ts` | Middleware ahora valida token_version para invalidar tokens tras logout |
| **Error boundary mejorado** | `backend/src/index.ts` | Agregado manejo específico para JWT, Multer y Database errors |

---

## 2026-07-27 — Optimización N+1 query en dashboard

### Performance

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **N+1 query en getSummary** | `backend/src/modules/dashboard/dashboard.controller.ts` | Optimizado loop de 7 queries a 1 query con GROUP BY |

---

## 2026-07-27 — Infraestructura, JSDoc y log levels

### Infraestructura

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Volumen para uploads** | `docker-compose.yml` | Agregado volumen persistente `uploads` para el backend |
| **NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL** | `docker-compose.yml` | Variable pasada al contenedor web |
| **Healthchecks web/mobile** | `docker-compose.yml`, `web/Dockerfile`, `mobile/Dockerfile.web` | Healthchecks con wget cada 30s |
| **Log levels configurables** | `backend/src/lib/logger.ts`, `.env.example` | Variable LOG_LEVEL (debug/info/warn/error), default info en producción |

### Documentación

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **JSDoc en auth** | `backend/src/modules/auth/auth.controller.ts` | Comentarios en register, login, me, refresh, logout |
| **shared/README.md** | `shared/README.md` | Actualizado con los 18 tipos exportados |

---

## 2026-07-27 — Fix seguridad: proteger /uploads

### Seguridad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Proteger `/uploads` con auth** | `backend/src/index.ts` | Agregado middleware que verifica cookies `admin_token`/`user_token` o header `Authorization`. Retorna 401 si no hay autenticación. |

---

## 2026-07-27 — Mobile PWA: 5 mejoras de calidad

### Mobile PWA

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Logger unificado** | `mobile/src/screens/ChatScreen.tsx` | Reemplazados console.log/console.error con logger para mejor tracking |
| **Sanitización input chat** | `mobile/src/components/ChatInput.tsx` | Agregada función sanitizeInput() para prevenir XSS + límite 500 chars |
| **Constantes de color** | `mobile/src/constants/colors.ts` (nuevo) | Archivo centralizado con colores unificados. en_proceso ahora es #F59E0B |
| **Estilos consistentes** | `mobile/app/historial.tsx`, `ChatInput.tsx` | Usan constantes COLORS en vez de valores hardcodeados |
| **Colores unificados** | `mobile/app/incidente/[id].tsx` | Usa constantes compartidas, elimina duplicados |

---

## 2026-07-27 — 5 mejoras de seguridad backend

### Seguridad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **`/api/metrics` protegido con auth** | `backend/src/index.ts` | Endpoint ahora requiere `authMiddleware` + `adminOnly`. Ya no es público. |
| **Push token verifica owner** | `backend/src/modules/push/push.controller.ts` | Si el token ya existe y pertenece a otro usuario, retorna 409 Conflict en vez de reasignarlo. |
| **`updateUser` verifica documento duplicado** | `backend/src/modules/users/users.controller.ts` | Retorna 409 Conflict si el documento ya existe en otro usuario (antes causaba error 500). |
| **Password mínimo 6 chars en login** | `backend/src/modules/auth/auth.schema.ts` | Login ahora exige mínimo 6 caracteres (igual que register). Antes aceptaba 4. |
| **`ultima_actividad` throttle cada 5 min** | `backend/src/middlewares/auth.ts` | Solo actualiza `ultima_actividad` si han pasado más de 5 minutos. Reduce writes innecesarios a la BD. |

---

## 2026-07-24 — Fix sesiones concurrentes, PWA completa, seguridad cookies

### Seguridad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Sesiones aisladas dashboard/mobile** | `backend/src/lib/jwt.ts`, `backend/src/modules/auth/auth.controller.ts` | Cookies con scope aislado (`admin_token`, `user_token`) + header `X-Auth-Scope` para evitar conflictos de sesión. |
| **Cookies path `/`** | `backend/src/lib/jwt.ts` | Cambiado path de cookies a `/` (antes era `/dashboard` o `/user`) para que el navegador las envíe a `/api/*`. |
| **Prioridad cookies invertida** | `backend/src/lib/jwt.ts` | `extractToken()` ahora prioriza `admin_token` > `user_token` > `token` (antes era al revés). |
| **CORS restringido en nginx mobile** | `mobile/nginx.conf` | Cambiado de `Access-Control-Allow-Origin *` a solo `http://localhost:3000`. |
| **Mobile envía scope en login** | `mobile/src/contexts/AuthContext.tsx` | Login mobile ahora envía `scope: "user"` para crear cookies `user_token` en vez de genéricas. |
| **Web envía X-Auth-Scope** | `web/src/lib/api.ts`, `web/src/contexts/AuthContext.tsx` | Dashboard envía header `X-Auth-Scope` en cada request para aislamiento total. |

### PWA Mobile

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **manifest.json** | `mobile/public/manifest.json` | Configuración PWA: nombre, iconos 192/512, colores, display standalone. |
| **Service Worker** | `mobile/public/sw.js` | Caché offline de assets estáticos. Requests a `/api/` no se cachean. |
| **Meta tags iOS/Android** | `mobile/public/index.html` | apple-mobile-web-app-capable, theme-color, apple-touch-icon. |
| **Iconos PWA en Docker** | `mobile/Dockerfile.web` | Copia `icon.png` e `icon-512.png` al build final de nginx. |
| **Mobile activo en compose** | `docker-compose.yml` | Contenedor `hub-mobile` ahora corre por defecto en puerto 8081. |

### Fixes

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **clearAllTokenCookies** | `backend/src/lib/jwt.ts` | Nueva función que limpia TODAS las cookies de todos los scopes (admin, user, genéricas). |
| **detectRefreshScope** | `backend/src/lib/jwt.ts` | Detecta el scope de la cookie refresh para generar nuevas cookies en el mismo scope. |
| **Refresh scope-aware** | `backend/src/modules/auth/auth.controller.ts` | `refresh()` ahora detecta el scope y genera cookies en el mismo path/nombre. |
| **Export Excel con filtros de fecha** | `web/src/components/AnalyticsFilters.tsx` | Los filtros "Hoy", "Esta Semana", "Este Mes", "Últimos 30 Días" ahora aplican correctamente al exportar. Antes solo funcionaba "Rango" personalizado. |

---

## 2026-07-21 — Limpieza, seguridad y configuración PWA

### Seguridad

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Endpoint fix-admin eliminado** | `backend/src/index.ts` | Endpoint público sin auth que permitía elevar usuarios a admin. Eliminado. |
| **Seed PV protegido** | `puntos-venta.routes.ts` | `POST /puntos-venta/seed` movido detrás de auth + adminOnly. Ya no es público. |
| **Tokens migrados a httpOnly cookies** | `web/src/lib/api.ts`, `web/src/contexts/AuthContext.tsx` | Eliminado localStorage para JWT. Auth ahora 100% via cookies httpOnly. |
| **Middleware Next.js activo** | `web/src/middleware.ts` | Protección server-side: redirige a /login si no hay cookie, a /dashboard si ya hay sesión. |
| **Push con auth** | `incidents.controller.ts` | Llamadas a exp.host incluyen header Accept y soporte para EXPO_ACCESS_TOKEN. |
| **Upload con límite** | `upload.controller.ts` | Límite de 500MB de almacenamiento total. Rechaza uploads si se excede. |
| **Cache sensible excluido** | `mobile/src/services/api.ts` | Endpoints /auth/ y /users ya no se cachean en dispositivo. |
| **Cloudflared removido de git** | `.gitignore` | Binario de 38MB eliminado del tracking de git. |
| **Secrets en .gitignore** | `.gitignore` | Agregados: cloudflared, mobile/android/, ota-server/data/, backend/uploads/ |

### Código Limpio

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **process.env centralizado** | `config/env.ts`, `auth.controller.ts`, `incidents.controller.ts`, `csrf.ts` | MAX_LOGIN_ATTEMPTS, EXPO_ACCESS_TOKEN ahora pasan por env config. |
| **COOKIE_OPTIONS eliminado** | `csrf.ts` | Variable sin usar removida. |
| **console.log → logger** | `EditUserModal.tsx`, `notifications.ts` | 3 instancias de console reemplazadas por logger centralizado. |
| **IncidentDetail eliminado** | `TicketDetailModal.tsx` | Interfaz vacía removida, usa Incident directamente. |
| **Import Alert eliminado** | `mobile/app/incidente/[id].tsx` | Import sin usar removido. |
| **Migraciones unificadas** | `docker-entrypoint.sh` | Unificada estrategia: usa Drizzle migrator en vez de psql directo. |
| **Settings tabs limpiados** | `settings/page.tsx` | Eliminados tabs vacíos "Seguridad" y "Notificaciones". |
| **External systems actualizado** | `external-systems/page.tsx` | Reducido a 6 módulos, "Sin configurar" → "Próximamente". |
| **Error boundary arreglado** | `web/src/app/error.tsx` | Clases CSS inexistentes reemplazadas por Tailwind válidas. |

### Infraestructura

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Vercel eliminado** | `render.yaml`, `.env`, `.env.local` | Deploy de dashboard en Vercel eliminado y CORS limpiado. |
| **Netlify eliminado** | `render.yaml`, `.env`, `.env.local` | Deploy legacy en Netlify eliminado y CORS limpiado. |
| **PWA bind mount** | `docker-compose.yml` | Volumen ota-data cambiado a bind mount ./ota-server/data/ para persistencia. |
| **PWA API URL relativa** | `mobile/.env` | EXPO_PUBLIC_API_URL=/api — funciona en cualquier dominio sin cambios. |
| **app.json limpio** | `mobile/app.json` | Eliminado relativeBaseUrl de Vercel legacy. |
| **PWA build generado** | `ota-server/data/` | Build web de Expo generado y copiado al directorio persistente. |
| **docker-compose backend eliminado** | `backend/docker-compose.yml` | Archivo duplicado obsoleto removido. |

### Archivos Eliminados

| Archivo | Razón |
|---------|-------|
| `pwa/` (5.7MB) | Build antiguo con URL Cloudflare muerta hardcodeada. |
| `SESION-2026-07-16.md` | Tokens de Render y GitHub expuestos. |
| `deploy-pwa.sh` | Script dependiente de URLs Cloudflare temporales. |
| `backend/docker-compose.yml` | Duplicado obsoleto. |

### Documentación

| Cambio | Detalle |
|--------|---------|
| **README.md reescrito** | De 1008 a ~260 líneas. Eliminado contenido obsoleto, URLs muertas, secciones duplicadas. |
| **CHANGELOG actualizado** | Referencias a Vercel/Netlify eliminadas. |

### Esquemas Corregidos

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Telefono vacío** | `incidents.schema.ts` | Agregado `.or(z.literal(""))` para aceptar string vacío como default. |
| **Email vacío** | `users.schema.ts` | Agregado `.or(z.literal(""))` para aceptar string vacío en update. |

---

## 2026-07-16 — Migraciones corregidas

> Se crearon las migraciones que faltaban para los índices de base de datos.

### Base de Datos

| Cambio | Archivo | Detalle |
|--------|---------|---------|
| **users_estado_idx** | `drizzle/0011_charming_meteor.sql` | `CREATE INDEX users_estado_idx` |
| **incidents_agente_idx** | `drizzle/0012_fuzzy_nova.sql` | `CREATE INDEX incidents_agente_idx` |
| **incidents_cerrado_por_idx** | `drizzle/0013_tiny_blade.sql` | `CREATE INDEX incidents_cerrado_por_idx` |
| **ratings_puntuacion_check** | `drizzle/0014_silent_horizon.sql` | `CHECK (puntuacion >= 1 AND puntuacion <= 5)` |

### Schema

| Cambio | Archivo | Detalle |
|--------|---------|---------|
| **users.estado index** | `schema.ts` | Agregado índice `users_estado_idx` |
| **incidents.agente index** | `schema.ts` | Agregado índice `incidents_agente_idx` |
| **incidents.cerrado_por index** | `schema.ts` | Agregado índice `incidents_cerrado_por_idx` |

---

## 2026-07-15 — Limpieza y mejoras

### Docker

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **SHA en imágenes** | `backend/Dockerfile`, `web/Dockerfile`, `ota-server/Dockerfile` | `node:22-alpine` y `nginx:alpine` con `@sha256` |
| **USER directive** | `backend/Dockerfile`, `web/Dockerfile` | Contenedores corren como usuario `nodejs` |
| **Scripts separados** | `backend/docker-entrypoint.sh`, `backend/scripts/migrate-and-seed.sh` | Migrate/seed ya no se ejecutan en startup |

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Teléfono numérico** | `incidents.schema.ts` | Regex `/^\d{6,20}$/` para validar teléfono |
| **Agente no vacío** | `incidents.schema.ts` | `.min(1, "El agente no puede estar vacío")` |
| **Email no vacío** | `users.schema.ts` | Eliminado `.or(z.literal(""))` |
| **Límite search PV** | `puntos-venta.controller.ts` | `.limit(100)` para evitar resultados excesivos |

### Base de Datos

| Cambio | Archivo | Detalle |
|--------|---------|---------|
| **Índice incidents.user_estado** | `schema.ts`, `drizzle/0010_far_next_avengers.sql` | `CREATE INDEX incidents_user_estado_idx` |

---

## 2026-07-10 — Auditoría exhaustiva: 11 fixes de seguridad

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Límite archivo multer** | `upload.routes.ts` | Agregado `limits: { fileSize: 5 * 1024 * 1024 }` |
| **Validación token push** | `push.schema.ts` | Regex para formato de token Expo Push |
| **Rate limit push tokens** | `push.routes.ts` | Nuevo `pushLimiter` de 10 req/min |
| **Validación shortId chat** | `chat.controller.ts` | Validación adicional con regex `^[A-F0-9]{4,8}$` |
| **Rate limit login 3/min** | `auth.routes.ts` | Reducido de 5 a 3 req/min |
| **Validación documento** | `auth.schema.ts` | Regex `/^\d+$/` para solo números |
| **Fix mensaje rating** | `ratings.controller.ts` | Verifica user_id antes de error duplicado |
| **Límite chat history** | `chat.controller.ts` | `Math.min(Math.max(1, limit), 200)` |
| **Logging seed corregido** | `db/seed.ts` | Mensaje sin exponer password |

### Mobile

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Sin fallback API URL** | `services/api.ts` | Lanza error si `EXPO_PUBLIC_API_URL` no está definida |

### Web

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Logger centralizado** | `Topbar.tsx` | `console.error` → `logger.error()` |

---

## 2026-07-10 — Auditoría seguridad: fixes críticos y altos (primera sesión)

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Auth middleware async/await** | `middlewares/auth.ts` | Refactorizado de `.then()` a async/await para mejor manejo de errores y mantenibilidad. |
| **Logout con await** | `auth.controller.ts` | La actualización de `token_version` ahora espera confirmación de la BD antes de retornar. |
| **Seed no resetea password** | `db/seed.ts` | El seed ya no actualiza la contraseña de usuarios existentes. Solo crea admin si no existe. |
| **Rate limit login más estricto** | `auth.routes.ts` | Cambiado de 10 req/15min a 5 req/1min para mejor protección contra fuerza bruta. |
| **Fix enumeración usuarios** | `auth.controller.ts` | `/auth/me` ahora retorna 401 en vez de 404 cuando el usuario no existe, evitando enumeración. |
| **Índice compuesto incidents** | `db/schema.ts`, `drizzle/0010_*` | Nuevo índice `incidents_user_estado_idx` para optimizar queries por usuario y estado. |

---

## 2026-07-03 — Fix múltiples valoraciones, endpoint optimizado ratings

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Endpoint `/ratings/my-ratings`** | `ratings.controller.ts`, `ratings.routes.ts` | Nuevo endpoint que devuelve todos los IDs de incidentes calificados por el usuario autenticado en una sola petición. Evita rate limit al consultar ratings individuales. |

### Mobile App (Android)

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Fix múltiples valoraciones** | `ChatScreen.tsx` | Cambiado estado `alreadyRated` (boolean) a `ratedIncidents` (Set<string>) para tracking por incidente específico. |
| **Match por shortId** | `ChatScreen.tsx` | Extrae `#TK-XXXXXXXX` del mensaje de resolución y lo compara con incidentes calificados para mostrar "Ya calificado" correctamente. |
| **FlatList re-renderizado** | `ChatScreen.tsx` | Agregado `extraData={ratedIncidents}` para forzar re-render cuando cambia el estado de calificación. |
| **Optimización de peticiones** | `ChatScreen.tsx` | Reemplazado loop de `GET /ratings/:id` por `GET /ratings/my-ratings` (1 sola petición). |

---

## 2026-07-01 — Chat inteligente, bloqueo con mensaje original, scroll chat, modo oscuro, optimización analytics

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Detección de intención en chat** | `chat.controller.ts` | Keywords y `PROBLEM_OPTIONS` (7 categorías) detectan la intención del usuario. Respuesta incluye `suggestedActions` con `{ label, action }`. |
| **Respuestas formales sin emojis** | `chat.controller.ts`, `incidents.controller.ts` | Mensajes sin emojis ni negritas, tono formal. `**Resuelto**` se muestra en bold en mobile. |
| **Dockerfile: npm ci → npm install** | `Dockerfile` | Cambio a `npm install` para evitar errores de lockfile mismatch. |

### Web Dashboard

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Modo oscuro completo** | `globals.css` | Clases `.dark` sobreescriben todos los textos `text-gray-*` a `#f3f4f6`. Variables CSS `--brand` adaptadas al tema oscuro. |
| **Scroll horizontal en chart** | `AnalyticsCharts.tsx` | TrafficChart con ancho dinámico (`80px × items`), scroll horizontal en fechas. |
| **Loading skeleton en charts** | `analytics/page.tsx` | `ChartSkeleton` (pulse animation) mientras cargan los datos, evita layout shift. |
| **Memoización de handlers** | `analytics/page.tsx` | `fetchData`, `handleFilterChange`, `handleAgentChange` envueltos en `useCallback`. `Promise.allSettled` para llamadas en paralelo. |
| **React.memo en gráficos** | `AnalyticsCharts.tsx`, `AnalyticsFilters.tsx` | `memo()` en `TrafficChart`, `DonutChart`, `StatusBarChart` y `AnalyticsFilters` para evitar re-renders innecesarios. |
| **Barras apiladas en StatusBarChart** | `AnalyticsCharts.tsx` | `stackId="a"` + `maxBarSize={120}` para columna única con 3 colores en vez de 3 barritas delgadas. |
| **Fix stale closure en statusData** | `analytics/page.tsx` | `name: agente || "General"` usa el parámetro en vez de `selectedAgente` del closure. |

### Mobile App (Android)

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Suggested actions en chat** | `BotMessageCard.tsx`, `ChatScreen.tsx` | Chips tappables con acciones sugeridas. `handleSuggestedAction` envía label como display text. |
| **Texto bold parseado** | `BotMessageCard.tsx` | `**texto**` se renderiza en negrita con `Inter_700Bold`, se eliminan los asteriscos. |
| **Mensaje original de bloqueo** | `api.ts`, `AuthContext.tsx`, `LoginScreen.tsx` | `originalMsg` preserva el mensaje del backend. LoginScreen lo muestra en rojo. `onBlocked` solo se dispara si había token activo. |
| **Botón scroll to bottom** | `ChatScreen.tsx` | Botón flotante `ChevronDown` aparece al scrollear arriba (>150px). |

---

## 2026-06-17 — Bloqueo usuarios, notificaciones, push, columna bloqueado por, ayuda rápida, calificaciones

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Middleware bloqueo usuarios** | `middlewares/auth.ts` | Al verificar token, consulta si `estado = "bloqueado"` y rechaza con 403. |
| **Columna visto_por_admin** | `db/schema.ts`, `migration 0008` | Nuevo campo boolean en incidents para tracking de notificaciones vistas. |
| **Endpoints notificaciones** | `incidents.controller.ts`, `incidents.routes.ts` | `GET /incidents/unread-count` (count de no vistos), `PATCH /incidents/mark-seen` (marcar como vistos). |
| **Tabla push_tokens** | `db/schema.ts`, `migration 0009` | Nueva tabla para tokens de notificaciones push por usuario. |
| **Módulo push** | `modules/push/` (controller, routes, schema) | `POST /api/push/register` — guarda token del usuario autenticado. |
| **Push al resolver ticket** | `incidents.controller.ts` | Al marcar ticket como resuelto, busca token del usuario y envía push via Expo API. |
| **Columna bloqueado_por** | `db/schema.ts`, `migration 0010` | Nuevo campo en users que guarda el ID del admin que bloqueó. |
| **Endpoint listUsers** | `users.controller.ts` | Incluye `bloqueado_por_documento` con join a la tabla users. |
| **Toggle status** | `users.controller.ts` | Al bloquear guarda `bloqueado_por` con el ID del admin actual. |

### Web Dashboard

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Manejo 403 bloqueado** | `lib/api.ts` | Redirige a `/login` si el usuario está bloqueado. |
| **Campana notificaciones** | `components/Topbar.tsx` | Polling cada 30s a `/incidents/unread-count`. Badge rojo con número. Click navega a tickets y resetea contador. |
| **Auto-mark-seen** | `app/dashboard/tickets/page.tsx` | Al cargar página de tickets, llama a `mark-seen` para limpiar notificaciones. |
| **Modal ayuda rápida** | `components/HelpModal.tsx` (nuevo) | Reemplaza icono ? estático. Muestra versión, WhatsApp, preguntas frecuentes con acordeón. |
| **Columna bloqueado por** | `components/UsersTable.tsx`, `types/user.ts` | Nueva columna en tabla de usuarios que muestra qué admin bloqueó al usuario. |
| **Comentarios calificaciones** | `app/dashboard/ratings/page.tsx` | Se quita truncate — los comentarios largos ahora se muestran completos con `break-words`. |

### Mobile App (Android)

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Manejo 403 bloqueado** | `services/api.ts`, `contexts/AuthContext.tsx` | Detecta "bloqueado", limpia token y redirige al login. |
| **Notificaciones push** | `services/notifications.ts` | Servicio que pide permiso, obtiene Expo Push Token y lo registra en backend. |
| **Registro push en login** | `contexts/AuthContext.tsx` | Al iniciar sesión o restaurar sesión, registra token automáticamente. |
| **expo-notifications** | `package.json` | Dependencia instalada para notificaciones push nativas. |

### Deploys

| Servicio | Plataforma | Cambios |
|----------|------------|---------|
| Backend | Render | Bloqueo usuarios, notificaciones, push, bloqueado_por |
| Mobile | Expo (EAS) | Build APK pendiente por límite plan gratuito (reinicia 1 julio) |

---

## 2026-06-16 — Notificaciones, menú chat, calificaciones, FAQ, campos bloqueados, limpieza BD

### Backend

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Registro de cierre de tickets** | `schema.ts`, `incidents.controller.ts`, `migration 0006` | Columnas `cerrado_por` (FK users) y `fecha_cierre` en incidents. Al resolver ticket guarda quién y cuándo. |
| **Sistema de calificaciones** | `schema.ts`, `ratings/` (controller, routes, schema), `migration 0007` | Nueva tabla `ratings` (puntuación 1-5, comentario). Endpoints POST/GET para calificar y GET /ratings para stats admin. |
| **Endpoint limpieza BD** | `index.ts` (temporal) | Limpieza completa de BD producción excepto admin. |

### Web Dashboard

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Detalle de cierre en tickets** | `TicketDetailModal.tsx` | Modal muestra "Cerrado por", "Fecha de cierre" y "Solución" en tickets resueltos. |
| **Scroll en modal** | `TicketDetailModal.tsx` | Modal con scroll vertical cuando el contenido excede la pantalla. |
| **Página Calificaciones** | `ratings/page.tsx`, `Sidebar.tsx` | Nueva página en sidebar. Tarjetas con promedio, gráfico de barras por estrella, promedio por punto de venta, tabla detallada con usuario, punto de venta, ticket, puntuación y comentario. |
| **Exportación Excel** | `tickets/page.tsx` | Columnas "Cerrado por" y "Fecha cierre" en exportación. |

### Mobile App (Android)

| Cambio | Archivos | Detalle |
|--------|----------|---------|
| **Eliminado "Recargar App"** | `ajustes.tsx` | Opción redundante removida de ajustes. |
| **Selector de estrellas** | `StarRating.tsx`, `ChatScreen.tsx` | Al tocar "Puntuar servicio" en chat de ticket resuelto, se abre modal con 5 estrellas + comentario. Envía calificación al backend. |
| **Campos solo lectura** | `TextField.tsx`, `ReportScreen.tsx` | Nombre, documento y teléfono bloqueados con candado y fondo gris. Teléfono editable solo en primer reporte, luego se bloquea automáticamente. |
| **Menú de chat actualizado** | `ExpandableMenu.tsx`, `ChatScreen.tsx` | "Estado de solicitud" → "Estado de reporte" (redirige a historial). Eliminados "Estado de ticket" (submenú) y "Hablar con agente". |
| **Modal FAQ** | `FaqModal.tsx`, `ChatScreen.tsx` | "Preguntas frecuentes" abre modal con acordeón de 4 preguntas/respuestas precargadas. |
| **Actualización OTA** | Múltiples OTA updates | Publicados cambios a canales preview y production. Nuevo APK compilado en EAS. |

### Despliegues

| Servicio | Plataforma | Estado |
|----------|------------|--------|
| Backend | Render | Auto-deploy desde main |
| Mobile | Expo (OTA + APK) | OTA en preview y production. Build EAS completado. |

---

## 2026-06-12 — Bloqueo por intentos, reset password, mejoras dashboard, modal cierre tickets, APK

### Backend

| Cambio | Archivos | Detalle |
|---|---|---|
| **Bloqueo automático tras intentos fallidos** | `auth.controller.ts`, `db/schema.ts` | Nueva columna `intentos_fallidos` en users. En login, tras 5 intentos fallidos (configurable vía `MAX_LOGIN_ATTEMPTS`), se setea `estado = "bloqueado"`. Al login exitoso se resetea a 0. |
| **Migración Drizzle** | `drizzle/0004_broken_hydra.sql` | `ALTER TABLE users ADD COLUMN intentos_fallidos integer DEFAULT 0 NOT NULL` |
| **Fallback ALTER TABLE en migrate** | `db/migrate.ts` | Se agregó `ADD COLUMN IF NOT EXISTS intentos_fallidos` por si la migración Drizzle no se ejecuta |
| **Endpoint reset password** | `users.controller.ts`, `users.routes.ts`, `users.schema.ts` | `PATCH /api/users/:id/reset-password` (admin). Hashea nueva contraseña, resetea `intentos_fallidos = 0` y `estado = "activo"` |
| **Seed mejorado** | `db/seed.ts` | Al usar `SEED_ADMIN_PASSWORD`, también resetea `estado` e `intentos_fallidos` del admin |
| **Endpoint export incidents** | `incidents.controller.ts`, `incidents.routes.ts` | `GET /api/incidents/export?start=&end=` (admin). Retorna todos los incidentes del rango con sus comentarios embebidos en una sola consulta optimizada con `inArray` |
| **Eliminado timeout del CMD Docker** | `Dockerfile` | Se quitó `timeout 40` del CMD para evitar que la migración se mate antes de completar |
| **Endpoint upload imágenes** | `upload.controller.ts`, `upload.routes.ts`, `package.json` | `POST /api/upload` (admin). Sube imágenes (png/jpg/gif/webp, máx 5MB) y devuelve URL pública |
| **Columnas solución e imagen en incidentes** | `db/schema.ts`, `drizzle/0005_useful_nightcrawler.sql` | Nuevas columnas `solucion` (text) e `imagen_url` (varchar 500) en tabla `incidents` |
| **Chat notification con solución** | `incidents.controller.ts` | Al resolver ticket, el mensaje del bot incluye la solución si se proporcionó |
| **Aceptar solucion/imagen_url en PATCH** | `incidents.controller.ts`, `incidents.schema.ts` | El endpoint `PATCH /incidents/:id` ahora acepta `solucion` e `imagen_url` |

### Web Dashboard

| Cambio | Archivos | Detalle |
|---|---|---|
| **Botón Reset Password en tabla usuarios** | `UsersTable.tsx`, `users/page.tsx` | Nuevo botón "Reset" (naranja) en acciones de cada usuario |
| **Modal ResetPasswordModal** | `ResetPasswordModal.tsx` | Modal con campo de nueva contraseña + confirmación. Al guardar, desbloquea al usuario |
| **Menú de 3 puntitos** | `UsersTable.tsx` | Reemplazados los 3 botones (Editar, Reset, Bloquear) por un menú desplegable con icono `⋮` |
| **Ordenar usuarios por última actividad** | `UserManagement.tsx` | Los 5 usuarios mostrados en el dashboard principal se ordenan por `ultima_actividad` descendente |
| **Eliminada barra de búsqueda del Topbar** | `Topbar.tsx` | Eliminado completamente el input de búsqueda superior |
| **Exportación Excel mejorada** | `AnalyticsFilters.tsx` | Nuevo endpoint `/incidents/export`. Excel con 2 hojas: Dashboard y Detalle con solución+imagen |
| **Eliminado filtro de prioridad en tickets** | `TicketFilters.tsx`, `tickets/page.tsx` | Eliminado el `<select>` de "Prioridad: Todas" |
| **Modal cierre de ticket con solución + imagen** | `ResolveTicketModal.tsx`, `TicketTable.tsx`, `tickets/page.tsx` | Al seleccionar "Resuelto" se abre modal con textarea de solución + input file opcional. Sube imagen al backend y guarda solución |
| **Bloquear cambio de estado en resuelto** | `TicketTable.tsx` | Cuando el ticket está "Resuelto" se oculta la sección "Cambiar estado" del menú |
| **Rango personalizado corregido** | `analytics/page.tsx` | Fix de estados y resets al cambiar entre "30d" y "Rango Personalizado" |
| **Dropdown 3 puntitos visible** | `UsersTable.tsx` | Cambio de `overflow-hidden` a `overflow-visible` para que el menú no se recorte |
| **Export incluye solución e imagen** | `AnalyticsFilters.tsx` | Columnas "Solución" e "Imagen" en hoja Detalle del Excel + KPI "Resueltos con solución" |

### Mobile App

| Cambio | Archivos | Detalle |
|---|---|---|
| **Autocompletar formulario de reporte** | `ReportScreen.tsx` | nombre/doc desde sesión, teléfono desde último incidente |
| **Eliminado selector de urgencia** | `ReportScreen.tsx`, ~~`UrgencySelector.tsx`~~ | Eliminado componente y lógica |
| **Botón Puntuar servicio + Hacer otra petición** | `BotMessageCard.tsx`, `ChatScreen.tsx` | Al recibir notificación de ticket resuelto, muestra botones de acción |
| **Hacer otra petición despliega menú** | `BotMessageCard.tsx` | En lugar de navegar, muestra el menú principal de opciones |
| **Build APK #1** | — | https://expo.dev/accounts/laz65585/projects/hub-ai-assistant/builds/154a6bb8-5bc5-45b1-8580-01357ca21396 |
| **Build APK #2** | — | https://expo.dev/accounts/laz65585/projects/hub-ai-assistant/builds/17e16ef1-a4f3-4ff1-af24-c374897d747d |
| **Build APK #3** | — | https://expo.dev/accounts/laz65585/projects/hub-ai-assistant/builds/4c260990-eb8e-4bce-a9f4-d2ca5b8c5053 |

### Deploy

| App | Plataforma | URL |
|---|---|---|
| Backend | Render | `https://hub-platform-api.onrender.com` |
| Mobile | Expo (APK) | Build más reciente: https://expo.dev/accounts/laz65585/projects/hub-ai-assistant/builds/4c260990-eb8e-4bce-a9f4-d2ca5b8c5053 |

---

## Histórico anterior

Ver [README.md](./README.md) para cambios anteriores al 2026-06-12.
