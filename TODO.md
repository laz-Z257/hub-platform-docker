# Tareas Pendientes — hub-platform

> Basado en verificación 2026-06-27. Se revisó cada hallazgo contra el código actual.

---

## 🔴 Críticas

| # | Tarea | Componente | Detalle | Estado |
|---|-------|-----------|---------|--------|
| 1 | ~~Agregar suite de tests~~ | ~~Todo el repo~~ | ~~Requiere planificación dedicada~~ | ✅ **CORREGIDO** (128 tests: 105 backend + 23 web) |
| 2 | ~~Configurar CI/CD~~ | ~~Todo el repo~~ | ~~Requiere planificación dedicada~~ | ⏸️ **Pospuesto** |
| 3 | ~~Eliminar `console.log` que expone data de API~~ | ~~`web/src/components/UserManagement.tsx`~~ | ~~Filtra respuesta cruda de API en consola~~ | ✅ **CORREGIDO** |
| 4 | ~~Sacar seed password de stdout~~ | ~~`backend/src/db/seed.ts`~~ | ~~La contraseña se imprime en logs~~ | ✅ **CORREGIDO** |
| 5 | Separar `JWT_REFRESH_SECRET` de `JWT_SECRET` | `backend/src/lib/jwt.ts` y `env.ts` | Validación de empty string con `.trim()` | ✅ **CORREGIDO** |
| 6 | ~~Eliminar auto-creación de usuarios en `createIncident`~~ | ~~`backend/src/modules/incidents/`~~ | ~~Usuarios se crean automáticamente~~ | ✅ **CORREGIDO** |
| 7 | ~~Configurar `rejectUnauthorized` en SSL de PostgreSQL~~ | ~~`backend/src/db/index.ts`~~ | ~~Acepta cualquier certificado~~ | ✅ **CORREGIDO** |
| 8 | Eliminar IP interna hardcodeada | `web/src/app/dashboard/external-systems/page.tsx` | ~~Fallback eliminado, usa solo env var~~ | ✅ **CORREGIDO** |
| 9 | Rate limiting + auth en endpoint `logout` | `backend/src/modules/auth/auth.routes.ts` | ~~authMiddleware + rate limit agregados~~ | ✅ **CORREGIDO** |

## 🟡 Altas

| # | Tarea | Componente | Detalle | Estado |
|---|-------|-----------|---------|--------|
| 10 | ~~Agregar error boundaries web (`error.tsx`)~~ | ~~`web/src/app/`~~ | ~~Pantalla blanca en crash~~ | ✅ **CORREGIDO** |
| 11 | ~~Implementar refresh token en mobile~~ | ~~`mobile/src/services/api.ts`~~ | ~~Al recibir 401 solo limpia token~~ | ✅ **CORREGIDO** |
| 12 | ~~Reconstruir `dist/` del backend~~ | ~~`backend/dist/`~~ | ~~Código desactualizado~~ | ✅ **CORREGIDO** |
| 13 | Structured logging | `backend/src/` | Logger JSON estructurado ya implementado | ✅ **CORREGIDO** |
| 14 | ~~Degradar TypeScript a versión stable en mobile~~ | ~~`mobile/package.json`~~ | ~~Usa `typescript@~6.0.3`~~ | ✅ **CORREGIDO** |
| 15 | ~~Configurar pool error handler en PostgreSQL~~ | ~~`backend/src/db/index.ts`~~ | ~~Pool crash silencioso~~ | ✅ **CORREGIDO** |
| 16 | Migrar shared/ como workspace dependency | `web/`, `mobile/` | `KpiResponse` + `CompanySettings` migrados a `shared/types/api.ts` | ✅ **CORREGIDO** |
| 17 | ~~Verificar propiedad en `addComment`~~ | ~~`backend/src/modules/incidents/`~~ | ~~Comentarios sin verificar propietario~~ | ✅ **CORREGIDO** |
| 18 | Validación transiciones de estado en incidentes | `backend/src/modules/incidents/` | ~~Transiciones inválidas ahora rechazadas~~ | ✅ **CORREGIDO** |
| 19 | ~~Rate limiting en endpoint `logout`~~ | ~~`backend/src/modules/auth/auth.routes.ts`~~ | ~~(Movido a #9)~~ | ✅ Duplicado -> #9 |

## 🟡 Medias

| # | Tarea | Componente | Detalle | Estado |
|---|-------|-----------|---------|--------|
| 20 | ~~Conectar botones sin handler~~ | ~~`web/src/components/Topbar.tsx`~~ | ~~Componentes no funcionales~~ | ✅ **CORREGIDO** |
| 21 | ~~Eliminar placeholders `XXXXXXXXXXXX`~~ | ~~`web/src/app/dashboard/settings/page.tsx`~~ | ~~Settings no persistidos~~ | ✅ **CORREGIDO** |
| 22 | Unificar estilos (Tailwind + inline) | `web/src/components/` | Estáticos migrados a Tailwind; dinámicos no migrables | ✅ **RESUELTO** |
| 23 | Paginación en `exportIncidents` | `backend/src/modules/incidents/` | ~~limit/offset agregados (default 5000, max 10000)~~ | ✅ **CORREGIDO** |
| 24 | Loading states en dashboard | `web/src/app/dashboard/` | ~~Skeleton loading + error state agregados~~ | ✅ **CORREGIDO** |
| 25 | Sincronizar Settings con servidor | `web/src/app/dashboard/settings/` | ~~Endpoint `/api/settings` creado + web sincroniza~~ | ✅ **CORREGIDO** |
| 26 | Validación formulario create-ticket | `web/src/app/dashboard/tickets/` | ~~Validación con errores inline~~ | ✅ **CORREGIDO** |

## ⚪ Bajas

| # | Tarea | Componente | Detalle | Estado |
|---|-------|-----------|---------|--------|
| 27 | ~~Actualizar READMEs secundarios~~ | ~~`backend/README.md`, `web/README.md`, `mobile/README.md`~~ | ~~Dicen "no implementado"~~ | ✅ **CORREGIDO** |
| 28 | Unificar nombres de columna (español/inglés) | `backend/src/db/schema.ts` | Mezcla `contrasena` con `created_at` | ❌ **Cancelado** (breaking change) |
| 29 | HTTPS enforcement | `backend/src/index.ts` | ~~Middleware de redirección agreagado~~ | ✅ **CORREGIDO** |
| 30 | Agregar monitoreo y alertas | Todo el proyecto | ~~Health endpoint + métricas detalladas~~ | ✅ **CORREGIDO** |
| 31 | ~~Agregar request ID tracking visible~~ | ~~`backend/src/`~~ | ~~IDs generados pero no expuestos~~ | ✅ **CORREGIDO** |
| 32 | Agregar offline support en mobile | `mobile/` | ~~Banner offline + cache de respuestas GET~~ | ✅ **CORREGIDO** |
| 33 | `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL` a `.env.example` | Root | ~~Variable documentada~~ | ✅ **CORREGIDO** |
| 34 | Notificaciones push listeners en mobile | `mobile/src/services/notifications.ts` | ~~`setupNotificationListeners()` conectado en AuthContext~~ | ✅ **CORREGIDO** |
| 35 | Web-safe SafeAreaProvider + reanimated plugin | `mobile/` | ~~removeChild patch + babel plugin~~ | ✅ **CORREGIDO** |

---

## ✅ Resuelto (commits entre 2026-06-17 y 2026-06-27)

| # | Tarea | Commit/s |
|---|-------|----------|
| C2–C6, H2–H7, M1–M7, L2–L8 | Varios fixes previos | `3f4dbdf`, `819d660`, `6b1ffb1`, `937c62e` |
| H1, L1, L3, L6, L7, M5 | Logo centrado/transparencia, Tailwind, logger, Morgan, Helmet, gitignore | `074d0ad` |
| #5, #8, #9, #13, #16, #18, #22–#26, #29, #33, #34, #35 | Batch fixes sesión 2026-06-27 | `074d0ad` |
| #30, #32 | Monitoreo + Offline support mobile | `074d0ad` |
| C6, M2, M5, M8, L1, L3 | auditoría: JWT empty string, EMAIL_DOMAIN, shared types, inline styles, console.error, as T | `working tree` (sin commitear) |

---

## 🧹 Limpieza completa del proyecto (2026-07-02)

Se realizó una revisión exhaustiva del código y se eliminaron/corrigieron los siguientes problemas:

### Archivos eliminados
- `suger` (archivo basura de 1 byte)
- `web/vercel.json` (redundante, proyecto usa Docker)
- `web/public/.gitkeep` (directorio público vacío)
- `web/src/types/` (directorio vacío)
- `mobile/.claude/` (config de herramienta específica)
- Directorios generados: `backend/dist/`, `mobile/android/`, `mobile/.expo/`, `mobile/output/`, `web/.next/`, `web/tsconfig.tsbuildinfo`

### Código muerto eliminado
- Import sin usar: `z` en `web/src/lib/logger.test.ts`
- Import sin usar: `TICKET_STATUS_BADGES` en `web/src/components/TicketTable.tsx`
- Export sin usar: `TICKET_STATUS_BADGES` en `web/src/lib/styles.ts`
- Función sin usar: `toggleTheme` en `web/src/contexts/ThemeContext.tsx`
- State sin usar: `cleared` en `web/src/app/dashboard/settings/page.tsx`
- Import sin usar: `Alert` en `mobile/app/historial.tsx`
- Imports de `React` innecesarios en 8 componentes mobile
- Función sin usar: `clearCache()` en `mobile/src/services/storage.ts`
- Función sin usar: `getToken()` en `mobile/src/services/api.ts`
- Método sin usar: `api.patch()` en `mobile/src/services/api.ts`
- Parámetro sin usar: `text` en `getDefaultResponse()` en `backend/src/modules/chat/chat.controller.ts`
- Variable mal nombrada: `_req` renombrado a `req` en `backend/src/index.ts`

### Dependencias eliminadas
- `@types/uuid` en backend (se usa `crypto.randomUUID()` nativo)
- `expo-module-scripts` en mobile (ningún script la usa)

### Bugs críticos corregidos
- **Settings route/controller mismatch**: Schema de ruta ahora usa `nombre`, `contribuyente`, `direccion` (alineado con controller y DB)
- **migrate.ts código muerto**: Eliminadas sentencias ALTER TABLE que creaban columnas con nombres incorrectos en inglés
- **Migración 0008 duplicada**: Corregida para no duplicar contenido de 0006 y 0007
- **CHANGELOG.md duplicado**: Eliminada sección duplicada (líneas 179-218)

### Estado final
- ✅ 128 tests pasando (105 backend + 23 web)
- ✅ TypeScript compila sin errores
- ✅ ESLint sin warnings ni errores
- ✅ Proyecto limpio y funcional
