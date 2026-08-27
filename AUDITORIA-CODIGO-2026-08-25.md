# Auditoría de Código — 2026-08-25

## 🔴 CRÍTICOS (arreglar urgente)

| # | Archivo:Línea | Problema | Fix |
|---|---------------|----------|-----|
| 1 | `backend/src/modules/users/users.controller.ts:218` | Un `tecnico` puede resetear la contraseña de un `admin` — falta `superAdminOnly` | Cambiar guard a `superAdminOnly` para targets admin |
| 2 | `backend/src/modules/users/users.controller.ts:260` | Un `tecnico` puede modificar cuentas de `admin` — falta `superAdminOnly` | Cambiar guard a `superAdminOnly` para targets admin |
| 3 | `backend/src/modules/upload/upload.controller.ts:45` | Extensión del archivo viene del nombre del usuario (`originalname`), no de los magic bytes — un `.php` con bytes JPEG pasaría | Derivar extensión desde magic bytes validados |
| 4 | `mobile/app/historial.tsx:85-88` | `loadMore` llama `fetchIncidents(page + 1)` pero nunca hace `setPage()` — la paginación se queda en página 1 siempre | Agregar `setPage(targetPage)` dentro del `.then()` |
| 5 | `scripts/gc-uploads.sh:56` | `grep -qx` con heredoc puede fallar si hay saltos de línea corruptos en la BD | Cambiar a `grep -qxF` (fixed-string) |

## 🟡 MEDIOS (mejorar)

| # | Archivo:Línea | Problema | Fix |
|---|---------------|----------|-----|
| 6 | `backend/src/modules/auth/auth.controller.ts:177` | Mensaje de bloqueo muestra la hora exacta del servidor — fuga de información | Usar mensaje genérico sin hora |
| 7 | `backend/src/modules/chat/chat.controller.ts:338` | Sin validación de longitud en mensajes del chat — usuario puede enviar texto infinito | Agregar `z.string().max(10000)` en schema |
| 8 | `backend/src/modules/upload/upload.controller.ts:36` | TOCTOU en `getDirSize` — dos uploads concurrentes pueden pasarse del límite de 500MB | Usar lock o reservación atómica |
| 9 | `web/src/lib/api.ts:6-9` | Variables de módulo (`csrfToken`, `currentScope`) compartidas entre requests en SSR — fuga entre usuarios | Mover a request-scoped storage |
| 10 | `web/src/components/ResetPasswordModal.tsx:29` | Error dice "Mínimo 8 caracteres" pero valida `< 6` — inconsistente | Unificar mensaje y validación |
| 11 | `web/src/components/SettingsMantenimientoTab.tsx:15` | `localStorage.clear()` borra todo indiscriminadamente — debería ser selectivo | Borrar solo keys de la app |
| 12 | `mobile/app/ajustes.tsx:317` | Navega a `/` aunque el logout falle — `router.replace` debería estar en el `try` | Mover `router.replace` al bloque `try` |
| 13 | `mobile/nginx.conf:30` | `connect-src 'self' https:` es demasiado permisivo — debería ser solo `'self'` | Cambiar a `connect-src 'self'` |
| 14 | `mobile/src/services/storage.ts:32` | Tokens en `localStorage` (PWA) — vulnerable a XSS | Quedarse solo en memoria (module-level) |
| 15 | `backend/src/modules/dashboard/dashboard.controller.ts:189` | `DATE()` usa UTC pero Colombia es UTC-5 — conteos diarios desalineados cerca de medianoche | Usar conversión a timezone Colombia antes de truncar |
| 16 | `backend/src/index.ts` | Falta HSTS explícito en helmet | Agregar `hsts: { maxAge: 31536000, includeSubDomains: true }` |
| 17 | `scripts/backup-db.sh:33` | `pg_dump` puede exponer credenciales en `ps aux` si se pasa `PGPASSWORD` | Usar Docker secrets o `.pgpass` dentro del contenedor |

## ✅ PASS (sin problemas)

| Área | Detalle |
|------|---------|
| Auth (JWT, bcrypt, refresh rotation, sesiones aisladas) | Token versioning, scope isolation, anti-enumeration |
| CSRF protection | Token en cookie + header, rutas exempt correctas |
| Zod validation | Todos los endpoints tienen schema validado |
| SQL injection | `escapeLike` para búsquedas, parameterized queries |
| Docker security | Multi-stage build, non-root, cap_drop ALL, read_only |
| CSP backend | Sin `unsafe-inline` |
| Error handling backend | Sin stack traces en responses |
| API client web | CSRF header automático, scope derivado del path |
| Nginx mobile | Headers de seguridad completos, rate limiting |
| Offline detection mobile | Threshold de 3 fallos, check en foreground |
| Shared types | Estructura limpia, campos opcionales correctos |
| Scripts (smoke-test, extract-inline) | Sin inyección, quoting correcto |

## Resumen

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Críticos | 5 |
| 🟡 Medios | 12 |
| ✅ Pass | 17+ |

## Top 3 prioridades

1. Cerrar escalation `tecnico → admin` (usuarios controller)
2. Fix paginación mobile historial (`setPage` no se ejecuta)
3. Upload extensiones desde magic bytes, no del nombre
