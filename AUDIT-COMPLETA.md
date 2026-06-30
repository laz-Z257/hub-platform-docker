# Auditoría Completa — hub-platform

**Fecha original:** 2026-06-11
**Verificación:** 2026-06-30 — Revisión de cada hallazgo contra el código actual
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

> **Estado de verificación (2026-06-30):** Hallazgos C6, M2, M5, M8, L1, L3 corregidos en sesión 2026-06-30. Se indica estado actual de cada uno.

### 🔴 CRÍTICOS

| ID | Hallazgo | Estado Actual | Detalle |
|----|----------|---------------|---------|
| **C1** | Sin tests automatizados en todo el repo | ❌ **Sigue vigente** | 0 tests en todo el repositorio |
| **C2** | `eslint.ignoreDuringBuilds: true` | ✅ **CORREGIDO** | Ahora es `false` en `web/next.config.ts:6` |
| **C3** | Producción API URL hardcodeada | ✅ **CORREGIDO** | Usa `NEXT_PUBLIC_API_URL` con fallback a `/api` o `localhost:3001/api` |
| **C4** | `console.log` en componente de producción | ✅ **CORREGIDO** | Ahora usa `console.error` solo para errores (legítimo) |
| **C5** | Seed imprime contraseña en stdout | ✅ **CORREGIDO** | Solo log via `logger.debug` con mensaje, NO imprime el password |
| **C6** | `JWT_REFRESH_SECRET` fallback a `JWT_SECRET` | ✅ **CORREGIDO** | `env.ts` ahora rechaza empty string con `.trim()` + `||` |

### 🔴 ALTOS

| ID | Hallazgo | Estado Actual | Detalle |
|----|----------|---------------|---------|
| **H1** | `.env` con credenciales existe en disco | ❌ **Sigue vigente** | `backend/.env` existe con credenciales dev (gitignorado) |
| **H2** | CORS producción fallback a localhost | ✅ **CORREGIDO** | Ahora lanza error si `CORS_ORIGIN` no está configurado en producción |
| **H3** | `rejectUnauthorized: false` en SSL PostgreSQL | ✅ **CORREGIDO** | Ahora usa `DB_SSL_REJECT_UNAUTHORIZED` (default `true`) configurable vía env var |
| **H4** | CSRF cookie `httpOnly: false` | ✅ **CORREGIDO** | Ahora es `httpOnly: true` en `csrf.ts:8` |
| **H5** | Sin refresh token en mobile | ✅ **CORREGIDO** | `mobile/src/services/api.ts:54-76` implementa `tryRefresh()` |
| **H6** | Sin error boundaries en web | ✅ **CORREGIDO** | Existen 9 archivos `error.tsx` en todas las rutas |
| **H7** | Sin middleware de protección de rutas server-side | ✅ **CORREGIDO** | `web/src/middleware.ts` protege `/dashboard/*` |

### 🟡 MEDIOS

| ID | Hallazgo | Estado Actual | Detalle |
|----|----------|---------------|---------|
| **M1** | TypeScript 6.0 pre-release en mobile | ✅ **CORREGIDO** | Ahora `typescript@~5.7.3` en `mobile/package.json:38` |
| **M2** | Tokens de shared/ duplicados en web y mobile | ✅ **CORREGIDO** | `KpiResponse` y `CompanySettings` migrados a `shared/types/api.ts`, web los importa |
| **M3** | Sin pool error handler PostgreSQL | ✅ **CORREGIDO** | `pool.on("error", ...)` en `db/index.ts:15-17` |
| **M4** | Botones sin handler | ✅ **CORREGIDO** | Todos los botones críticos tienen handlers funcionales |
| **M5** | Inline styles inconsistente | 🟡 **PARCIAL** | Estáticos migrados a Tailwind; dinámicos (colores/datos/%) no migrables por diseño |
| **M6** | Relative path import de shared/ desde mobile | ✅ **CORREGIDO** | Usa `@hub/shared` como dependencia file: |
| **M7** | `dist/` desactualizado del source | ✅ **CORREGIDO** | `dist/` ya no está en el repo |
| **M8** | Hardcoded email domain | ✅ **CORREGIDO** | Controladores ahora usan `env.EMAIL_DOMAIN` en vez de `process.env` directo |

### ⚪ BAJOS / INFO

| ID | Hallazgo | Estado Actual | Detalle |
|----|----------|---------------|---------|
| **L1** | `console.error` como raw catch handler | ✅ **CORREGIDO** | Reemplazado por `logger.error()` estructurado en web y mobile |
| **L2** | Placeholders `XXXXXXXXXXXX` en Settings | ✅ **CORREGIDO** | Settings ahora usa localStorage con defaults funcionales |
| **L3** | `data as T` sin validación runtime en api.ts | ✅ **CORREGIDO** | Web: warning en dev si falta schema; Mobile: validación null/object antes del cast |
| **L4** | Readme desactualizados | ✅ **CORREGIDO** | Los READMEs están actualizados con stack, endpoints y scripts |
| **L5** | Nombres de columna mezclan español/inglés | ❌ **Sigue vigente** | `contrasena` vs `created_at`, `ultima_actividad` vs `token_version` |
| **L6** | Morgan logging en desarrollo (info) | ❌ **Sigue vigente** | Por diseño — no hay logging HTTP en producción |
| **L7** | Helmet CSP deshabilitado en desarrollo (info) | ❌ **Sigue vigente** | Por diseño — necesario para dev con hot reload |
| **L8** | Sin request ID tracking | ✅ **CORREGIDO** | `requestId.ts` middleware genera UUID, expone en header y error responses |

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

| ID Previo | Descripción | Estado actual (2026-06-27) | Referencia nuestra |
|-----------|-------------|-------------------------------|-------------------|
| audit-report #1 | Comentarios sin verificación de propietario | ✅ **CORREGIDO** — `addComment` verifica propiedad del ticket (`incidents.controller.ts:254`) | — |
| audit-report #2 | Stats sin adminOnly | ✅ **CORREGIDO** | — |
| audit-report #3 | JWT en cookie JS-accessible | ✅ **CORREGIDO** — Cookie `httpOnly: true`, CSRF token es el único accesible desde JS | H4 (fixed) |
| audit-report #4 | Auto-creación de usuarios | ✅ **CORREGIDO** — `createIncident` usa `req.user!.userId` sin crear usuarios | — |
| audit-report #5 | Secrets en docker-compose | 🟡 **Mitigado** — `backend/.env` existe con credenciales dev (gitignorado) | H1 |
| audit-report #6 | Falta validación UUID | ✅ **CORREGIDO** | — |
| AUDIT.md H1 | console.log filtrando data | ✅ **CORREGIDO** — Ahora `console.error` legítimo | C4 (fixed) |
| AUDIT.md H2 | Seed imprime password | ✅ **CORREGIDO** — Solo log vía `logger.debug` sin password | C5 (fixed) |
| AUDIT.md H3 | JWT_REFRESH_SECRET no en .env.example | ✅ **CORREGIDO** — `.env.example` incluye `JWT_REFRESH_SECRET` | C6 (fixed) |
| AUDIT.md H4 | Mobile sin refresh token | ✅ **CORREGIDO** — `tryRefresh()` implementado | H5 (fixed) |
| AUDIT.md H5 | Shared types duplicados | 🟡 **Parcial** — Web usa `@hub/shared` pero aún define interfaces locales | M2 |
| AUDIT.md M1 | rejectUnauthorized: false | ✅ **CORREGIDO** — Configurable vía `DB_SSL_REJECT_UNAUTHORIZED` | H3 (fixed) |
| AUDIT.md M2 | Placeholders XXXXXXXXXXXX | ✅ **CORREGIDO** — Settings funcional con localStorage | L2 (fixed) |
| AUDIT.md M3 | Botones sin handler | ✅ **CORREGIDO** — Todos los botones tienen handlers | M4 (fixed) |
| AUDIT.md L1 | 0 tests | ❌ **Sigue vigente** | C1 |
| AUDIT.md L2 | console.error raw handler | ❌ **Sigue vigente** | L1 |

---

## 7. RECOMENDACIONES PRIORIZADAS

> Basado en verificación 2026-06-30. Tachados los items ya resueltos.

### 🚨 Inmediato (1-2 días)

1. ~~**Eliminar `console.log` de UserManagement.tsx**~~ ✅ **CORREGIDO**
2. ~~**Configurar `JWT_REFRESH_SECRET` en `.env.example` y producción**~~ ✅ **CORREGIDO**
3. ~~**Agregar `error.tsx`** en todas las rutas de web~~ ✅ **CORREGIDO**
4. ~~**Agregar middleware server-side** de auth en Next.js~~ ✅ **CORREGIDO**
5. ~~**Mover API URL de producción a env var**~~ ✅ **CORREGIDO**
6. ~~**Reconstruir `dist/` del backend**~~ ✅ **CORREGIDO**
7. **Agregar suite de tests** (C1)
8. **Eliminar IP hardcodeada en sistemas externos** — `external-systems/page.tsx` fallback a `192.168.60.66:8100`
9. **Rate limiting y auth middleware en `logout`** — Ruta `/logout` no tiene rate limiter ni authMiddleware

### 🔴 Corto plazo (1 semana)

10. **Agregar suite de tests** (C1)
11. **Configurar CI/CD** (GitHub Actions con lint + typecheck + tests)
12. ~~**Habilitar ESLint en builds**~~ ✅ **CORREGIDO**
13. ~~**Configurar pool error handler** en PostgreSQL~~ ✅ **CORREGIDO**
14. ~~**Reemplazar `console.error` con structured logging robusto**~~ (pino/winston) ✅ **CORREGIDO**
15. ~~**Configurar TypeScript versión stable en mobile**~~ ✅ **CORREGIDO**
16. **Implementar notificaciones push listeners** — `setupNotificationListeners()` nunca es llamado
17. **Documentar `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL` en `.env.example`**

### 🟡 Mediano plazo (2-4 semanas)

18. ~~**Implementar refresh token en mobile**~~ ✅ **CORREGIDO**
19. **Migrar shared/ como workspace dependency** oficial (M2)
20. ~~**Verificar propiedad en `addComment`**~~ ✅ **CORREGIDO**
21. ~~**Eliminar auto-creación de usuarios en `createIncident`**~~ ✅ **CORREGIDO**
22. **Unificar estilos** (Tailwind classes en vez de inline styles) (M5)
23. ~~**Eliminar placeholders y conectar botones**~~ ✅ **CORREGIDO**
24. **Agregar validación de transiciones de estado en incidentes**
25. **Agregar paginación en `exportIncidents`**
26. **Sincronizar Settings con servidor** (actualmente solo localStorage)

### ⚪ Largo plazo

27. **Agregar monitoreo y alertas**
28. **Implementar rate limiting por usuario**
29. **Auditar y rotar secretos periódicamente**
30. **Agregar HTTPS enforcement**
31. **Migrar nombres de columna a un solo idioma**
32. **Agregar offline support en mobile**

---

## 8. ESTADÍSTICAS FINALES

| Métrica | Valor |
|---------|-------|
| Archivos .ts/.tsx | ~100 |
| Líneas de código | ~9,000 |
| Paquetes | 4 (backend, web, mobile, shared) |
| Componentes React | 18 web + 15 mobile = 33 |
| Rutas API | 16 REST + 1 health |
| Tests | 0 |
| Commits en v2 | ~28 |
| Vulnerabilidades npm | 0 |
| Hallazgos originales | 7C + 7H + 8M + 8L = 30 |
| **Resueltos** | **6C + 6H + 6M + 5L = 23** |
| **Parciales** | **0C + 0H + 1M + 0L = 1** |
| **Siguen vigentes** | **1C + 1H + 1M + 3L = 6** |
| Issues previos pendientes | 2 de 16 |
