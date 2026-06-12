# Auditoría Completa — hub-platform

**Fecha:** 2026-06-11
**Proyectos:** Web (Next.js 15 + React 19), Mobile (Expo SDK 56 + RN 0.85), Backend (Express + Drizzle ORM + PostgreSQL), Shared Types
**LOC total:** ~9,000 en 100 archivos `.ts`/`.tsx`
**Commits revisados:** últimos 20 (v2 branch)
**Tests:** 0 (cero) en todo el repositorio

---

## 1. VISIÓN GENERAL DEL PROYECTO

| Componente | Lenguaje | Archivos | LOC | Dependencias clave |
|------------|----------|----------|-----|--------------------|
| **backend/** | TypeScript | 26 | ~1,700 | Express, Drizzle ORM, PostgreSQL, Zod, JWT, Helmet, bcrypt |
| **web/** | TypeScript/TSX | 33 | ~4,000 | Next.js 15, React 19, TailwindCSS, Recharts, ExcelJS |
| **mobile/** | TypeScript/TSX | 29 | ~3,100 | Expo SDK 56, React Native 0.85, NativeWind 4, expo-router |
| **shared/** | TypeScript | 6 | ~80 | Sin dependencias (barrel de tipos) |
| **Total** | | **100** | **~9,000** | 0 tests, 33 componentes, 34 rutas |

---

## 2. SEGURIDAD — HALLAZGOS CRÍTICOS

### 🔴 CRÍTICOS

| ID | Hallazgo | Archivo | Riesgo |
|----|----------|---------|--------|
| **C1** | Sin tests automatizados en todo el repo | — | No hay red de seguridad ante regresiones |
| **C2** | `eslint.ignoreDuringBuilds: true` | `web/next.config.ts:5` | Errores de lint pasan a producción |
| **C3** | Producción API URL hardcodeada | `web/src/lib/api.ts:2-4` | `https://hub-platform-api.onrender.com/api` hardcodeada |
| **C4** | `console.log` en componente de producción | `web/src/components/UserManagement.tsx:54-57` | Expone data cruda de API en consola |
| **C5** | Seed imprime contraseña en stdout | `backend/src/db/seed.ts:27` | Queda en logs de Render/Docker |
| **C6** | `JWT_REFRESH_SECRET` fallback a `JWT_SECRET` | `backend/src/config/env.ts:12` | Ambos tokens comparten clave si no se configura |

### 🔴 ALTOS

| ID | Hallazgo | Archivo | Riesgo |
|----|----------|---------|--------|
| **H1** | `.env` con credenciales existe en disco (aunque `.gitignore` funciona) | `backend/.env` | `hub_jwt_secret_dev_2026`, `hub_secret` |
| **H2** | CORS producción fallback a localhost | `backend/src/index.ts:48` | Si `CORS_ORIGIN` no está configurado, falla a `http://localhost:3000` |
| **H3** | `rejectUnauthorized: false` en SSL PostgreSQL | `backend/src/db/index.ts:7` | Acepta cualquier certificado en producción |
| **H4** | CSRF cookie `httpOnly: false` | `backend/src/middlewares/csrf.ts:8` | Accesible desde JS (diseño SPA, pero riesgo XSS) |
| **H5** | Sin refresh token en mobile | `mobile/src/services/api.ts:89` | En 401 solo limpia token, fuerza re-login |
| **H6** | Sin error boundaries en web | `web/src/app/` (ningún `error.tsx`) | Error de renderizado = pantalla blanca |
| **H7** | Sin middleware de protección de rutas server-side | `web/` (no hay `middleware.ts`) | Auth solo client-side, posible flash de contenido |

### 🟡 MEDIOS

| ID | Hallazgo | Archivo | Riesgo |
|----|----------|---------|--------|
| **M1** | TypeScript 6.0 pre-release en mobile | `mobile/package.json:35` | `typescript@~6.0.3` — inestable |
| **M2** | Tokens de shared/ duplicados en web y mobile | `web/src/types/user.ts`, `mobile/src/types/` | `AuthUser`, `ApiUser` definidos en 3 proyectos |
| **M3** | Sin pool error handler PostgreSQL | `backend/src/db/index.ts` | Pool crash silencioso |
| **M4** | Botones sin handler | `Topbar.tsx`, `tickets/page.tsx:249`, `settings/page.tsx` | Componentes no funcionales |
| **M5** | Inline styles inconsistentes | Varios componentes web | Mezcla Tailwind + `style={{}}` |
| **M6** | Relative path import de shared/ desde mobile | `mobile/src/contexts/AuthContext.tsx:16` | Ruta `../../../shared/` frágil |
| **M7** | `dist/` desactualizado del source | `backend/dist/index.js` | Faltan cambios de CSRF, etc. |
| **M8** | Hardcoded email domain | `backend/src/modules/incidents/incidents.controller.ts` | `@hub.ai` hardcodeado |

### ⚪ BAJOS / INFO

| ID | Hallazgo | Archivo |
|----|----------|---------|
| **L1** | `console.error` como raw catch handler | `mobile/app/historial.tsx:55`, `mobile/app/incidente/[id].tsx:73` |
| **L2** | Placeholders `XXXXXXXXXXXX` en Settings | `web/src/app/dashboard/settings/page.tsx` |
| **L3** | `data as T` sin validación runtime en api.ts | `web/src/lib/api.ts:125` |
| **L4** | Readme desactualizados (backend, web dicen "no implementado") | `backend/README.md`, `web/README.md` |
| **L5** | Nombres de columna mezclan español/inglés | `backend/src/db/schema.ts` (`contrasena` vs `created_at`) |
| **L6** | Morgan logging en desarrollo (info) | `backend/src/index.ts:51-53` |
| **L7** | Helmet CSP deshabilitado en desarrollo (info) | `backend/src/index.ts:34` |
| **L8** | Sin request ID tracking | Todo el backend |

---

## 3. ARQUITECTURA Y CALIDAD DE CÓDIGO

### Fortalezas

| Aspecto | Detalle |
|---------|---------|
| **TypeScript strict** | Todos los proyectos tienen `strict: true` |
| **Sin `any`** | Casi nulo uso de `any` (solo 1 `as any` para RN style) |
| **Error handling** | Todos los controllers async tienen try/catch |
| **React hooks** | Arrays de dependencias correctos en todos los hooks |
| **Input validation** | Validación Zod en todos los endpoints |
| **Rate limiting** | Global (100/min) + Auth (10/15min) + Incidents (60/min) |
| **JWT con token_version** | Invalidación de sesión por versión |
| **CSRF protection** | Implementado con double-submit cookie pattern |
| **Helmet headers** | CSP, XSS, etc. configurados en producción |
| **Docker multi-stage** | Build separado de producción |
| **Healthcheck** | Configurado en Dockerfile y endpoint `/api/health` |
| **Seed idempotente** | No duplica usuarios si ya existen |

### Debilidades

| Aspecto | Detalle |
|---------|---------|
| **0 tests** | Sin jest, vitest, playwright, ni ningún framework de testing |
| **ESLint deshabilitado en build** | `ignoreDuringBuilds: true` anula toda la lint |
| **Sin CI/CD** | No hay GitHub Actions, GitLab CI ni otro pipeline |
| **Sin Error Boundaries** | Web no tiene `error.tsx` en ninguna ruta |
| **Autenticación solo client-side** | No hay Next.js middleware para proteger rutas |
| **API URL hardcodeada en web** | Fallback a producción en source code |
| **Sin structured logging** | Solo `console.error` en todo el backend |
| **Mixed styling patterns** | Tailwind + inline styles en web |
| **Shared/ infrautilizado** | Solo mobile importa de shared/, web duplica tipos |

---

## 4. ANÁLISIS DE DEPENDENCIAS

### Backend (`npm audit --production`): **0 vulnerabilidades** ✅

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| express | ^4.21.2 | ✅ Latest |
| drizzle-orm | ^0.45.2 | ✅ Latest |
| helmet | ^8.0.0 | ✅ Latest |
| zod | ^3.24.2 | ✅ Latest |
| bcryptjs | ^2.4.3 | ✅ Estable |
| jsonwebtoken | ^9.0.2 | ✅ Latest |
| pg | ^8.13.1 | ✅ Latest |

### Web

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| next | ^15.5.19 | ✅ Latest |
| react | ^19.0.0 | ✅ Latest |
| recharts | ^3.0.0 | ✅ Moderno |
| tailwindcss | ^3.4.17 | ✅ Estable |

### Mobile

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| expo | ~56.0.8 | ⚠️ SDK 56 (reciente) |
| react-native | 0.85.3 | ⚠️ Reciente |
| typescript | ~6.0.3 | 🔴 **Pre-release inestable** |
| nativewind | ^4.2.4 | ✅ Latest |

### 🔴 Issues de dependencias

| Issue | Detalle |
|-------|---------|
| TypeScript 6.0.3 en mobile | Versión pre-release (TS 6 no es stable). Riesgo de bugs/breaking changes |
| Sin dependencias dev de testing | Ningún proyecto incluye jest, vitest, playwright, o similar |
| Sin workspaces | `shared/` no está configurado como workspace en ningún package.json |

---

## 5. GIT Y VERSIONADO

| Aspecto | Detalle |
|---------|---------|
| **Rama activa** | `v2` (23 commits ahead de `main`) |
| **Ramas** | `main`, `v2` |
| **Remoto** | `origin/main`, `origin/v2` |
| **Cambios sin commit** | Solo `web/tsconfig.tsbuildinfo` (archivo de build, ignorable) |
| **Últimos commits** | Auditoría, dark mode, CSRF fix, seguridad P0-P4 |
| **`.env` en git** | ✅ NO trackeados (solo `.env.example`) |
| **`dist/` en git** | ⚠️ `dist/` no está en `.gitignore` del backend y tiene código desactualizado |

---

## 6. MÉTRICAS DE AUDITORÍA PREVIAS

El proyecto ya tiene dos documentos de auditoría:
- **`audit-report.md`** (2026-06-09): 6 hallazgos críticos (comentarios sin verificación, stats sin adminOnly, JWT en cookie JS, auto-creación de usuarios, secrets en docker-compose, falta validación UUID)
- **`AUDIT.md`** (2026-06-10): 5 HIGH, 3 MEDIUM, 2 LOW

### Estado de issues previos

| ID Previo | Descripción | Estado actual | Referencia nuestra |
|-----------|-------------|---------------|-------------------|
| audit-report #1 | Comentarios sin verificación de propietario | 🟡 **Aún presente** en `incidents.controller.ts:addComment` | — |
| audit-report #2 | Stats sin adminOnly | ✅ **CORREGIDO** (tiene `adminOnly`) | — |
| audit-report #3 | JWT en cookie JS-accessible | 🟡 **Mitigado** (backend usa HttpOnly ahora, pero web aún usa `document.cookie` para CSRF) | H4 |
| audit-report #4 | Auto-creación de usuarios | 🟡 **Aún presente** en `createIncident` | — |
| audit-report #5 | Secrets en docker-compose | 🔴 **Aún presente** (valores default) | H1 |
| audit-report #6 | Falta validación UUID | ✅ **CORREGIDO** (Zod `uuid()` params) | — |
| AUDIT.md H1 | console.log filtrando data | 🔴 **Aún presente** | C4 |
| AUDIT.md H2 | Seed imprime password | 🔴 **Aún presente** | C5 |
| AUDIT.md H3 | JWT_REFRESH_SECRET no en .env.example | 🟡 **Aún presente** (el ejemplo no lo incluye) | C6 |
| AUDIT.md H4 | Mobile sin refresh token | 🔴 **Aún presente** | H5 |
| AUDIT.md H5 | Shared types duplicados | 🔴 **Aún presente** | M2 |
| AUDIT.md M1 | rejectUnauthorized: false | 🔴 **Aún presente** | H3 |
| AUDIT.md M2 | Placeholders XXXXXXXXXXXX | 🔴 **Aún presente** | L2 |
| AUDIT.md M3 | Botones sin handler | 🔴 **Aún presente** | M4 |
| AUDIT.md L1 | 0 tests | 🔴 **Aún presente** | C1 |
| AUDIT.md L2 | console.error raw handler | 🔴 **Aún presente** | L1 |

---

## 7. RECOMENDACIONES PRIORIZADAS

### 🚨 Inmediato (1-2 días)

1. **Eliminar `console.log` de UserManagement.tsx** (C4)
2. **Configurar `JWT_REFRESH_SECRET` en `.env.example` y producción** (C6)
3. **Agregar `error.tsx`** en todas las rutas de web (H6)
4. **Agregar middleware server-side** de auth en Next.js (H7)
5. **Mover API URL de producción a env var** (C3)
6. **Reconstruir `dist/` del backend** (M7)

### 🔴 Corto plazo (1 semana)

7. **Agregar suite de tests** (C1) — al menos unit tests para servicios críticos
8. **Configurar CI/CD** (GitHub Actions con lint + typecheck + tests)
9. **Habilitar ESLint en builds** (C2)
10. **Configurar pool error handler** en PostgreSQL (M3)
11. **Reemplazar `console.error` con structured logging** (winston/pino)
12. **Configurar TypeScript versión stable en mobile** (M1)

### 🟡 Mediano plazo (2-4 semanas)

13. **Implementar refresh token en mobile** (H5)
14. **Migrar shared/ como workspace dependency** para web y mobile (M2, M6)
15. **Verificar propiedad en `addComment`** (issue audit-report #1)
16. **Eliminar auto-creación de usuarios en `createIncident`** (issue audit-report #4)
17. **Unificar estilos** (Tailwind classes en vez de inline styles) (M5)
18. **Eliminar placeholders y conectar botones** (M4, L2)

### ⚪ Largo plazo

19. **Agregar monitoreo y alertas**
20. **Implementar rate limiting por usuario**
21. **Auditar y rotar secretos periódicamente**
22. **Agregar HTTPS enforcement**
23. **Migrar nombres de columna a un solo idioma**

---

## 8. ESTADÍSTICAS FINALES

| Métrica | Valor |
|---------|-------|
| Archivos .ts/.tsx | 100 |
| Líneas de código | ~9,000 |
| Paquetes | 4 (backend, web, mobile, shared) |
| Componentes React | 18 web + 15 mobile = 33 |
| Rutas API | 16 REST + 1 health |
| Tests | 0 |
| Commits en v2 | ~23 |
| Vulnerabilidades npm | 0 |
| Hallazgos críticos nuevos | 7 |
| Hallazgos altos nuevos | 7 |
| Hallazgos medios nuevos | 8 |
| Hallazgos bajos nuevos | 8 |
| Issues previos pendientes | 13 de 16 |
