# 🔧 FIXES PENDIENTES

Última actualización: 2026-08-19

## ✅ RESUELTOS (2026-08-19)

- **Rotación de refresh tokens** — Nueva tabla `refresh_tokens` (migración 0018): cada refresh emitido se persiste con `jti` + hash sha256. `POST /auth/refresh` rota de forma atómica (`UPDATE ... WHERE revoked_at IS NULL`); si un JWT válido presenta una fila ya revocada → reuso detectado (robo) y se revocan TODAS las sesiones del usuario + bump de `token_version` global. Higiene: limpieza de filas expiradas en cada rotación.
- **Logout aislado real** — Columnas `token_version_admin` / `token_version_user` en `users`. El JWT lleva `scope` + `scopeVersion`; el logout bumpea SOLO la versión del scope y revoca las filas de refresh de ese scope. Cerrar sesión en mobile ya no mata el dashboard (y viceversa). Los bumps globales (bloqueo, reset password, cambio de rol) siguen matando ambos scopes.
- **Rating con `ticketId` estructurado** — Columna `metadata` jsonb en `messages`: la notificación de "Resuelto" y las respuestas sobre tickets guardan `{ ticketId }`. `POST /chat/message` devuelve `ticketId` y `GET /chat/history` expone `metadata`. Web y mobile usan `ticketId` directo; el parseo `#TK` queda como fallback solo para mensajes antiguos.
- **Paginación server-side de usuarios (web)** — `dashboard/users` ahora pagina en el servidor (`page`/`limit`/`search`) con búsqueda debounced. Nuevo campo `counts` en `GET /users` (distribución por rol sin filtros) para las tarjetas de resumen. El banner de ">200 usuarios" se eliminó por innecesario.
- **Registro con documento soft-deleted (bug preexistente)** — El check de duplicados filtraba `deleted_at` pero el unique constraint de la BD es global → 500. Ahora devuelve 409.

## ✅ RESUELTOS (rondas anteriores, verificados)

- Middleware JWT web fail-closed, settings race condition, getStats en SQL, export limit, error handling Zod/23505, cache invalidation mobile, chat ticket lookup `=`.
- Técnico no crea usuarios ni resetea passwords; desbloquear reinicia intentos; contador atómico; rating al dueño del ticket; notificación sin 500 tardío; redirects por scope; stale closure; password mínima; npm ci; seed en Render; EXPO token y logs; script de backup.
- Rol desde JWT firmado (sin cookies de rol); mobile sin conexión no desloguea; rating requiere `#TK`; push unregister en logout; sharp pineado; no-new-privileges.
- Host header allowlist (`ALLOWED_HOSTS`), anti-enumeración login, bcrypt 12, índice `users.documento`, escalación de privilegios cerrada, métricas acotadas, auto-unlock.

## 🔴 PENDIENTES — Requieren decisión de diseño

- **CSP unsafe-inline** — `backend/src/index.ts` styleSrc + `mobile/nginx.conf` (script-src y style-src). Requiere auditar estilos inline del frontend y verificar visualmente; riesgo de romper la UI.

## 🟡 PENDIENTES — Mejoras no urgentes

- **Hardening extra de contenedores** — `cap_drop: [ALL]`, `read_only` + tmpfs en `docker-compose.yml` (requiere probar cada servicio; postgres usa gosu y nginx necesita setuid, quedan excluidos a propósito).

## 🟢 OPERATIVOS (fuera del código)

- **Cron de backup** — `scripts/backup-db.sh` existe pero nadie lo ejecuta. Agregar al cron del host: `0 3 * * * cd /ruta && ./scripts/backup-db.sh`.
- **Rotar secrets locales** — `.env` local usa `SEED_ADMIN_PASSWORD` débil. Si ese entorno fue accesible, rotar todos los secrets. Permisos de `.env*` ya en `600`.
- **Commitear** — Cambios de esta ronda sin commit.

## Refutado durante auditoría (no es problema)

- PWA móvil en Docker: ~~"el bundle tiene `/api` inline"~~ **REFUTACIÓN INCORRECTA** — `**/.env` del `.dockerignore` raíz SÍ excluye `mobile/.env` del contexto de build (verificado con build de prueba), por lo que el bundle se generaba sin la variable y fallaba en runtime. Corregido (2026-08-20): `Dockerfile.web` recibe `EXPO_PUBLIC_API_URL` como build arg (default `/api`), igual que hace `web` con `NEXT_PUBLIC_*`.
- La imagen del API NO contiene secrets (`/app` sin `.env`).
