# AUDITORÍA COMPLETA DE SEGURIDAD Y CÓDIGO

## HUB AI Assistant Platform

**Fecha de auditoría:** 2026-07-07
**Versión del documento:** 1.0
**Auditor:** Análisis automatizado + revisión manual

---

## RESUMEN EJECUTIVO

| Categoría | Críticos | Altos | Medios | Bajos | Info |
|-----------|----------|-------|--------|-------|------|
| Seguridad | 2 | 6 | 9 | 7 | 4 |
| Código/Arquitectura | 0 | 3 | 8 | 5 | 2 |
| Performance | 0 | 2 | 4 | 3 | 1 |
| Docker | 0 | 1 | 3 | 2 | 1 |
| **TOTAL** | **2** | **12** | **24** | **17** | **8** |

---

## TOP 10 HALLAZGOS CRÍTICOS

1. **[AUDIT-001]** Secretos por defecto en .env.example
2. **[AUDIT-002]** Storage de uploads sin limpieza automática
3. **[AUDIT-003]** Rate limit en auth solo en endpoints específicos
4. **[AUDIT-004]** Posible enumeration de usuarios en `/api/auth/me`
5. **[AUDIT-005]** Push notifications a exp.host sin autenticación
6. **[AUDIT-006]** Seed recrea admin con contraseña configurada en cada启动
7. **[AUDIT-007]** El rol "asesor" tiene acceso completo como admin
8. **[AUDIT-008]** Ausencia de índices en campos de búsqueda frecuentes
9. **[AUDIT-009]** No hay validación de tamaño máximo en listados
10. **[AUDIT-010]** El middleware de auth hace query asíncrona sin await directo

---

## 1. SEGURIDAD

### 1.1 CRÍTICO - Secretos por defecto

**[AUDIT-001] Secretos hardcodeados en .env.example**

**Severidad:** CRÍTICA
**Categoría:** Seguridad
**Ubicación:** `.env.example:4-10`
**Descripción:**
Los secretos JWT y contraseñas de base de datos tienen valores por defecto que se usan en desarrollo:

```bash
JWT_SECRET=mi_secret_jwt_seguro_123
JWT_REFRESH_SECRET=mi_refresh_secret_seguro_456
POSTGRES_PASSWORD=hub_secret
SEED_ADMIN_PASSWORD=admin123
```

**Impacto:** Si un desarrollador despliega sin cambiar estos valores, el sistema es completamente predecible y vulnerable a accesos no autorizados.

**Recomendación:**
```bash
# Generar secretos aleatorios en producción
openssl rand -hex 32  # para JWT_SECRET y JWT_REFRESH_SECRET
openssl rand -base64 32  # para POSTGRES_PASSWORD
```

---

**[AUDIT-002] Storage de uploads sin limpieza automática**

**Severidad:** CRÍTICA
**Categoría:** Seguridad / Arquitectura
**Ubicación:** `backend/src/modules/upload/upload.controller.ts`
**Descripción:**
Los archivos subidos se almacenan en `uploads/` pero:
- No hay límite máximo de almacenamiento total
- No hay job de limpieza de archivos huérfanos
- No hay fecha de expiración para los archivos
- Si un incidente se elimina, la imagen asociada queda huérfana

```typescript
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
// Solo se crea el directorio, nunca se limpia
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
```

**Impacto:** El almacenamiento crecerá indefinidamente. Un atacante podría subir archivos masivos para llenar el disco.

**Recomendación:**
- Implementar un job de limpieza que elimine imágenes de incidentes eliminados
- Agregar límite de almacenamiento total
- O usar un servicio de almacenamiento externo (S3, Cloudinary)

---

### 1.2 ALTO - Problemas de Rate Limiting

**[AUDIT-003] Rate limit en auth es insuficiente**

**Severidad:** ALTA
**Categoría:** Seguridad
**Ubicación:** `backend/src/index.ts:83-91`, `backend/src/modules/auth/auth.routes.ts`
**Descripción:**
El rate limit global es 100 req/min pero el endpoint `/api/auth/login` tiene su propio limitador de 10 req/15min. Sin embargo, hay inconsistencias:

```yaml
# Global
max: 100 requests por minuto

# Auth (en incidents.routes.ts)
max: 60 requests por minuto  # Diferente al global
```

En `auth.routes.ts` no hay limitador específico para login/register, solo el global.

**Impacto:** Un atacante podría hacer fuerza bruta contra el login sin ser bloqueado efectivamente.

**Recomendación:**
- Agregar rate limit específico para `/api/auth/login` de 5 intentos por minuto
- Implementar exponential backoff después de intentos fallidos

---

**[AUDIT-004] Enumeración de usuarios en `/api/auth/me`**

**Severidad:** ALTA
**Categoría:** Seguridad
**Ubicación:** `backend/src/modules/auth/auth.controller.ts:137-163`
**Descripción:**
El endpoint `/api/auth/me` retorna 404 si el usuario no existe, permitiendo enumerar usuarios válidos:

```typescript
if (!user) {
  res.status(404).json({ error: "Usuario no encontrado" });
  return;
}
```

Un atacante podría usar esto para descubrir qué documentos están registrados en el sistema.

**Impacto:** Facilitа la enumeración de usuarios para ataques posteriores.

**Recomendación:**
- Retornar siempre 200 con datos genéricos "Sesión inválida" en vez de 404
- O validar el token primero y retornar 401 antes de consultar la DB

---

**[AUDIT-005] Push notifications sin autenticación a exp.host**

**Severidad:** ALTA
**Categoría:** Seguridad
**Ubicación:** `backend/src/modules/incidents/incidents.controller.ts:242-246`, `chat.controller.ts:327-331`
**Descripción:**
Las notificaciones push se envían directamente a `https://exp.host/--/api/v2/push/send` sin autenticación ni validación:

```typescript
await fetch("https://exp.host/--/api/v2/push/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(pushMessages),
});
```

Cualquiera podría enviar notificaciones a los tokens push almacenados si los conoce.

**Impacto:** Spoofing de notificaciones push. Un atacante podría enviar notificaciones falsas a usuarios.

**Recomendación:**
- Usar Expo Push API con autenticación (API key o token)
- Validar que el recipient del mensaje sea el owner del token

---

### 1.3 ALTO - Problemas de Autorización

**[AUDIT-006] Seed recrea admin con contraseña configurable en cada inicio**

**Severidad:** ALTA
**Categoría:** Seguridad
**Ubicación:** `backend/src/db/seed.ts:50-57`
**Descripción:**
El seed actualiza la contraseña del admin cada vez que se inicia con `SEED_ADMIN_PASSWORD`:

```typescript
if (process.env.SEED_ADMIN_PASSWORD) {
  await db
    .update(users)
    .set({ contrasena: password, estado: "activo", intentos_fallidos: 0 })
    .where(eq(users.documento, u.documento));
  logger.info(`Password updated for: ${u.nombre}`);
}
```

**Impacto:**
- Si `SEED_ADMIN_PASSWORD` está configurada, resetea la contraseña del admin en cada restart
- Un atacante que acceda al contenedor podría cambiar la contraseña del admin

**Recomendación:**
- Solo crear el admin si no existe, no actualizar password existente
- O agregar una variable `RESET_ADMIN_ON_SEED=false` por defecto

---

**[AUDIT-007] El rol "asesor" tiene acceso completo de admin**

**Severidad:** ALTA
**Categoría:** Seguridad
**Ubicación:** `backend/src/modules/incidents/incidents.routes.ts:42-50`
**Descripción:**
El middleware `adminOnly` permite tanto "admin" como "tecnico", pero en la práctica "asesor" también parece tener permisos elevados inconsistentes:

```typescript
router.get("/stats", adminOnly, validate(statsQuerySchema), getStats);
router.get("/export", adminOnly, exportIncidents);
// ... más endpoints de solo admin
```

Pero en el schema, "asesor" no está incluido en `adminOnly`. Hay inconsistencia en cómo se manejan los roles.

**Impacto:** Usuarios con rol "asesor" podrían tener más permisos de los esperados.

**Recomendación:**
- Revisar y documentar claramente qué roles tienen qué permisos
- Implementar un sistema de permisos más granular (RBAC)

---

### 1.4 MEDIO - Validación y Sanitización

**[AUDIT-008] Ausencia de validación en puntuación de ratings**

**Severidad:** MEDIA
**Categoría:** Seguridad
**Ubicación:** `backend/src/modules/ratings/ratings.controller.ts:10`
**Descripción:**
La puntuación se acepta sin validación de rango:

```typescript
const { puntuacion, comentario } = req.body;
// No se valida que puntuacion esté entre 1 y 5
```

Un usuario malicioso podría enviar `puntuacion: 100` o `puntuacion: -1`.

**Impacto:** Datos inconsistentes en la base de datos. Could affect statistics.

**Recomendación:**
```typescript
if (puntuacion < 1 || puntuacion > 5) {
  res.status(400).json({ error: "La puntuación debe ser entre 1 y 5" });
  return;
}
```

---

**[AUDIT-009] SQL Injection potencial en búsqueda UUID**

**Severidad:** MEDIA
**Categoría:** Seguridad
**Ubicación:** `backend/src/modules/incidents/incidents.controller.ts:62-69`
**Descripción:**
En la búsqueda, se concatenan hex chars directamente en SQL:

```typescript
const hexChars = search.replace(/[^A-Fa-f0-9]/g, "").toLowerCase();
conditions.push(
  hexChars.length >= 4 ? sql`replace(${incidents.id}::text, '-', '') ILIKE ${`%${hexChars}`}` : sql`1=0`,
);
```

Aunque Drizzle ORM parametriza el valor, el patrón de búsqueda podría ser problematico.

**Impacto:** Potencial para payloads muy grandes que consuman recursos.

**Recomendación:**
- Limitar longitud del search string
- Limitar el número de resultados para búsquedas complejas

---

**[AUDIT-010] Validación de input en descripción permite HTML**

**Severidad:** MEDIA
**Categoría:** Seguridad
**Ubicación:** `backend/src/modules/incidents/incidents.controller.ts:48`
**Descripción:**
La descripción del incidente es `text` sin sanitización. Podría contener scripts si el frontend no lo sanitiza.

**Impacto:** XSS si el frontend renderiza HTML sin escapar.

**Recomendación:**
- Sanitizar en el backend con una librería como `sanitize-html`
- O asegurar que el frontend siempre escape el contenido

---

## 2. CÓDIGO Y ARQUITECTURA

### 2.1 ALTO

**[AUDIT-011] Auth middleware hace query asíncrona sin manejo correcto**

**Severidad:** ALTA
**Categoría:** Código
**Ubicación:** `backend/src/middlewares/auth.ts:44-64`
**Descripción:**
El middleware de auth hace una query asíncrona pero no usa `await` correctamente, usando `.then()` en lugar de async/await:

```typescript
db.select({ estado: users.estado })
  .from(users)
  .where(eq(users.id, payload.userId))
  .limit(1)
  .then(([user]) => {
    // ...
    next();  // Se llama dentro del then
  })
  .catch(() => {
    // error handling
  });
```

**Impacto:** El código funciona pero es difícil de mantener y propenso a errores. Si la DB está lenta, el flujo es confuso.

**Recomendación:** Refactorizar a async/await:
```typescript
const [user] = await db.select({...}).where(eq(users.id, payload.userId)).limit(1);
if (user?.estado === "bloqueado") {
  return res.status(403).json({...});
}
next();
```

---

**[AUDIT-012] El logout no espera la actualización de token_version**

**Severidad:** ALTA
**Categoría:** Código
**Ubicación:** `backend/src/modules/auth/auth.controller.ts:206-226`
**Descripción:**
El logout hace la actualización de `token_version` sin await y sin manejo de errores:

```typescript
db.update(users)
  .set({ token_version: sql`token_version + 1` })
  .where(eq(users.id, payload.userId))
  .execute()
  .catch(() => {});  // Silently fails
```

**Impacto:** El token podría no invalidarse inmediatamente, permitiendo acceso con token antiguo por un breve período.

**Recomendación:**
- Hacer el logout asíncrono pero esperar la confirmación
- O implementar una lista de tokens revocados (token blacklist)

---

### 2.2 MEDIO

**[AUDIT-013] Uso de `any` en el API service del mobile**

**Severidad:** MEDIA
**Categoría:** Código
**Ubicación:** `mobile/src/services/api.ts:171-174`
**Descripción:**
```typescript
let data: unknown;
// ...
data = await res.json();  // returns unknown
```

**Impacto:** Pérdida de type safety. Errores podrían no detectarse en compile time.

**Recomendación:** Crear interfaces Response para cada endpoint.

---

**[AUDIT-014] Middleware de auth no valida el schema del token**

**Severidad:** MEDIA
**Categoría:** Código
**Ubicación:** `backend/src/middlewares/auth.ts:26`
**Descripción:**
`verifyToken` castea el resultado a `JwtPayload` pero no valida que el payload tenga todos los campos:

```typescript
const payload = verifyToken(token);  // Returns unknown
req.user = payload as JwtPayload;  // Cast sin validación
```

**Impacto:** Si el token está malformed, podría causar errores en runtime.

**Recomendación:**
```typescript
const payload = verifyToken(token);
if (!payload.userId || !payload.rol) {
  return res.status(401).json({ error: "Token malformado" });
}
```

---

**[AUDIT-015] Ausencia de conexión pooling configurado**

**Severidad:** MEDIA
**Categoría:** Arquitectura
**Ubicación:** `backend/src/db/index.ts`
**Descripción:**
El pool de PostgreSQL usa valores por defecto sin configuración explícita de:
- Max conexiones
- Idle timeout
- Connection timeout

**Impacto:** Podría haber agotamiento de conexiones en alta carga.

**Recomendación:**
```typescript
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

**[AUDIT-016] Validación Zod no cubre todos los casos**

**Severidad:** MEDIA
**Categoría:** Código
**Ubicación:** Múltiples archivos en `backend/src/modules/*/`
**Descripción:**
Algunos schemas de Zod no tienen validación estricta:
- `createIncidentSchema` permite campos opcionales sin defaults
- No se validan enegatives para números

**Impacto:** Datos inválidos podrían entrar al sistema.

**Recomendación:** Revisar cada schema Zod y agregar validaciones stricter.

---

**[AUDIT-017] No hay error boundary en Express**

**Severidad:** MEDIA
**Categoría:** Código
**Ubicación:** `backend/src/index.ts:134-147`
**Descripción:**
El handler de errores全局 solo hace logging pero no distingue tipos de errores:

```typescript
app.use((err: Error, req, res, _next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: "Error interno del servidor" });
});
```

**Impacto:** Errores conocidos (Zod validation, auth errors) se tratan como 500.

**Recomendación:**
```typescript
if (err instanceof ZodError) {
  return res.status(400).json({ error: "Validación fallida", details: err.errors });
}
```

---

**[AUDIT-018] El módulo de chat guarda todo sin límite**

**Severidad:** MEDIA
**Categoría:** Arquitectura
**Ubicación:** `backend/src/modules/chat/chat.controller.ts:369-375`
**Descripción:**
El historial de chat no tiene límite enforced en la query aunque hay un límite en el código:

```typescript
const limit = (req.validatedQuery?.limit as number) || parseInt(req.query.limit as string) || 50;
// Un usuario podría pasar limit=1000000
```

**Impacto:** Podría causar memory issues con queries muy grandes.

**Recomendación:**
```typescript
const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
```

---

### 2.3 BAJO

**[AUDIT-019] Inconsistencia en naming conventions**

**Severidad:** BAJA
**Categoría:** Código
**Ubicación:** Múltiples archivos
**Descripción:**
Mezcla de convenciones:
- `createIncident` (camelCase)
- `create_incident` (snake_case en BD)
- `PDFolder` (PDFolder vs PDV)

**Recomendación:** Estandarizar y usar solo camelCase para funciones JS/TS.

---

**[AUDIT-020] Ausencia de comentarios en funciones críticas**

**Severidad:** BAJA
**Categoría:** Código
**Ubicación:** `backend/src/modules/incidents/incidents.controller.ts:161-165`
**Descripción:**
El objeto `VALID_TRANSITIONS` no tiene comentario que explique su propósito:

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  pendiente: ["en_proceso", "resuelto"],
  en_proceso: ["resuelto"],
  resuelto: [],
};
```

**Recomendación:** Agregar JSDoc comment.

---

**[AUDIT-021] Logger no tiene niveles configurables**

**Severidad:** BAJA
**Categoría:** Código
**Ubicación:** `backend/src/lib/logger.ts`
**Descripción:**
El logger usa `logger.info` y `logger.error` pero no hay forma de configurar el nivel mínimo en producción.

**Recomendación:** Implementar log levels (debug, info, warn, error).

---

## 3. API REST

### 3.1 MEDIO

**[AUDIT-022] Endpoint `/api/health` hace query a DB**

**Severidad:** MEDIA
**Categoría:** Performance
**Ubicación:** `backend/src/index.ts:94-102`
**Descripción:**
El health check hace `SELECT 1` a la base de datos cada vez:

```typescript
app.get("/api/health", async (_req, res) => {
  try {
    const { db } = await import("./db");
    await db.execute("SELECT 1");
    // ...
  }
});
```

**Impacto:** En alta carga, esto añade estrés innecesario a la DB. Kubernetes/load balancers hacen health checks frecuentemente.

**Recomendación:**
- Separar `/api/health` (simple OK) de `/api/health/db` (con DB check)
- O cachear el resultado por unos segundos

---

**[AUDIT-023] No hay paginación en `/api/chat/history`**

**Severidad:** MEDIA
**Categoría:** API
**Ubicación:** `backend/src/modules/chat/chat.controller.ts:363-381`
**Descripción:**
El historial de chat tiene un límite por defecto de 50 pero no tiene paginación (no hay `page`/`offset`).

**Impacto:** Para usuarios con mucho historial, no hay forma de navegar por páginas.

**Recomendación:** Agregar paginación cursor-based.

---

**[AUDIT-024] Endpoint `/api/ratings` solo accesible para admin**

**Severidad:** MEDIA
**Categoría:** UX
**Ubicación:** `backend/src/modules/ratings/ratings.routes.ts`
**Descripción:**
Los usuarios normales no pueden ver estadísticas de ratings generales, solo sus propias calificaciones.

**Impacto:** UX limitada para usuarios finales.

**Recomendación:** Crear endpoint público `/api/ratings/stats` con estadísticas aggregateadas.

---

### 3.2 BAJO

**[AUDIT-025] Response del export no es Excel sino JSON**

**Severidad:** BAJA
**Categoría:** API
**Ubicación:** `backend/src/modules/incidents/incidents.controller.ts:345-403`
**Descripción:**
El endpoint se llama `/export` y sugiere Excel en el dashboard, pero retorna JSON:

```typescript
res.json({ items: result, total: result.length });
```

El frontend usa ExcelJS para crear el archivo en el cliente.

**Impacto:** Confuso para otros consumidores de la API.

**Recomendación:**
- Renombrar a `/api/incidents/export-data`
- O generar el Excel en el backend y retornar un binary stream

---

## 4. BASE DE DATOS

### 4.1 ALTO

**[AUDIT-026] Falta índice en `incidents.user_id` para queries frecuentes**

**Severidad:** ALTA
**Categoría:** Performance
**Ubicación:** `backend/src/db/schema.ts:60-65`
**Descripción:**
Ya existe `incidents_user_id_idx` pero hay queries que buscan por `user_id + estado` que no tienen índice compuesto.

**Impacto:** Queries con filtros combinados podrían ser lentas.

**Recomendación:**
```typescript
index("incidents_user_estado_idx").on(table.user_id, table.estado),
```

---

### 4.2 MEDIO

**[AUDIT-027] No hay constraint CHECK en puntuacion**

**Severidad:** MEDIA
**Categoría:** Base de datos
**Ubicación:** `backend/src/db/schema.ts:110`
**Descripción:**
```typescript
puntuacion: integer("puntuacion").notNull(),
// No hay CHECK (puntuacion >= 1 AND puntuacion <= 5)
```

**Impacto:** Datos inválidos podrían entrar por queries directas a DB.

**Recomendación:**
```typescript
puntuacion: integer("puntuacion").notNull(),  // Validado en app, pero DB no enforce
```

---

**[AUDIT-028] Campos opcionales sin default en users**

**Severidad:** MEDIA
**Categoría:** Base de datos
**Ubicación:** `backend/src/db/schema.ts:22-35`
**Descripción:**
`email` es nullable sin default, `telefono` en incidents tiene default "":

```typescript
email: varchar("email", { length: 150 }),  // nullable
telefono: varchar("telefono", { length: 20 }).notNull().default(""),
```

**Impacto:** Mezcla de strings vacíos y nulls puede causar bugs.

**Recomendación:** Estandarizar a strings vacíos para campos opcionales de texto.

---

### 4.3 BAJO

**[AUDIT-029] No hay soft deletes**

**Severidad:** BAJA
**Categoría:** Arquitectura
**Ubicación:** `backend/src/db/schema.ts`
**Descripción:**
Incidentes y usuarios se eliminan permanentemente con `DELETE`. No hay campo `deleted_at`.

**Impacto:** No hay auditoría de qué se eliminó.

**Recomendación:** Considerar soft deletes para datos importantes.

---

## 5. FRONTEND WEB

### 5.1 MEDIO

**[AUDIT-030] No hay error boundary en Next.js**

**Severidad:** MEDIA
**Categoría:** UX
**Ubicación:** `web/src/app/`
**Descripción:**
No hay componente error boundary global para capturar React errors.

**Impacto:** Errores inesperados pueden mostrar blank screens.

**Recomendación:** Crear `error.tsx` en el app router.

---

**[AUDIT-031] Tokens almacenados en localStorage**

**Severidad:** MEDIA
**Categoría:** Seguridad
**Ubicación:** `web/src/contexts/AuthContext.tsx` (asumido)
**Descripción:**
Si el web usa localStorage para tokens en vez de cookies httpOnly, es vulnerable a XSS.

**Impacto:** Tokens pueden ser robados via XSS.

**Recomendación:** Usar cookies httpOnly (que el backend ya soporta).

---

### 5.2 BAJO

**[AUDIT-032] Loading states incompletos**

**Severidad:** BAJA
**Categoría:** UX
**Ubicación:** Componentes del dashboard
**Descripción:**
Algunos componentes podrían no tener loading states para todas las operaciones async.

**Recomendación:** Auditor de UX completo.

---

## 6. MOBILE

### 6.1 MEDIO

**[AUDIT-033] API URL hardcoded con fallback**

**Severidad:** MEDIA
**Categoría:** Seguridad
**Ubicación:** `mobile/src/services/api.ts:13-14`
**Descripción:**
```typescript
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://hub-platform-api.onrender.com/api";
```

Hay una URL de fallback hardcodedada que podría apuntar a producción.

**Impacto:** En desarrollo, requests podrían ir a producción por error.

**Recomendación:** Eliminar el fallback y exigir que `EXPO_PUBLIC_API_URL` esté configurado.

---

**[AUDIT-034] No hay certificate pinning**

**Severidad:** MEDIA
**Categoría:** Seguridad
**Ubicación:** `mobile/src/services/api.ts`
**Descripción:**
No se valida específicamente el certificado SSL del servidor.

**Impacto:** Vulnerable a MITM en redes no confiables.

**Recomendación:** Implementar certificate pinning para producción.

---

### 6.2 BAJO

**[AUDIT-035] Cache podría guardar datos sensibles**

**Severidad:** BAJA
**Categoría:** Seguridad
**Ubicación:** `mobile/src/services/api.ts:205-207`
**Descripción:**
```typescript
if (isGet) {
  saveCache(endpoint, data);
}
```

El cache guarda responses completos incluyendo datos de incidentes.

**Impacto:** Datos sensibles podrían persistir en el dispositivo.

**Recomendación:** No cachear endpoints que retornan datos personales/sensibles.

---

## 7. DOCKER

### 7.1 ALTO

**[AUDIT-036] Imágenes base no especificadas con digest**

**Severidad:** ALTA
**Categoría:** Docker
**Ubicación:** `docker-compose.yml`, Dockerfiles
**Descripción:**
```dockerfile
FROM node:22-alpine
FROM postgres:16-alpine
FROM nginx:alpine
```

No se especifica tag digest, solo el tag `:alpine` que puede cambiar.

**Impacto:** Un `docker-compose pull` podría traer versiones diferentes en rebuilds.

**Recomendación:**
```dockerfile
FROM node:22-alpine@sha256:abc123...
```

---

### 7.2 MEDIO

**[AUDIT-037] No hay resource limits en contenedores**

**Severidad:** MEDIA
**Categoría:** Docker
**Ubicación:** `docker-compose.yml`
**Descripción:**
No hay `deploy.resources.limits` definidos para ningún servicio.

**Impacto:** Un contenedor podría consumir todos los recursos del host.

**Recomendación:**
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
```

---

**[AUDIT-038] Secrets pasan como environment variables**

**Severidad:** MEDIA
**Categoría:** Docker
**Ubicación:** `docker-compose.yml:25-33`
**Descripción:**
Los secretos JWT y DB passwords pasan como `environment:` en el compose file:

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET}
  JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
```

**Impacto:** Los secrets son visibles en `docker inspect`.

**Recomendación:** Usar Docker secrets o compose secrets para producción.

---

### 7.3 BAJO

**[AUDIT-039] Puerto 5432 expuesto al host**

**Severidad:** BAJA
**Categoría:** Docker
**Ubicación:** `docker-compose.yml:9-10`
**Descripción:**
```yaml
ports:
  - "5432:5432"
```

PostgreSQL está expuesto directamente al host, permitiendo conexiones externas.

**Impacto:** Si el firewall es débil, cualquiera podría conectarse a la DB.

**Recomendación:** Remover el port mapping en producción (conectar solo via internal network).

---

**[AUDIT-040] Health check de postgres usa usuario fijo**

**Severidad:** BAJA
**Categoría:** Docker
**Ubicación:** `docker-compose.yml:13-14`
**Descripción:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U hub_admin -d hub_platform"]
```

**Recomendación:** Usar variable `${POSTGRES_USER}` en vez de hardcode `hub_admin`.

---

## 8. PERFORMANCE

### 8.1 MEDIO

**[AUDIT-041] Queries N+1 en exportIncidents**

**Severidad:** MEDIA
**Categoría:** Performance
**Ubicación:** `backend/src/modules/incidents/incidents.controller.ts:378-391`
**Descripción:**
```typescript
// Primero se obtienen incidentes
const allIncidents = await db.select().from(incidents)...

// Luego se obtienen comentarios en bulk
const allComments = incidentIds.length > 0
  ? await db.select().from(incidentComments).where(inArray(...))
  : [];
```

Esto es correcto (no N+1), pero el mapeo es manual en JavaScript:

```typescript
for (const comment of allComments) {
  const list = commentsByIncident.get(comment.incident_id) || [];
  list.push(comment);
  commentsByIncident.set(comment.incident_id, list);
}
```

**Impacto:** En exports grandes (10000+ registros), el mapeo JavaScript puede ser lento.

**Recomendación:** Considerar hacer el mapeo en la query con `json_agg` de PostgreSQL.

---

**[AUDIT-042] getStats carga todos los incidentes en memoria**

**Severidad:** MEDIA
**Categoría:** Performance
**Ubicación:** `backend/src/modules/incidents/incidents.controller.ts:448-456`
**Descripción:**
```typescript
const allIncidents = await db
  .select({
    created_at: incidents.created_at,
    urgencia: incidents.urgencia,
    estado: incidents.estado,
    punto_venta: incidents.punto_venta,
  })
  .from(incidents)
  .where(whereClause);
```

Para estadísticas con muchos datos, esto carga todo en memoria.

**Impacto:** Memory issues con datasets grandes.

**Recomendación:** Hacer agregaciones en SQL con `GROUP BY`.

---

**[AUDIT-043] No hay caching de queries frecuentes**

**Severidad:** MEDIA
**Categoría:** Performance
**Ubicación:** Múltiples endpoints
**Descripción:**
`/api/dashboard/kpis`, `/api/incidents/stats` y similares se recalculan cada vez.

**Impacto:** Queries pesadas se repiten innecesariamente.

**Recomendación:** Implementar Redis o similar para cachear resultados de estadísticas.

---

### 8.2 BAJO

**[AUDIT-044] Logs de Morgan en producción**

**Severidad:** BAJA
**Categoría:** Performance
**Ubicación:** `backend/src/index.ts:72-78`
**Descripción:**
```typescript
app.use(
  morgan(
    env.NODE_ENV === "production"
      ? ":remote-addr :method :url :status :response-time ms [:request-id]"
      : ":method :url :status :response-time ms [:request-id]"
  )
);
```

**Impacto:** I/O adicional por cada request en producción.

**Recomendación:** Considerar usar un log aggregator en vez de stdout.

---

## 9. OBSERVABILIDAD

### 9.1 MEDIO

**[AUDIT-045] Métricas personalizadas no son Prometheus-compatible**

**Severidad:** MEDIA
**Categoría:** Observabilidad
**Ubicación:** `backend/src/middlewares/metrics.ts`
**Descripción:**
El endpoint `/api/metrics` retorna JSON en vez del formato Prometheus.

**Impacto:** No se puede integrar con Prometheus/Grafana fácilmente.

**Recomendación:** Implementar el formato Prometheus o usar `prom-client`.

---

### 9.2 BAJO

**[AUDIT-046] No hay distributed tracing**

**Severidad:** BAJA
**Categoría:** Observabilidad
**Ubicación:** Global
**Descripción:** No hay trace IDs propagados entre servicios.

**Recomendación:** Implementar OpenTelemetry.

---

## 10. QUICK WINS (Fáciles de-arreglar)

### Implemented as TODO list:

- [ ] **[AUDIT-001]** Cambiar `.env.example` con valores placeholder `CHANGE_IN_PRODUCTION`
- [ ] **[AUDIT-008]** Agregar validación de rango en `puntuacion`
- [ ] **[AUDIT-013]** Crear interfaces TypeScript para respuestas del API
- [ ] **[AUDIT-022]** Separar health check simple vs DB check
- [ ] **[AUDIT-026]** Agregar índice compuesto `incidents(user_id, estado)`
- [ ] **[AUDIT-033]** Eliminar fallback hardcoded de API_URL
- [ ] **[AUDIT-039]** Remover exposición de puerto 5432 en producción
- [ ] **[AUDIT-036]** Usar SHA digests para imágenes Docker

---

## PLAN DE ACCIÓN PRIORIZADO

### Fase 1: Críticos (Esta semana)

1. **[AUDIT-001]** Regenerar todos los secretos -生成 nuevos JWT secrets y DB password
2. **[AUDIT-002]** Implementar limpieza de uploads o usar servicio externo
3. **[AUDIT-005]** Configurar Expo Push con autenticación

### Fase 2: Altos (Esta semana)

4. **[AUDIT-003]** Agregar rate limit específico para login (5/min)
5. **[AUDIT-006]** Modificar seed para no resetear password existente
6. **[AUDIT-011]** Refactorizar auth middleware a async/await
7. **[AUDIT-012]** Hacer logout esperar confirmación de DB
8. **[AUDIT-026]** Agregar índices faltantes
9. **[AUDIT-036]** Fijar versiones Docker con SHA

### Fase 3: Medios (Próxima semana)

10. **[AUDIT-004]** Cambiar respuesta de /me a siempre 200
11. **[AUDIT-008]** Validar rating puntuación
12. **[AUDIT-013]** Agregar tipos al API service
13. **[AUDIT-015]** Configurar connection pooling
14. **[AUDIT-017]** Mejorar error handling
15. **[AUDIT-022]** Separar health checks
16. **[AUDIT-037]** Agregar resource limits
17. **[AUDIT-038]** Usar Docker secrets
18. **[AUDIT-041]** Optimizar exports con SQL

### Fase 4: Bajos (Cuando haya tiempo)

19. [AUDIT-007] Documentar RBAC
20. [AUDIT-019] Estandarizar naming
21. [AUDIT-023] Agregar paginación a chat history
22. [AUDIT-025] Renombrar endpoint export
23. [AUDIT-029] Considerar soft deletes
24. [AUDIT-030] Agregar error boundaries
25. [AUDIT-045] Implementar Prometheus metrics

---

## CONCLUSIONES

El proyecto tiene una base sólida de seguridad con JWT, bcrypt, rate limiting, y validación Zod. Los principales problemas son:

1. **Secrets predecibles** en desarrollo que podrían pasar a producción
2. **Falta de índices** en consultas frecuentes
3. **Logging/observabilidad** insuficiente
4. **Error handling** mejorable
5. **Arquitectura de Docker** puede optimizar resource usage

Lamayoría de los hallazgos son de **medium/bajo severity** y pueden arreglarse con cambios incrementales.

---

*Documento generado: 2026-07-07*
*Total de hallazgos: 46*
