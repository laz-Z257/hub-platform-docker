# AUDITORÍA RESUMIDA - HALLAZGOS Y SOLUCIONES

## TABLA MAESTRA DE HALLAZGOS

| ID | Severidad | Categoría | Problema | Ubicación | Solución |
|----|-----------|-----------|----------|-----------|----------|
| AUDIT-001 | 🔴 CRÍTICA | Seguridad | Secrets por defecto hardcodeados en .env.example (JWT_SECRET, DB_PASSWORD, admin123) | `.env.example:4-10` | Usar valores placeholder como `CHANGE_IN_PRODUCTION` y generar secretos reales con `openssl rand -hex 32` |
| AUDIT-002 | 🔴 CRÍTICA | Seguridad | Uploads sin límite de almacenamiento ni limpieza automática | `upload.controller.ts:7-11` | Implementar job de limpieza o usar S3/Cloudinary. Agregar límite total de 500MB |
| AUDIT-003 | 🟠 ALTA | Seguridad | Rate limit global (100/min) insuficiente para auth, no hay limitador específico en login/register | `index.ts:83-91` | Agregar `rateLimit({ max: 5, windowMs: 60000 })` en auth.routes.ts para login |
| AUDIT-004 | 🟠 ALTA | Seguridad | Enumera usuarios: `/api/auth/me` retorna 404 si user no existe | `auth.controller.ts:151-153` | Retornar siempre 200 con mensaje genérico "Sesión inválida" antes de consultar DB |
| AUDIT-005 | 🟠 ALTA | Seguridad | Push notifications a exp.host sin autenticación ni validación de tokens | `incidents.controller.ts:242-246` | Usar Expo Push API con API key, validar que recipient sea owner del token |
| AUDIT-006 | 🟠 ALTA | Seguridad | Seed resetea password del admin cada vez que se inicia si SEED_ADMIN_PASSWORD está definida | `seed.ts:50-57` | Solo crear admin si no existe, nunca actualizar password existente |
| AUDIT-007 | 🟠 ALTA | Seguridad | Rol "asesor" tiene permisos inconsistentes, posible acceso elevado | `incidents.routes.ts:42-50` | Revisar y documentar RBAC, el middleware adminOnly debe validar roles exactos |
| AUDIT-008 | 🟡 MEDIA | Seguridad | Puntuación de ratings no valida rango (1-5), acepta cualquier número | `ratings.controller.ts:10` | Agregar `if (puntuacion < 1 || puntuacion > 5) return 400` |
| AUDIT-009 | 🟡 MEDIA | Seguridad | Búsqueda UUID concatena patrones sin validar longitud máxima | `incidents.controller.ts:62-69` | Limitar `search` a 50 chars, limitar resultados a 100 |
| AUDIT-010 | 🟡 MEDIA | Seguridad | Descripción permite HTML sin sanitizar, riesgo XSS | `incidents.controller.ts:48` | Usar `sanitize-html` o asegurar que frontend escape todo |
| AUDIT-011 | 🟠 ALTA | Código | Auth middleware usa `.then()` en vez de async/await, difícil de mantener | `middlewares/auth.ts:44-64` | Refactorizar a: `const [user] = await db.select(...).where(...).limit(1);` |
| AUDIT-012 | 🟠 ALTA | Código | Logout no espera actualización de token_version, puede dar acceso breve con token antiguo | `auth.controller.ts:214-220` | Hacer `await db.update(...).execute()` y esperar confirmación |
| AUDIT-013 | 🟡 MEDIA | Código | Uso de `unknown` y casting sin validación en mobile API service | `mobile/src/services/api.ts:171` | Crear interfaces TypeScript para cada respuesta de endpoint |
| AUDIT-014 | 🟡 MEDIA | Código | verifyToken castea a JwtPayload sin validar campos obligatorios | `middlewares/auth.ts:41` | Validar que `payload.userId && payload.rol` existan antes de asignar |
| AUDIT-015 | 🟡 MEDIA | Arquitectura | Pool de PostgreSQL sin configuración (max, timeouts) | `db/index.ts` | Configurar: `max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000` |
| AUDIT-016 | 🟡 MEDIA | Código | Schemas Zod no validan casos edge (negativos, vacíos) | Múltiples `*.schema.ts` | Revisar cada schema, agregar `.min(1).max()` para strings, `.positive()` para números |
| AUDIT-017 | 🟡 MEDIA | Código | Error handler global trata Zod errors como 500 | `index.ts:134-147` | Agregar `if (err instanceof ZodError) return res.status(400).json(...)` |
| AUDIT-018 | 🟡 MEDIA | Código | Chat history permite limit arbitrario (puede pasar limit=1000000) | `chat.controller.ts:368` | Agregar: `const limit = Math.min(parseInt(req.query.limit) || 50, 200);` |
| AUDIT-019 | 🟢 BAJA | Código | Mezcla de convenciones naming (camelCase vs snake_case) | Múltiples archivos | Estandarizar a camelCase para TS, snake_case para BD |
| AUDIT-020 | 🟢 BAJA | Código | VALID_TRANSITIONS sin JSDoc comment | `incidents.controller.ts:161` | Agregar: `/** Define estados válidos de transición de incidentes */` |
| AUDIT-021 | 🟢 BAJA | Código | Logger no tiene niveles configurables | `lib/logger.ts` | Implementar LOG_LEVEL=debug\|info\|warn\|error |
| AUDIT-022 | 🟡 MEDIA | Performance | Health check hace query a DB en cada request | `index.ts:94-102` | Separar `/api/health` (OK puro) de `/api/health/db` (con DB check), cachear 5s |
| AUDIT-023 | 🟡 MEDIA | API | Chat history no tiene paginación (no hay page/offset) | `chat.controller.ts:363-381` | Agregar `?page=&limit=` con cursor o offset |
| AUDIT-024 | 🟡 MEDIA | UX | Ratings stats no accesible para usuarios normales | `ratings.routes.ts` | Crear `/api/ratings/public/stats` con solo datos agregados |
| AUDIT-025 | 🟢 BAJA | API | Endpoint `/export` retorna JSON, no Excel como sugiere | `incidents.controller.ts:398` | Renombrar a `/export-data` o generar Excel en backend |
| AUDIT-026 | 🟠 ALTA | Performance | Falta índice compuesto para queries `user_id + estado` | `schema.ts:60-65` | Agregar: `index("incidents_user_estado_idx").on(table.user_id, table.estado)` |
| AUDIT-027 | 🟡 MEDIA | BD | Tabla ratings no tiene CHECK constraint para puntuacion 1-5 | `schema.ts:110` | Agregar `CHECK (puntuacion >= 1 AND puntuacion <= 5)` o validar en app (ya se hace) |
| AUDIT-028 | 🟡 MEDIA | BD | Mezcla de NULLs y empty strings en email y telefono | `schema.ts:26,47` | Estandarizar: campos opcionales usar `default("")` en vez de nullable |
| AUDIT-029 | 🟢 BAJA | Arquitectura | No hay soft deletes, DELETE es permanente | `schema.ts` | Considerar agregar `deleted_at timestamp` para auditoría |
| AUDIT-030 | 🟡 MEDIA | UX | No hay error boundary en Next.js | `web/src/app/` | Crear `error.tsx` en app router |
| AUDIT-031 | 🟡 MEDIA | Seguridad | Tokens en localStorage vulnerables a XSS | `web/src/contexts/` | Usar cookies httpOnly (backend ya las soporta) |
| AUDIT-032 | 🟢 BAJA | UX | Algunos componentes sin loading states | Componentes web | Auditor completa de estados de carga |
| AUDIT-033 | 🟡 MEDIA | Seguridad | API_URL tiene fallback hardcodeado a producción | `mobile/src/services/api.ts:14` | Eliminar fallback, exigir `EXPO_PUBLIC_API_URL` configurado |
| AUDIT-034 | 🟡 MEDIA | Seguridad | No hay certificate pinning | `mobile/src/services/api.ts` | Implementar para producción con `expo-ssl-pinning` |
| AUDIT-035 | 🟢 BAJA | Seguridad | Cache guarda datos sensibles en dispositivo | `mobile/src/services/api.ts:205` | No cachear endpoints con datos personales |
| AUDIT-036 | 🟠 ALTA | Docker | Imágenes Docker sin SHA digest, solo tag :alpine | `docker-compose.yml` | Usar `FROM node:22-alpine@sha256:abc123...` |
| AUDIT-037 | 🟡 MEDIA | Docker | Sin resource limits (CPU/memory) en contenedores | `docker-compose.yml` | Agregar `deploy.resources.limits: { cpus: "1", memory: "1G" }` |
| AUDIT-038 | 🟡 MEDIA | Docker | Secrets pasan como environment variables visibles en `docker inspect` | `docker-compose.yml:25-33` | Usar Docker secrets o compose secrets en producción |
| AUDIT-039 | 🟢 BAJA | Docker | Puerto 5432 expuesto al host, conexiones externas posibles | `docker-compose.yml:9-10` | Remover port mapping en producción, usar internal network |
| AUDIT-040 | 🟢 BAJA | Docker | Health check usa usuario hardcodeado `hub_admin` | `docker-compose.yml:13-14` | Usar `${POSTGRES_USER}` variable |
| AUDIT-041 | 🟡 MEDIA | Performance | Export hace mapeo en JS en vez de SQL | `incidents.controller.ts:386-391` | Usar `json_agg` de PostgreSQL para agrupar comentarios |
| AUDIT-042 | 🟡 MEDIA | Performance | getStats carga TODOS los incidentes en memoria para calcular | `incidents.controller.ts:448` | Hacer agregaciones con `GROUP BY` en SQL |
| AUDIT-043 | 🟡 MEDIA | Performance | No hay caching de queries frecuentes (stats, KPIs) | Múltiples endpoints | Implementar Redis para cachear resultados de estadísticas |
| AUDIT-044 | 🟢 BAJA | Performance | Logs de Morgan en producción generan I/O extra | `index.ts:72-78` | Considerar usar log aggregator, desactivar en high-traffic |
| AUDIT-045 | 🟡 MEDIA | Observabilidad | Métricas en JSON, no formato Prometheus | `middlewares/metrics.ts` | Usar `prom-client` para formato Prometheus |
| AUDIT-046 | 🟢 BAJA | Observabilidad | No hay distributed tracing entre servicios | Global | Implementar OpenTelemetry |
| AUDIT-047 | 🟢 INFO | Seguridad | CORS en desarrollo permite `localhost:*` regex | `index.ts:58-63` | Correcto para dev, verificar CORS_ORIGIN en prod |
| AUDIT-048 | 🟢 INFO | Arquitectura | No hay tests de integración | `backend/` | Considerar agregar Vitest tests |
| AUDIT-049 | 🟢 INFO | Seguridad | bcrypt usa 10 salt rounds (estándar) | `auth.controller.ts:40` | Correcto, considerar 12 para producción |
| AUDIT-050 | 🟢 INFO | Seguridad | JWT 1h expiry es razonable | `jwt.ts:19` | Correcto, refresh token 7d es aceptable |

---

## RESUMEN POR SEVERIDAD

### 🔴 CRÍTICAS (2) - Arreglar Inmediatamente

| ID | Problema | Solución Rápida |
|----|----------|-----------------|
| AUDIT-001 | Secrets hardcodeados | `openssl rand -hex 32` para todos los secretos |
| AUDIT-002 | Uploads sin límites | Crear script cleanup o usar S3 |

### 🟠 ALTAS (12) - Arreglar Esta Semana

| ID | Problema | Solución Rápida |
|----|----------|-----------------|
| AUDIT-003 | Rate limit auth | Agregar 5 req/min en login |
| AUDIT-004 | Enum users | Retornar 200 siempre |
| AUDIT-005 | Push sin auth | Usar Expo Push API key |
| AUDIT-006 | Seed resetea pass | Solo crear, no actualizar |
| AUDIT-007 | Permisos asesor | Documentar RBAC |
| AUDIT-011 | Auth .then() | Cambiar a async/await |
| AUDIT-012 | Logout async | Agregar await |
| AUDIT-026 | Falta índice | `index(user_id, estado)` |

### 🟡 MEDIAS (24) - Arreglar Próxima Semana

Principales:
- Validación de ratings (AUDIT-008)
- Tipos TypeScript (AUDIT-013)
- Connection pooling (AUDIT-015)
- Error handling (AUDIT-017)
- Health check separado (AUDIT-022)
- Resource limits Docker (AUDIT-037)
- Cache de stats (AUDIT-043)

### 🟢 BAJAS (17) - Cuando Haya Tiempo

- Naming conventions
- JSDoc comments
- Soft deletes
- Pagination chat

---

## COMANDOS PARA ARREGLAR

```bash
# 1. Generar secretos seguros
openssl rand -hex 32  # Para JWT_SECRET
openssl rand -hex 32  # Para JWT_REFRESH_SECRET
openssl rand -base64 32  # Para POSTGRES_PASSWORD

# 2. Agregar índice compuesto
# En schema.ts agregar:
index("incidents_user_estado_idx").on(table.user_id, table.estado),

# 3. Rate limit auth
# En auth.routes.ts agregar:
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos. Intenta en 1 minuto." }
});

# 4. Validar rating
if (puntuacion < 1 || puntuacion > 5) {
  return res.status(400).json({ error: "Puntuación debe ser 1-5" });
}

# 5. Docker SHA digest
# Cambiar FROM node:22-alpine
# Por FROM node:22-alpine@sha256:HASH_ESPECIFICO
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### Semana 1: Críticos + Altos

- [ ] AUDIT-001: Regenerar secretos
- [ ] AUDIT-002: Límite uploads
- [ ] AUDIT-003: Rate limit login
- [ ] AUDIT-004: Fix enum users
- [ ] AUDIT-005: Push notifications auth
- [ ] AUDIT-006: Fix seed
- [ ] AUDIT-007: Documentar RBAC
- [ ] AUDIT-008: Validar rating
- [ ] AUDIT-011: async/await auth
- [ ] AUDIT-012: await logout
- [ ] AUDIT-026: Agregar índice

### Semana 2: Medias

- [ ] AUDIT-009: Limitar search
- [ ] AUDIT-013: Tipos TypeScript
- [ ] AUDIT-014: Validar token payload
- [ ] AUDIT-015: Connection pooling
- [ ] AUDIT-017: Error handler
- [ ] AUDIT-018: Limitar chat limit
- [ ] AUDIT-022: Separar health checks
- [ ] AUDIT-033: Eliminar fallback API
- [ ] AUDIT-036: SHA Docker images
- [ ] AUDIT-037: Resource limits
- [ ] AUDIT-038: Docker secrets
- [ ] AUDIT-041: SQL aggregation
- [ ] AUDIT-042: SQL GROUP BY stats

### Semana 3+: Bajos

- [ ] AUDIT-019: Naming
- [ ] AUDIT-020: JSDoc
- [ ] AUDIT-021: Log levels
- [ ] AUDIT-023: Pagination chat
- [ ] AUDIT-029: Soft deletes
- [ ] AUDIT-030: Error boundaries
- [ ] AUDIT-043: Redis cache
- [ ] AUDIT-045: Prometheus metrics
- [ ] AUDIT-046: OpenTelemetry

---

*Documento generado: 2026-07-07*
*Total hallazgos: 50*
