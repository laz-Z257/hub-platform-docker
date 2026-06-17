# Changelog

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
| Web | Vercel | Campana, ayuda, columna bloqueado por, calificaciones |
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
| Web | Vercel | Auto-deploy desde main |
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
