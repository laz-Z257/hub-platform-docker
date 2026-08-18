# 🔧 FIXES PENDIENTES

Última actualización: 2026-08-15 (post-auditoría completa)

## ✅ RESUELTOS (2026-08-15, verificados)

### Primera ronda (FIXES-PENDIENTES original)

- **#1 Middleware JWT (web)** — Firma HS256 verificada con `jose`; ahora fail-closed (sin `JWT_SECRET` rechaza).
- **#2 Settings race condition** — `userEditedRef` evita pisar ediciones locales.
- **#3 getStats memory** — Agregación SQL con GROUP BY.
- **#4 Export limit** — Default 1000, max 2000.
- **#5 Error handling** — `instanceof ZodError` + `err.code === '23505'`.
- **#7 Mobile cache invalidation** — `clearApiCache()` tras mutaciones.
- **#8 Chat ticket lookup** — `LIKE` → `=`.
- **#9, #10** — Ya estaban resueltos (verificados sin cambios).

### Segunda ronda (auditoría completa)

- **Técnico ya no crea usuarios ni resetea passwords** — `superAdminOnly` en `POST /users` y `reset-password`. Verificado con técnico de prueba (403).
- **Desbloquear reinicia `intentos_fallidos`** — toggleUserStatus.
- **Contador de intentos atómico** — `sql\`+1\`` con returning.
- **Rating atribuido al dueño del ticket** — user_id correcto.
- **Notificación de comentario sin 500 tardío** — try/catch post-persistencia.
- **Redirect por scope al expirar sesión** — `/user/*` → `/user/login`.
- **Stale closure del scope en login()** — calculado en el momento de la llamada.
- **Password mínima 6 en web** — consistente con backend/mobile.
- **npm ci en Docker** — lockfiles regenerados (bug npm 10 vs 11), `ci + prune --omit=dev`.
- **Seed en Render** — startCommand ejecuta migrate + seed.
- **EXPO_ACCESS_TOKEN + límites de log** — docker-compose.
- **Script de backup** — `scripts/backup-db.sh` (pg_dump + gzip + retención).

### Tercera ronda (residuales)

- **Cookies de rol → JWT** — El middleware web lee el rol del payload del JWT firmado; cookies de rol sin firmar eliminadas del flujo. **Resuelto sin firmar cookies** (era el fix pendiente "requiere decisión": resultó más simple leer el rol del JWT ya verificado).
- **Mobile sin conexión no desloguea** — Solo limpia sesión ante errores de auth.
- **Rating sin ticket equivocado** — Requiere `#TK` en el mensaje.
- **Push unregister en logout** — `POST /api/push/unregister` + integración mobile.
- **sharp pineado** a 0.35.3.
- **no-new-privileges** en api y web.
- **Banner usuarios >200** en dashboard.

## 🔴 PENDIENTES — Requieren decisión de diseño (pueden cambiar comportamiento)

- **CSP unsafe-inline** — `backend/src/index.ts` styleSrc + `mobile/nginx.conf`. Requiere auditar estilos inline del frontend.
- **Logout global vs aislado** — El bump de `token_version` en logout mata TODAS las sesiones del usuario (dashboard+mobile). Decidir semántica real; fix requiere scope en el payload del JWT.
- **Rotación de refresh tokens** — Sin `jti` ni detección de reuso; un refresh robado vive 7 días. Requiere tabla de sesiones o JWT con tiempos más cortos.
- **Rating por contrato** — La detección de "resuelto" sigue parseando texto del bot (ahora con guard: si no hay `#TK` no califica). Fix completo: `ticketId` en `suggestedActions` (cambia contrato API).
- **Host header allowlist** — `index.ts` redirect HTTPS usa `req.headers.host` sin validar. Requiere conocer los dominios finales de producción.

## 🟡 PENDIENTES — Mejoras no urgentes

- **Paginación server-side de usuarios** — El banner avisa, pero la solución real es paginar en el servidor (el backend ya soporta page/limit).
- **`getRatingStats` sin paginar** — Carga todas las ratings en memoria (endpoint admin). Cambia el contrato de respuesta usado por el frontend.
- **Hardening extra de contenedores** — `cap_drop: [ALL]`, `read_only` + tmpfs (requiere probar cada servicio).

## 🟢 OPERATIVOS (fuera del código)

- **Cron de backup** — `scripts/backup-db.sh` existe pero nadie lo ejecuta. Agregar al cron del host: `0 3 * * * cd /ruta && ./scripts/backup-db.sh`.
- **Rotar secrets locales** — `.env` local usa `SEED_ADMIN_PASSWORD=admin123` (débil). Si ese entorno fue accesible, rotar todos los secrets. Permisos de `.env*` a `600`.
- **Commitear** — ~30 archivos modificados sin commit (tres rondas de fixes).

## Refutado durante auditoría (no es problema)

- PWA móvil en Docker funciona: el bundle tiene `/api` inline correctamente (los patrones de `.dockerignore` sin `**` solo aplican a la raíz del contexto, `mobile/.env` sí entra al build).
- La imagen del API NO contiene secrets (`/app` sin `.env`).
