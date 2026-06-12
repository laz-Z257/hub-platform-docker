# Changelog

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
| Web | Vercel | `https://web-a-74c5ba6d.vercel.app` |
| Mobile | Expo (APK) | Build más reciente: https://expo.dev/accounts/laz65585/projects/hub-ai-assistant/builds/4c260990-eb8e-4bce-a9f4-d2ca5b8c5053 |

---

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

### Web Dashboard

| Cambio | Archivos | Detalle |
|---|---|---|
| **Botón Reset Password en tabla usuarios** | `UsersTable.tsx`, `users/page.tsx` | Nuevo botón "Reset" (naranja) en acciones de cada usuario |
| **Modal ResetPasswordModal** | `ResetPasswordModal.tsx` | Modal con campo de nueva contraseña + confirmación. Al guardar, desbloquea al usuario |
| **Menú de 3 puntitos** | `UsersTable.tsx` | Reemplazados los 3 botones (Editar, Reset, Bloquear) por un menú desplegable con icono `⋮` |
| **Ordenar usuarios por última actividad** | `UserManagement.tsx` | Los 5 usuarios mostrados en el dashboard principal se ordenan por `ultima_actividad` descendente |
| **Eliminada barra de búsqueda del Topbar** | `Topbar.tsx` | Eliminado completamente el input de búsqueda superior ("Buscar en el sistema...") y su lógica de placeholders por ruta |
| **Exportación Excel mejorada** | `AnalyticsFilters.tsx` | Nuevo endpoint `/incidents/export`. Excel con 2 hojas: **Dashboard** (KPIs, estadísticas del período, evolución diaria con netos+acumulado, distribución urgencia, estado, agentes) y **Detalle** (todos los incidentes con campos clave) |
| **Eliminado filtro de prioridad en tickets** | `TicketFilters.tsx`, `tickets/page.tsx` | Eliminado el `<select>` de "Prioridad: Todas" y toda su lógica de estado/fetch |

### Mobile App

| Cambio | Archivos | Detalle |
|---|---|---|
| **Autocompletar formulario de reporte** | `ReportScreen.tsx` | `nombre` y `documento` se llenan desde `useAuth().user`. `teléfono` se obtiene del último incidente del usuario via `GET /incidents?limit=1` |
| **Eliminado selector de urgencia** | `ReportScreen.tsx`, ~~`UrgencySelector.tsx`~~ | Eliminado componente `UrgencySelector`, constante `URGENCY_OPTIONS`, estado `urgencia`, y campo del POST. El backend usa default `"media"` |
| **Build APK** | — | APK generado via EAS Build (preview). URL: https://expo.dev/accounts/laz65585/projects/hub-ai-assistant/builds/154a6bb8-5bc5-45b1-8580-01357ca21396 |

### Deploy

| App | Plataforma | URL |
|---|---|---|
| Backend | Render | `https://hub-platform-api.onrender.com` |
| Web | Vercel | `https://web-a-74c5ba6d.vercel.app` |
| Mobile | Expo (APK) | En cola de build |

---

## Histórico anterior

Ver [README.md](./README.md) para cambios anteriores al 2026-06-12.
