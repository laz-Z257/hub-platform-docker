# PENDIENTES - HUB Platform

**Última actualización:** 2026-07-24 (verificado contra código fuente)

---

## ⚠️ IMPORTANTE: Desarrollo Local vs Producción

### ✅ Para Desarrollo Local (Docker)
- **Todo funciona**: Puedes correr `mobile`, `web` y `backend` en Docker normalmente
- **Mobile como PWA en web**: Funciona para probar UI, navegación, API calls
- **Limitaciones aceptables**: 
  - ❌ Push notifications (no se prueban en local)
  - ❌ SecureStore usa localStorage (aceptable para desarrollo)
  - ❌ OTA updates no aplican en web

### 🚀 Para Producción (cuando se implemente PWA)
- ✅ PWA implementada: Service Worker, manifest.json, meta tags
- **NOTA**: Este proyecto NO requiere:
  - ❌ Notificaciones push (no es necesario)
  - ❌ Acceso a cámara/hardware
  - ❌ OTA updates (se puede hacer redeploy normal)

---

## 📋 PENDIENTES POR PRIORIDAD

### 🔴 CRÍTICOS (7) - Arreglar esta semana

1. ~~**Sesión dashboard se pierde al recargar**~~ - ✅ **RESUELTO 2026-07-24**: Cookies con path `/` y scope aislado
2. **Proteger `/api/metrics`** con autenticación
3. **Proteger `/uploads`** con auth o CDN con URLs firmadas  
4. ~~**Quitar CORS `*`** en nginx mobile~~ - ✅ **RESUELTO 2026-07-24**: CORS restringido a `http://localhost:3000`
5. **Validar rating puntuación** (1-5)
6. **Push token reasignable** - verificar owner antes de reasignar
7. **Password mínimo 6 chars** en login schema
8. **Fix `updateUser`** - verificar documento duplicado
9. ~~**Export Excel ignora filtros de fecha**~~ - ✅ **RESUELTO 2026-07-24**: Los presets ahora calculan el rango correcto

### 🟠 ALTOS (12) - Arreglar pronto

8. **Throttlear `ultima_actividad`** - no actualizar en cada request
9. **Fix N+1 query** en `getSummary` dashboard
10. **Agregar volume** para uploads del backend
11. **Dark mode** en área de usuario (6 pantallas sin soporte)
12. **Extraer archivos grandes** (>400 líneas) en componentes
13. **Consolidar funciones helper** duplicadas
14. **Agregar tests** de controllers (backend)
15. **Sync constantes de color** mobile (divergencia en `en_proceso`)
16. **Pasar `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL`** al contenedor web
17. **Fix middleware web** - validar JWT, no solo existencia de cookie
18. **Agregar responsive** al dashboard admin
19. **React Error Boundaries** en mobile

### 🟡 MEDIOS (27) - Cuando haya tiempo

20. **Reemplazar `alert()`/`confirm()`** nativos con modales custom
21. ~~**PWA Mobile**~~ - ✅ **RESUELTO 2026-07-24**: manifest.json, service worker, meta tags implementados
22. ~~**JWT en localStorage** mobile~~ - ✅ **RESUELTO 2026-07-24**: Ahora usa cookies con scope aislado (`admin_token`, `user_token`)
23. **Sync constantes de color** mobile (divergencia en `en_proceso`)
24. **Pasar `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL`** al contenedor web
25. **Agregar tests** de componentes (web)
26. **Agregar tests** unitarios mobile
27. **Integrar Sentry/Crashlytics** mobile
28. **Documentación API** (Swagger/OpenAPI)
29. **SHA pinning** en todos los Dockerfiles
30. **Crear healthcheck** para ota-server
31. **Agregar CONTRIBUTING.md** y SECURITY.md
32. **Soft deletes** para datos importantes
33. **Connection pooling** configurado en PostgreSQL
34. **Validación Zod** más estricta en todos los schemas
35. **Error boundary** en Express (distinguir tipos de errores)
36. **Límite en chat history** (evitar queries muy grandes)
37. **Paginación cursor-based** en chat history
38. **Endpoint público** `/api/ratings/stats` con estadísticas
39. **Renombrar endpoint** `/export` a `/export-data`
40. **Estandarizar naming** conventions (camelCase vs snake_case)
41. **Comentarios JSDoc** en funciones críticas
42. **Log levels** configurables en producción
43. **Separar health checks** (simple vs DB)
44. **Índice compuesto** `incidents(user_id, estado)`
45. **Constraint CHECK** en puntuacion ratings
46. **Campos opcionales** - estandarizar null vs string vacío

### 🟢 BAJOS (22) - Cuando sobre tiempo

47. **Tests unitarios** mobile
48. **Sentry/Crashlytics** mobile
49. **CONTRIBUTING.md** y SECURITY.md
50. **Documentación API** (Swagger/OpenAPI)
51. **SHA pinning** en Dockerfiles
52. **Healthcheck** para ota-server
53. **Soft deletes** para datos importantes
54. **Connection pooling** configurado
55. **Validación Zod** más estricta
56. **Error boundary** en Express
57. **Límite chat history**
58. **Paginación** chat history
59. **Endpoint ratings/stats** público
60. **Renombrar** `/export`
61. **Naming conventions**
62. **Comentarios JSDoc**
63. **Log levels** configurables
64. **Separar health checks**
65. **Índice compuesto** incidents
66. **Constraint CHECK** ratings
67. **Campos opcionales** estandarizar
68. **Métricas Prometheus** en vez de JSON

---

## 📱 IMPLEMENTACIÓN PWA MOBILE

**Estado**: ✅ **COMPLETADO 2026-07-24** | **Prioridad**: Media (no urgente)

### ✅ Lo que YA funciona en Docker (desarrollo local)
- Todas las pantallas y navegación
- UI completa con NativeWind
- Llamadas al API
- Login, chat, reportar, historial
- ✅ PWA instalable (manifest.json + service worker)
- ✅ Meta tags iOS/Android
- ✅ CORS restringido (seguro)

### ❌ Lo que NO funciona en PWA (pero sí en APK nativo)
- ❌ Push notifications (usa `expo-notifications` que es nativo)
- ❌ SecureStore (fallback a localStorage en web)
- ❌ OTA updates de Expo

### ✅ Implementado (2026-07-24)

| Archivo | Descripción |
|---------|-------------|
| `mobile/public/manifest.json` | Configuración PWA (nombre, iconos, colores) |
| `mobile/public/sw.js` | Service Worker para caché offline |
| `mobile/public/index.html` | Template con meta tags iOS/Android |
| `mobile/nginx.conf` | CORS restringido a `http://localhost:3000` |
| `mobile/Dockerfile.web` | Copia iconos PWA al build final |

### 📝 Notas
- La PWA funciona en http://localhost:8081
- Se puede instalar como app en el celular/PC
- Service Worker cachea assets para funcionamiento offline
- Las requests a `/api/` NO se cachean (siempre van al backend)

---

## 📝 Pasos para implementar PWA en producción (REFERENCIA - Ya implementado)

#### 1. Service Worker y Caching
```bash
cd mobile
npm install workbox-window workbox-precaching
```

Crear `public/sw.js`:
```javascript
import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);
```

#### 2. Manifest.json
Crear `public/manifest.json`:
```json
{
  "name": "HUB AI Assistant",
  "short_name": "HUB",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 3. Reemplazar localStorage por cookies
Modificar `mobile/src/services/storage.ts`:
- Para web: usar cookies httpOnly (igual que dashboard)
- Para nativo: mantener SecureStore

#### 4. Configurar Expo para PWA
En `app.json`, agregar:
```json
"web": {
  "bundler": "metro",
  "favicon": "./assets/favicon.png"
}
```

#### 5. Build y deploy
```bash
cd mobile
npx expo export --platform web
# Copiar a ota-server/data/
```

### 🚫 Funcionalidades que NO se implementarán
- ❌ Notificaciones push (no requeridas para este proyecto)
- ❌ Acceso a cámara/hardware (no requerido)
- ❌ OTA updates (se hace redeploy normal)

---

## 📊 RESUMEN DE HALLAZGOS

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 CRÍTICOS | 7 | 4 resueltos, 3 pendientes |
| 🟠 ALTOS | 12 | Pendientes |
| 🟡 MEDIOS | 27 | 2 resueltos, 25 pendientes |
| 🟢 BAJOS | 22 | Pendientes |
| **TOTAL** | **68** | **6 resueltos, 62 pendientes** |

> **Nota**: 2 hallazgos fueron eliminados por no coincidir con el código:
> - ~~B-3~~: `.env.example` usa placeholders, no credenciales reales
> - ~~F-5~~: Cookie CSRF es `httpOnly`, no vulnerable a XSS

### ✅ Resueltos (2026-07-24)

| # | Problema | Solución |
|---|----------|----------|
| **I-1** | Sesión dashboard se pierde al recargar | Cookies con path `/` y scope aislado (`admin_token`, `user_token`) |
| **I-4** | CORS `*` en nginx mobile | Restringido a `http://localhost:3000` |
| **M-1** | JWT en localStorage mobile | Ahora usa cookies httpOnly con scope |
| **M-2** | PWA Mobile incompleta | manifest.json, service worker, meta tags implementados |
| **F-3** | Sin Service Worker | Service Worker con caché básico implementado |
| **F-9** | Export Excel ignora filtros de fecha | Los presets ahora calculan el rango correcto al exportar |

---

## 🔍 HALLAZGOS DETALLADOS

### 🔴 CRÍTICOS

| # | Problema | Archivo | Detalle |
|---|----------|---------|---------|
| ~~**I-1**~~ | ~~Sesión dashboard se pierde~~ | ~~`web/src/lib/api.ts`~~ | ✅ **RESUELTO**: Cookies con path `/` y header `X-Auth-Scope` |
| **I-2** | `.env` con secrets reales | `.env`, `.env.local` | Passwords JWT, Postgres en texto plano. NO están commiteados (en `.gitignore`), pero riesgo si se commite |
| **I-3** | `.env` y `.env.local` idénticos | raíz | No hay override local; ambos contienen los mismos secrets |
| **I-4** | Password `admin123` fallback | `docker-compose.yml:38` | `SEED_ADMIN_PASSWORD: ${SEED_ADMIN_PASSWORD:-admin123}` |
| **B-1** | `/api/metrics` sin auth | `backend/src/index.ts:113` | Expone métricas internas sin autenticación |
| **B-2** | `/uploads` sin auth | `backend/src/index.ts:123` | Archivos subidos son públicamente accesibles |
| ~~**M-1**~~ | ~~JWT en localStorage~~ | ~~`mobile/src/services/storage.ts:19-28`~~ | ✅ **RESUELTO**: Cookies httpOnly con scope aislado |
| ~~**M-2**~~ | ~~CORS `*` en nginx~~ | ~~`mobile/nginx.conf:13`~~ | ✅ **RESUELTO**: Restringido a `http://localhost:3000` |

### 🟠 ALTOS

| # | Problema | Archivo | Detalle |
|---|----------|---------|---------|
| **B-4** | JWT en body Y cookie | `auth.controller.ts:130` | Redundante, token en body puede guardarse en localStorage |
| **B-5** | Push token reasignable | `push.controller.ts:20-24` | Reasigna token sin verificar owner |
| **B-7** | `bloqueado_por` sin ON DELETE | `schema.ts:33` | FK sin cascada, referencias huérfanas |
| **B-8** | `updateUser` sin validar duplicado | `users.controller.ts:205` | Error 500 en vez de 409 si documento existe |
| **B-9** | Password mínimo 4 chars | `auth.schema.ts:9` | Login acepta 4, register exige 6 (inconsistente) |
| **B-10** | N+1 en `getSummary` | `dashboard.controller.ts:76` | 8+ queries secuenciales + 7 para last7Days |
| **B-11** | `ultima_actividad` en cada request | `middlewares/auth.ts:55` | Actualiza BD en cada petición |
| **F-4** | Middleware no valida JWT | `web/src/middleware.ts:5` | Solo verifica existencia de cookie, no validez |
| **F-6** | Dashboard sin responsive | `web/src/app/dashboard/*` | Sidebar fijo 250px, grids sin breakpoints |
| **M-5** | `Node.prototype.removeChild` monkey-patched | `SafeAreaProviderWrapper.tsx:6-16` | Workaround frágil en web |
| **M-6** | Sin CSRF en refresh mobile | `api.ts:66` | Refresh usa cookies pero no envía CSRF token |
| **M-7** | Sin Error Boundaries | mobile | Crash = pantalla blanca |

### 🟡 MEDIOS (selección)

| # | Problema | Archivo |
|---|----------|---------|
| **B-6** | Rate limit insuficiente admin | Múltiples endpoints |
| **B-12** | Seed duplicado | `seed.ts` y `puntos-venta.controller.ts` |
| **B-13** | Race condition settings | `settings.controller.ts:33` |
| **B-14** | Sin tests controllers | backend |
| **F-7** | `alert()`/`confirm()` nativos | web dashboard |
| **F-8** | Dark mode incompleto | 6 pantallas /user/* |
| **F-10** | Helpers duplicados | `formatDate`, `formatTicketId` |
| **F-12** | Archivos grandes | tickets (500), settings (489) |
| **I-9** | Dockerfiles sin SHA pinning | mobile/ |
| ~~**I-10**~~ | ~~CORS `*` en nginx~~ | ~~mobile/nginx.conf~~ | ✅ **RESUELTO**: Restringido a `http://localhost:3000` |
| **I-11** | Falta `JWT_REFRESH_SECRET` | render.yaml |
| **I-14** | Sin volumen uploads | docker-compose.yml |
| **M-8** | Error swallowing silencioso | 6 ubicaciones |
| **M-9** | Constantes color divergentes | historial vs incidente |
| **M-14** | Archivos inline 300-400+ líneas | exito, historial, ajustes |
| **M-15** | Sin tests unitarios | mobile |

---

## 📋 PLAN DE ACCIÓN SUGERIDO

### Semana 1: Seguridad Crítica
- [ ] Proteger `/api/metrics` con autenticación
- [ ] Proteger `/uploads` con auth
- [x] ~~Quitar CORS `*` en nginx mobile~~ ✅ RESUELTO 2026-07-24
- [ ] Validar rating puntuación (1-5)
- [ ] Fix push token reasignable
- [ ] Password mínimo 6 chars
- [ ] Fix `updateUser` documento duplicado

### Semana 2: Mejoras Backend
- [ ] Throttlear `ultima_actividad`
- [ ] Fix N+1 query en dashboard
- [ ] Agregar volumen para uploads
- [ ] Tests de controllers

### Semana 3: Frontend
- [ ] Dark mode en área usuario
- [ ] Extraer archivos grandes
- [ ] Consolidar helpers
- [ ] Responsive dashboard
- [ ] Error Boundaries mobile

### Semana 4+: PWA Mobile (cuando se necesite)
- [ ] Implementar service worker
- [ ] Crear manifest.json
- [ ] Reemplazar localStorage por cookies
- [ ] Build y deploy PWA

---

## 📚 DOCUMENTACIÓN DEL PROYECTO

| Archivo | Estado | Última Actualización |
|---------|--------|---------------------|
| `README.md` | ✅ Completo | 2026-07-21 |
| `CHANGELOG.md` | ✅ Detallado | 2026-07-21 |
| `AUDIT-COMPLETA.md` | ✅ Auditoría seguridad | 2026-07-07 |
| `PWA-DEPLOY.md` | ⚠️ Referencia servicio deshabilitado | 2026-07-14 |
| `DISTRIBUCION-APK.md` | ✅ Guía distribución | 2026-07-14 |
| `PENDIENTES.md` | ✅ Este archivo | 2026-07-23 |
| `shared/README.md` | ⚠️ Desactualizado | Desconocido |

---

*Última verificación: 2026-07-23*
*Total de hallazgos: 68 (7 críticos, 12 altos, 27 medios, 22 bajos)*

## 🐳 INFRAESTRUCTURA Y DOCKER

### Contenedores Activos

| Servicio | Puerto | Estado | Healthcheck |
|----------|--------|--------|:-----------:|
| hub-postgres | 5432 | ✅ Running | ✅ |
| hub-api | 3001 | ✅ Running | ✅ |
| hub-web | 3000 | ✅ Running | ❌ |
| hub-mobile | 8081 | ❌ No existe | ❌ |
| hub-ota-server | 3002 | ✅ Running | ❌ |

### CRÍTICOS

| # | Problema | Archivo | Detalle | Verificación |
|---|----------|---------|---------|:---:|
| I-1 | `.env` con secrets reales en disco | `.env`, `.env.local` | Passwords JWT, Postgres y admin en texto plano. Si se commiteó, las credenciales están comprometidas | ✅ |
| I-2 | `.env` y `.env.local` son idénticos | ambos archivos | No hay override local; ambos contienen los mismos secrets de producción | ✅ |
| I-3 | Password admin `admin123` como fallback | `docker-compose.yml:38` | `SEED_ADMIN_PASSWORD: ${SEED_ADMIN_PASSWORD:-admin123}` — si no se define, se usa `admin123` | ✅ |

> **Nota I-1:** `.env` NO está commiteado (confirmado con `git ls-files`). Está en `.gitignore`. El riesgo es si alguien lo commite en el futuro.

### ALTOS

| # | Problema | Archivo | Detalle |
|---|----------|---------|---------|
| I-4 | Puerto 5432 de Postgres expuesto al host | `docker-compose.yml:10` | En producción la BD solo debería ser accesible vía red interna Docker |
| I-5 | Healthcheck con usuario hardcodeado | `docker-compose.yml:14` | `pg_isready -U hub_admin` — si cambia `POSTGRES_USER`, el healthcheck falla |
| I-6 | Sin healthchecks en web/mobile | `docker-compose.yml`, `web/Dockerfile`, `mobile/Dockerfile.web` | Solo postgres y api tienen healthcheck. Web y mobile no tienen HEALTHCHECK en Dockerfile ni en compose |
| I-7 | Mobile corre como root | `mobile/Dockerfile.web` | nginx corre como root; web y backend usan usuario no-root (`USER nodejs`) |

### MEDIOS

| # | Problema | Archivo |
|---|----------|---------|
| I-9 | `Dockerfile.builder` y `Dockerfile.ota` sin SHA pinning | `mobile/` |
| I-10 | CORS `*` wildcard en nginx | `mobile/nginx.conf:13` |
| I-11 | `render.yaml` falta `JWT_REFRESH_SECRET` | `render.yaml` |
| I-12 | `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL` no se pasa al contenedor web | `docker-compose.yml` |
| I-13 | `ota-server` deshabilitado pero referenciado en docs | `PWA-DEPLOY.md` |
| I-14 | Sin volumen para uploads del backend | `docker-compose.yml` |
| I-15 | CORS_ORIGIN default a localhost en producción | `docker-compose.yml:37` |
| I-16 | SVG en manifest PWA (incompatible con algunos navegadores) | `web/public/manifest.json` |

### BAJOS

| # | Problema | Archivo |
|---|----------|---------|
| I-8 | `cloudflared` binario en disco local | raíz del proyecto |

> `cloudflared` está en `.gitignore` y NO está trackeado en git. Es solo un binario local de 37MB.

---

## ⚙️ BACKEND (Express + Drizzle + PostgreSQL)

### Endpoints Totales: 34

| Método | Endpoint | Auth | Rate Limit | Descripción |
|--------|----------|:----:|:----------:|-------------|
| GET | `/api/health` | No | Global | Health check |
| GET | `/api/health/db` | No | Global | Health + DB ping |
| GET | `/api/metrics` | **No** | Global | **Métricas internas (problema de seguridad)** |
| POST | `/api/auth/register` | No | 10/min | Registro |
| POST | `/api/auth/login` | No | 10/min | Login |
| GET | `/api/auth/me` | Sí | Global | Perfil usuario |
| POST | `/api/auth/refresh` | Cookie | 30/min | Refresh JWT |
| POST | `/api/auth/logout` | Sí | 30/min | Logout |
| POST | `/api/incidents` | Sí | 60/min | Crear incidente |
| GET | `/api/incidents` | Sí | 60/min | Listar incidentes |
| GET | `/api/incidents/:id` | Sí | 60/min | Detalle incidente |
| PATCH | `/api/incidents/:id` | Admin/Téc | 60/min | Actualizar incidente |
| DELETE | `/api/incidents/:id` | Admin/Téc | 60/min | Eliminar incidente |
| POST | `/api/incidents/:id/comments` | Sí | 60/min | Agregar comentario |
| GET | `/api/incidents/agentes` | Admin/Téc | 60/min | Listar agentes |
| GET | `/api/incidents/stats` | Admin/Téc | 60/min | Estadísticas |
| GET | `/api/incidents/export` | Admin/Téc | 60/min | Exportar a Excel |
| GET | `/api/incidents/unread-count` | Admin/Téc | 60/min | Conteo no vistos |
| PATCH | `/api/incidents/mark-seen` | Admin/Téc | 60/min | Marcar como vistos |
| POST | `/api/chat/message` | Sí | Global | Enviar mensaje chatbot |
| GET | `/api/chat/history` | Sí | Global | Historial chat |
| POST | `/api/users` | Admin/Téc | Global | Crear usuario |
| GET | `/api/users` | Admin/Téc | Global | Listar usuarios |
| PATCH | `/api/users/:id` | Admin/Téc | Global | Actualizar usuario |
| PATCH | `/api/users/:id/toggle-status` | Admin/Téc | Global | Bloquear/desbloquear |
| PATCH | `/api/users/:id/reset-password` | Admin/Téc | Global | Resetear contraseña |
| GET | `/api/dashboard/kpis` | Admin/Téc | Global | KPIs |
| GET | `/api/dashboard/summary` | Admin/Téc | Global | Resumen dashboard |
| POST | `/api/upload` | Admin/Téc | Global | Subir imagen (max 5MB) |
| POST | `/api/ratings/:id` | Sí | Global | Calificar incidente |
| GET | `/api/ratings/my-ratings` | Sí | Global | Mis calificaciones |
| GET | `/api/ratings` | Admin/Téc | Global | Stats calificaciones |
| POST | `/api/push/register` | Sí | 10/min | Registrar push token |
| GET/POST | `/api/puntos-venta` | Sí/Admin | Global | PV (listar/seed) |
| GET/PUT | `/api/settings` | Sí/Admin | Global | Config empresa |

### Tablas de BD: 8

| Tabla | Columnas | Índices |
|-------|----------|---------|
| `users` | id, documento, nombre, email, contrasena, rol, estado, ultima_actividad, token_version, intentos_fallidos, bloqueado_por, created_at | 1 (estado) |
| `incidents` | id, user_id, nombre, documento, punto_venta, telefono, descripcion, urgencia, estado, agente, solucion, imagen_url, cerrado_por, fecha_cierre, visto_por_admin, created_at, updated_at | 7 |
| `messages` | id, user_id, content, is_bot, created_at | 2 |
| `incident_comments` | id, incident_id, autor, texto, fecha | 1 |
| `ratings` | id, incident_id (UNIQUE), user_id, puntuacion, comentario, created_at | 2 |
| `puntos_venta` | id, nombre (UNIQUE), activo, created_at | 1 |
| `company_settings` | id, nombre, contribuyente, direccion, updated_at | 0 |
| `push_tokens` | id, user_id, token (UNIQUE), created_at | 1 |

### Enums

| Enum | Valores |
|------|---------|
| `rol` | user, asesor, admin, tecnico |
| `user_estado` | activo, bloqueado |
| `urgencia` | baja, media, alta |
| `estado` | pendiente, en_proceso, resuelto |

### CRÍTICOS Backend

| # | Problema | Archivo:Línea | Detalle |
|---|----------|---------------|---------|
| B-1 | `/api/metrics` sin autenticación | `src/index.ts:113-120` | Expone paths de API, errores, memoria, requests recientes |
| B-2 | `/uploads` servido sin auth | `src/index.ts:123` | Cualquier archivo subido es públicamente accesible |

### ALTOS Backend

| # | Problema | Archivo | Detalle |
|---|----------|---------|---------|
| B-4 | JWT retornado en body Y cookie | `auth.controller.ts:130` | Redundante; el body token puede guardarse en localStorage (XSS vulnerable) |
| B-5 | Push token puede ser robado | `push.controller.ts:20-24` | Reasigna token existente de otro usuario al actual sin verificar owner |
| B-7 | `bloqueado_por` FK sin ON DELETE | `schema.ts:33` | Si se borra el admin bloqueador, referencia huérfana |
| B-8 | `updateUser` no verifica documento duplicado | `users.controller.ts:205` | Error 500 en vez de 409 si documento ya existe |

### MEDIOS Backend

| # | Problema | Archivo |
|---|----------|---------|
| B-6 | Rate limit específico insuficiente para endpoints admin | Múltiples |
| B-9 | Password mínimo 4 chars en login | `auth.schema.ts:9` |
| B-10 | `getSummary` hace 8+ queries secuenciales | `dashboard.controller.ts:76` |
| B-11 | `ultima_actividad` se actualiza en CADA request | `middlewares/auth.ts:55` |
| B-12 | Datos de seed duplicados en 2 archivos | `seed.ts` y `puntos-venta.controller.ts` |
| B-13 | `updateSettings` puede tener race condition | `settings.controller.ts:33` |
| B-14 | Sin tests de controllers/integración | Solo tests de schema |

> **B-6:** Los endpoints admin (`/users/*`, `/dashboard/*`) solo tienen rate limit global (100/min). No tienen rate limit específico.
> **B-9:** Login acepta min 4 chars (`auth.schema.ts:9`), pero register exige min 6 (`auth.schema.ts:19`). Inconsistente.
> **B-10:** `getSummary` hace 8+ queries secuenciales + 7 queries para last7Days + messageCount.

### Buenas Prácticas Backend

- Zod validation en todos los inputs
- Queries parametrizadas (Drizzle ORM, no SQL injection)
- bcrypt con cost factor 10
- Rate limiting global y por ruta
- Helmet con CSP
- JWT httpOnly cookies
- Token version invalidation en logout
- Account lockout tras intentos fallidos
- Role-based access control
- State machine en incidentes
- File upload con whitelist MIME y límite 5MB
- Docker corre como usuario no-root

---

## 🖥️ WEB FRONTEND (Next.js 15 + React 19)

### Inventario de Archivos

| Categoría | Cantidad | Líneas aprox. |
|-----------|:--------:|:-------------:|
| Páginas | 16 | ~3,400 |
| Componentes | 27 | ~3,100 |
| Contexts | 2 | ~146 |
| Lib | 3 (src) | ~240 |
| Config | 10 | ~150 |
| **Total** | **58** | **~7,000** |

### Páginas

#### Públicas
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Redirect a /login |
| `/login` | `app/login/page.tsx` | Login admin (201 líneas) |
| `/user/login` | `app/user/login/page.tsx` | Login usuario (127 líneas) |

#### Dashboard (Admin/Técnico)
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/dashboard` | `app/dashboard/page.tsx` | Panel KPIs + tickets + usuarios (104 líneas) |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | Gráficas y filtros (323 líneas) |
| `/dashboard/users` | `app/dashboard/users/page.tsx` | CRUD usuarios (160 líneas) |
| `/dashboard/tickets` | `app/dashboard/tickets/page.tsx` | Gestión tickets (500 líneas — **archivo más grande**) |
| `/dashboard/ratings` | `app/dashboard/ratings/page.tsx` | Calificaciones (68 líneas) |
| `/dashboard/external-systems` | `app/dashboard/external-systems/page.tsx` | Sistemas externos (95 líneas) |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | Configuración 3 tabs (489 líneas) |

#### Usuario (Móvil)
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/user/chat` | `app/user/(main)/chat/page.tsx` | Chatbot (286 líneas) |
| `/user/reportar` | `app/user/(main)/reportar/page.tsx` | Formulario reporte (227 líneas) |
| `/user/historial` | `app/user/(main)/historial/page.tsx` | Lista incidentes (111 líneas) |
| `/user/ajustes` | `app/user/(main)/ajustes/page.tsx` | Ajustes (127 líneas) |
| `/user/exito` | `app/user/(main)/exito/page.tsx` | Confirmación ticket (88 líneas) |
| `/user/incidente/[id]` | `app/user/(main)/incidente/[id]/page.tsx` | Detalle incidente (149 líneas) |

### CRÍTICOS Frontend

| # | Problema | Archivo | Detalle |
|---|----------|---------|---------|
| F-2 | IP interna hardcodeada en `.env.example` | `web/.env.example:2` | `http://192.168.60.66:8100` — IP privada expuesta en archivo de ejemplo |
| F-3 | Sin Service Worker (PWA incompleta) | `web/public/` | No hay `sw.js`, no hay plugin PWA, no hay registro |

### ALTOS Frontend

| # | Problema | Archivo | Detalle |
|---|----------|---------|---------|
| F-4 | Middleware solo verifica existencia de cookie | `middleware.ts:5` | No valida JWT; cookie falsa bypass el redirect |
| F-6 | Sin responsive en dashboard | Múltiples | Sidebar fijo 250px, grids sin breakpoints |

> **Nota F-5:** Este hallazgo es incorrecto. La cookie `csrf-token` se establece con `httpOnly: true` en `csrf.ts:14`. El código en `web/src/lib/api.ts:20` intenta leerla con `document.cookie.match(...)`, pero como es httpOnly, esta línea nunca retorna el token. El token CSRF real se obtiene del body de la respuesta (`body.csrfToken` en `api.ts:48`). La protección CSRF funciona correctamente. **Este hallazgo debe eliminarse.**

### MEDIOS Frontend

| # | Problema | Archivo | Verificación |
|---|----------|---------|:---:|
| F-7 | `alert()` y `confirm()` nativos | tickets, settings, ajustes | ✅ |
| F-8 | Dark mode solo ~70% (área usuario sin soporte) | Todas las páginas /user/* | ✅ |
| F-9 | `globals.css` aplana todos los grises en dark mode | `globals.css:25-35` | ✅ |
| F-10 | Funciones helper duplicadas | `formatDate`, `formatTicketId`, `getInitials` | ✅ |
| F-11 | Sidebar width (250px) hardcodeado en 3 archivos | layout, Sidebar, Topbar | ✅ |
| F-12 | Archivos grandes sin extracción | tickets (500), settings (489), AnalyticsFilters (374) | ✅ |
| F-13 | `suppressHydrationWarning` en `<html>` | `layout.tsx:33` | ✅ |
| F-14 | 6 eslint-disable para hooks | `chat/page.tsx`, `AuthContext.tsx` | ✅ |
| F-15 | Teléfono hardcodeado en ayuda | `HelpModal.tsx:9-10` | ✅ |

### Dark Mode — Cobertura

| Área | Estado |
|------|:------:|
| Login admin | ✅ |
| Dashboard (todas las páginas) | ✅ |
| Sidebar + Topbar | ✅ |
| Todos los componentes admin | ✅ |
| Login usuario | ❌ |
| Chat | ❌ |
| Reportar | ❌ |
| Historial | ❌ |
| Ajustes usuario | ❌ |
| Éxito | ❌ |
| Detalle incidente | ❌ |
| Componentes user/* (7) | ❌ |

### Responsive — Cobertura

| Área | Estado |
|------|:------:|
| Dashboard admin | ❌ Desktop-only (sidebar fijo 250px) |
| Tablas (tickets, usuarios) | ❌ Sin responsive |
| KPIs cards (grid-cols-4) | ❌ Sin stacking |
| Área usuario (móvil) | ✅ Mobile-first con BottomNav |

---

## 📱 MOBILE APP (Expo + React Native)

### Inventario de Archivos

| Categoría | Cantidad | Líneas aprox. |
|-----------|:--------:|:-------------:|
| App routes | 8 | ~2,300 |
| Screens | 3 | ~1,140 |
| Services | 4 | ~444 |
| Contexts | 2 | ~206 |
| Components | 17 | ~1,350 |
| Config | 15 | ~200 |
| **Total** | **49** | **~5,640** |

### Pantallas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/index.tsx` → `LoginScreen.tsx` | Login (138 líneas) |
| `/chat` | `app/chat.tsx` → `ChatScreen.tsx` | Chatbot (581 líneas — **más complejo**) |
| `/reportar` | `app/reportar.tsx` → `ReportScreen.tsx` | Formulario reporte (425 líneas) |
| `/historial` | `app/historial.tsx` | Lista incidentes (313 líneas inline) |
| `/exito` | `app/exito.tsx` | Confirmación (408 líneas inline) |
| `/ajustes` | `app/ajustes.tsx` | Settings (363 líneas inline) |
| `/incidente/[id]` | `app/incidente/[id].tsx` | Detalle incidente (242 líneas inline) |

### C-RITICOS Mobile

| # | Problema | Archivo | Detalle | Verificación |
|---|----------|---------|---------|:---:|
| M-1 | JWT en localStorage en web | `src/services/storage.ts:19-28` | Plaintext — vulnerable a XSS. Confirmado: `webSet` usa `localStorage.setItem`, `webGet` usa `localStorage.getItem`. Solo aplica en plataforma web, no en nativo (usa SecureStore) | ✅ |
| M-2 | CORS `*` wildcard en nginx | `nginx.conf:13` | Cualquier origen puede hacer requests. Confirmado: `add_header Access-Control-Allow-Origin *;` | ✅ |
| M-3 | URL de API producción hardcodeada en eas.json | `eas.json:18,27` | `https://hub-platform-api.onrender.com/api` en repo. Confirmado en perfiles preview y production | ✅ |

### ALTOS Mobile

| # | Problema | Archivo | Detalle | Verificación |
|---|----------|---------|---------|:---:|
| M-4 | `NODE_ENV` puede no estar seteado | `src/services/logger.ts:3` | ~~`IS_DEV` queda `true` incluso en producción~~ → ⚠️ **Parcial**: Expo siempre setea NODE_ENV en builds. Solo sería problema en tests manuales sin configurar. El código `process.env.NODE_ENV !== "production"` es correcto | ⚠️ |
| M-5 | `Node.prototype.removeChild` monkey-patched globalmente | `SafeAreaProviderWrapper.tsx:6-16` | Workaround frágil que afecta todo el DOM. Confirmado: `Node.prototype.removeChild = function...` en Platform.OS === "web" | ✅ |
| M-6 | Sin CSRF protection en refresh con CORS wildcard | `api.ts:66` + `nginx.conf` | Confirmado: el refresh del mobile usa `credentials: "include"` pero no envía CSRF token, y el backend permite Bypass para requests con `Authorization: Bearer` (`csrf.ts:32`) | ✅ |
| M-7 | Sin React Error Boundaries | Toda la app | Crash = pantalla blanca. Confirmado: no hay archivos `*error*` ni `*Error*` en mobile | ✅ |

### MEDIOS Mobile

| # | Problema | Archivo | Verificación |
|---|----------|---------|:---:|
| M-8 | Error swallowing silencioso (6 ubicaciones) | reportar, AuthContext, etc. | ✅ |
| M-9 | Constantes de color duplicadas con divergencias | `historial.tsx` vs `incidente/[id].tsx` (`en_proceso` difiere) | ✅ |
| M-10 | Estilos mixtos (className vs inline) | Varios componentes | ✅ |
| M-11 | Sin sanitización de input chat | `ChatScreen.tsx:165` | ✅ |
| M-12 | Password validation 4 chars | `LoginScreen.tsx:38` | ✅ |
| M-13 | `isReady` state sin usar | `app/_layout.tsx:16` | ✅ |
| M-14 | 4 archivos inline de 300-400+ líneas | exito, historial, ajustes, incidente | ✅ |
| M-15 | Sin tests unitarios | Toda la app | ✅ |
| M-16 | Sin analytics/crash reporting | Toda la app | ✅ |
| M-17 | `expo-symbols` necesita postinstall hack | `package.json:50` | ✅ |

---

## 📦 SHARED TYPES (`@hub/shared`)

### 18 Tipos Exportados

| Archivo | Tipos |
|---------|-------|
| `types/auth.ts` | AuthUser, LoginInput, RegisterInput, AuthResponse |
| `types/user.ts` | ApiUser |
| `types/incident.ts` | IncidentUrgency, IncidentStatus, Incident, IncidentComment, CreateIncidentInput, UpdateIncidentInput |
| `types/api.ts` | PaginatedResponse, KpiResponse, CompanySettings, DashboardSummary |
| `types/rating.ts` | Rating, RatingWithDetails, PromedioPv, CreateRatingInput, RatingStats |

### Problema
- `shared/README.md` desactualizado — falta documentar 6 tipos

---

## 📊 Resumen por Prioridad

### Prioridad CRÍTICA (Arreglar ya)

1. **Rotar secrets** si `.env` o `.env.local` fueron commiteados (passwords JWT, Postgres) — ⚠️ Verificado: NO están commiteados (`git ls-files` confirma), pero los secrets reales están en disco
2. **Proteger `/api/metrics`** con autenticación — ✅ Confirmado: `index.ts:113` sin auth
3. **Proteger `/uploads`** con auth o CDN con URLs firmadas — ✅ Confirmado: `index.ts:123` sin auth
4. **Quitar CORS `*`** en nginx, restringir orígenes — ✅ Confirmado: `nginx.conf:13`
5. **Instalar `next-pwa`** y generar service worker para la PWA — ✅ Confirmado: no hay sw.js
6. **Convertir icons PWA a PNG** (SVG no funciona en todos los navegadores) — ✅ Confirmado: manifest usa SVG
7. **Levantar contenedor `hub-mobile`** (`docker compose up -d mobile`) — ✅ Confirmado: no está corriendo

> **Correcciones post-verificación:**
> - ~~B-3 (`env.example` con credenciales reales)~~ → ❌ **FALSO**: Usa placeholders. Eliminado de esta lista.
> - ~~F-5 (CSRF cookie JS-accessible)~~ → ❌ **FALSO**: La cookie CSRF es httpOnly. Eliminado de esta lista.

### Prioridad ALTA (Esta semana)

8. Agregar healthchecks a servicios web y mobile — ✅ Confirmado
9. No exponer puerto 5432 al host en producción — ✅ Confirmado
10. Crear React Error Boundaries en mobile — ✅ Confirmado
11. Agregar responsive al dashboard admin (sidebar colapsable) — ✅ Confirmado
12. Completar dark mode en área de usuario — ✅ Confirmado
13. Fortalecer política de contraseñas (min 6-8 chars) — ✅ Confirmado: login acepta 4 chars
14. Verificar que `.env` nunca fue commiteado (`git log --all --diff-filter=A -- .env`) — ✅ Verificado: NUNCA fue commiteado

> **Correcciones post-verificación:**
> - B-6 (Sin rate limit en endpoints sensibles) → ⚠️ **Parcial**: Sí tienen rate limit global (100/min), pero no específico para admin
> - I-8 (cloudflared en disco) → ⚠️ **Parcial**: Está en `.gitignore`, no es problema del repo. Rebajar a LOW.

### Prioridad MEDIA (Próximas semanas)

15. Reemplazar `alert()`/`confirm()` nativos con modales custom — ✅ Confirmado
16. Extraer archivos grandes (>400 líneas) en componentes separados — ✅ Confirmado
17. Consolidar funciones helper duplicadas en `lib/` — ✅ Confirmado
18. Agregar tests de controllers (backend) y componentes (web) — ✅ Confirmado
19. Throttlear `ultima_actividad` (no en cada request) — ✅ Confirmado: `auth.ts:55-58` actualiza en cada request
20. Fix N+1 query en `getSummary` dashboard — ✅ Confirmado: 8+ queries secuenciales + 7 queries para last7Days
21. Agregar volume para uploads del backend — ✅ Confirmado
22. Actualizar `shared/README.md` con los 18 tipos — ✅ Confirmado
23. Sync constantes de color mobile (divergencia en `en_proceso`) — ✅ Confirmado
24. Pasar `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL` al contenedor web — ✅ Confirmado

### Prioridad BAJA (Cuando haya tiempo)

25. Agregar tests unitarios en mobile — ✅ Confirmado
26. Integrar Sentry/Crashlytics en mobile — ✅ Confirmado
27. Agregar CONTRIBUTING.md y SECURITY.md — ✅ Confirmado
28. Documentación API (Swagger/OpenAPI) — ✅ Confirmado
29. SHA pinning en todos los Dockerfiles — ✅ Confirmado
30. Crear healthcheck para ota-server — ✅ Confirmado

---

## 📁 Documentación del Proyecto

| Archivo | Estado | Última Actualización |
|---------|:------:|:--------------------:|
| `README.md` | ✅ Completo | 2026-07-21 |
| `CHANGELOG.md` | ✅ Detallado | 2026-07-21 |
| `AUDIT-COMPLETA.md` | ✅ Auditoría seguridad | 2026-07-07 |
| `PWA-DEPLOY.md` | ⚠️ Referencia servicio deshabilitado | 2026-07-14 |
| `DISTRIBUCION-APK.md` | ✅ Guía distribución | 2026-07-14 |
| `PENDIENTES.md` | ✅ Este archivo | 2026-07-22 |
| `shared/README.md` | ⚠️ Desactualizado | Desconocido |

---

## 🗓️ PLAN DE ACCIÓN — Mañana (2026-07-23)

### Mañana temprano (30 min) — Seguridad urgente

| # | Qué hacer | Archivos a tocar | Tiempo | Prioridad real |
|---|-----------|------------------|--------|:---:|
| 1 | **Rotar secrets**: generar nuevos JWT_SECRET y JWT_REFRESH_SECRET, cambiar password Postgres, actualizar admin seed | `.env`, `.env.local`, `docker-compose.yml` | 5 min | ✅ Real |
| 2 | **Proteger `/api/metrics`** con auth + adminOnly | `backend/src/index.ts` línea ~113 | 5 min | ✅ Real |
| 3 | **Proteger `/uploads`** con auth middleware | `backend/src/index.ts` línea ~123 | 5 min | ✅ Real |
| 4 | **Quitar CORS `*`** en nginx, poner dominio real | `mobile/nginx.conf` línea 13 | 2 min | ✅ Real |
| 5 | **Fix healthcheck** — cambiar user hardcodeado por variable | `docker-compose.yml` línea 14 | 2 min | ✅ Real |
| 6 | **Agregar `.env.local` a `.gitignore`** del web | `web/.gitignore` | 1 min | ⚠️ Baja: el `.gitignore` raíz ya protege |
| 7 | ~~Verificar si .env fue commiteado~~ | ~~Terminal~~ | ~~5 min~~ | ❌ **Ya verificado**: NUNCA fue commiteado |

> **Eliminados del plan original:**
> - ~~B-3 (Fix .env.example con credenciales reales)~~ → No es necesario, usa placeholders
> - ~~F-5 (Fix CSRF cookie JS-accessible)~~ → No es necesario, la cookie ya es httpOnly

### Media mañana (3-4 horas) — PWA

| # | Qué hacer | Archivos a tocar | Tiempo |
|---|-----------|------------------|--------|
| 8 | **Instalar `@ducanh2912/next-pwa`** en web | `web/package.json` | 5 min |
| 9 | **Configurar plugin** en next.config.ts | `web/next.config.ts` | 30 min |
| 10 | **Configurar Workbox** — cache de assets, offline fallback | Nuevo archivo config | 1 hora |
| 11 | **Registrar service worker** en layout | `web/src/app/layout.tsx` o nuevo archivo | 30 min |
| 12 | **Crear `public/offline.html`** como fallback | `web/public/offline.html` | 20 min |
| 13 | **Convertir icons SVG a PNG** (192 y 512) | `web/public/icons/` | 20 min |
| 14 | **Actualizar manifest.json** para usar PNG | `web/public/manifest.json` | 5 min |
| 15 | **Probar instalación** en Chrome Android | Abrir en móvil | 10 min |

### Tarde (1-2 horas) — Mobile + fixes

| # | Qué hacer | Archivos a tocar | Tiempo |
|---|-----------|------------------|--------|
| 16 | **Levantar `hub-mobile`**: `docker compose up -d mobile` | Terminal | 5 min |
| 17 | **Verificar** que Expo web carga en :8081 | Browser | 5 min |
| 18 | **Fix push token robable** — verificar owner antes de reasignar | `backend/src/modules/push/push.controller.ts` | 20 min |
| 19 | **Password min 6 chars** en login schema | `backend/src/modules/auth/auth.schema.ts` línea 9 | 2 min |
| 20 | **Fix `updateUser`** — verificar documento duplicado antes de UPDATE | `backend/src/modules/users/users.controller.ts` | 20 min |
| 21 | **Throttlear `ultima_actividad`** — solo actualizar cada 5 min | `backend/src/middlewares/auth.ts` línea 55 | 15 min |

### Si queda tiempo

| # | Qué hacer | Tiempo |
|---|-----------|--------|
| 22 | Crear React Error Boundary para mobile | 30 min |
| 23 | Agregar healthchecks a web y mobile en docker-compose | 10 min |
| 24 | Agregar volume para uploads del backend | 5 min |

### Total estimado: ~5-7 horas (reducido desde 6-8h por hallazgos falsos eliminados)

### Commits planificados

1. `fix: rotate secrets and protect internal endpoints` (items 1-6)
2. `feat: add PWA support with next-pwa and service worker` (items 8-15)
3. `fix: mobile container, push token security, password policy` (items 16-21)
4. `chore: error boundaries, healthchecks, volumes` (items 22-24)

---

## RESUMEN DE VERIFICACIÓN COMPLETA

| Categoría | Total | ✅ Confirmado | ⚠️ Parcial | ❌ Falso |
|-----------|:-----:|:---:|:---:|:---:|
| Infraestructura | 16 | 14 | 1 (I-8) | 0 |
| Backend | 14 | 13 | 1 (B-6) | 1 (B-3) |
| Frontend | 15 | 13 | 1 (F-1) | 1 (F-5) |
| Mobile | 17 | 16 | 1 (M-4) | 0 |
| Shared | 1 | 1 | 0 | 0 |
| **TOTAL** | **63** | **57** | **4** | **2** |

### Hallazgos que NO requieren acción:

| # | Razón |
|---|-------|
| B-3 | `.env.example` usa placeholders, no credenciales reales |
| F-5 | Cookie CSRF es httpOnly, no vulnerable a XSS via `document.cookie` |
| I-8 | `cloudflared` está en `.gitignore`, no trackeado en git |
| F-1 | `.env.local` está protegido por `.gitignore` raíz (`.env.*`) |

### Hallazgos con severidad ajustada:

| # | Original | Ajustado | Razón |
|---|----------|----------|-------|
| I-8 | ALTO | BAJO | Binario local, no en git |
| B-6 | ALTO | MEDIO | Sí tiene rate limit global, solo falta específico |
| F-1 | CRÍTICO | BAJO | Protegido por `.gitignore` raíz |
| M-4 | ALTO | BAJO | Expo setea NODE_ENV automáticamente |
