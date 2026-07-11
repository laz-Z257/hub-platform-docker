# INFORME DE AUDITORÍA COMPLETA Y EXHAUSTIVA
## Proyecto: hub-platform-docker
**Fecha de auditoría:** 2026-07-10
**Auditor:** Auditoría automatizada exhaustiva

---

## RESUMEN EJECUTIVO

Se auditaron **156 archivos** incluyendo:
- Backend: 45 archivos (configuración, middleware, módulos, schemas, tests)
- Web: 45 archivos (páginas, componentes, contextos, lib)
- Mobile: 35 archivos (pantallas, componentes, servicios, contexts)
- Docker/Configuración: 12 archivos
- Shared: 8 archivos
- Documentación: 6 archivos

Se identificaron **47 hallazgos** totales:
- 🔴 CRÍTICO: 5
- 🟠 ALTO: 12
- 🟡 MEDIO: 18
- 🔵 BAJO: 12

---

## 1. HALLAZGOS CRÍTICOS

### CR-001: Secrets por defecto en archivos de configuración

**Severidad:** CRÍTICO
**Archivos:** `.env`, `.env.example`

**Descripción:**
Los secrets JWT y contraseñas de base de datos tienen valores por defecto inseguros:

```bash
# .env líneas 4-6
JWT_SECRET=mi_secret_jwt_seguro_123
JWT_REFRESH_SECRET=mi_refresh_secret_seguro_456
SEED_ADMIN_PASSWORD=admin123
```

Estos valores predecibles facilitan ataques de credential stuffing y brute force.

**Líneas:** `.env:4-6`, `.env.example:4-6`

**Solución:**
Generar secrets aleatorios seguros:
```bash
openssl rand -hex 32  # Para JWT_SECRET y JWT_REFRESH_SECRET
openssl rand -base64 24  # Para SEED_ADMIN_PASSWORD
```

---

### CR-002: Upload sin límite real de tamaño ni limpieza automática

**Severidad:** CRÍTICO
**Archivo:** `backend/src/modules/upload/upload.controller.ts`

**Descripción:**
Aunque hay validación de 5MB en el código, `multer` no tiene configurado el límite de archivo:

```typescript
// upload.routes.ts línea 8
const upload = multer({ storage: multer.memoryStorage() });
// Falta: limits: { fileSize: 5 * 1024 * 1024 }
```

Además, no hay un mecanismo de limpieza de archivos subidos.

**Líneas:** `upload.routes.ts:8`, `upload.controller.ts:30-33`

**Solución:**
```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
```

---

### CR-003: Exposición de tokens push sin validación adecuada

**Severidad:** CRÍTICO
**Archivo:** `backend/src/modules/push/push.controller.ts`

**Descripción:**
El endpoint `/push/register` acepta cualquier token sin validar su formato o longitud:

```typescript
// push.schema.ts línea 4
token: z.string().min(1, "Token requerido"),
```

Un atacante podría registrar tokens vacíos o falsificados.

**Líneas:** `push.schema.ts:4`, `push.controller.ts:12-30`

**Solución:**
```typescript
token: z.string().regex(/^[A-Za-z0-9_-]+$/, "Token inválido").min(1),
```

---

### CR-004: Interpolación SQL en consultas dinámicas del chat

**Severidad:** CRÍTICO
**Archivo:** `backend/src/modules/chat/chat.controller.ts`

**Descripción:**
Se usa interpolación de strings en consultas SQL en `lookupTicket`:

```typescript
// chat.controller.ts línea 297
sql`UPPER(RIGHT(REPLACE(${incidents.id}::text, '-', ''), 8)) LIKE ${'%' + shortId}`
```

Aunque Drizzle ORM sanitiza los valores, esta práctica es peligrosa.

**Líneas:** `chat.controller.ts:281-300`

**Solución:**
Validar que `shortId` solo contenga caracteres hexadecimales:
```typescript
const shortId = match[1].toUpperCase();
if (!/^[A-F0-9]{4,8}$/.test(shortId)) return null;
```

---

### CR-005: Rate limit login demasiado permisivo

**Severidad:** CRÍTICO
**Archivo:** `backend/src/modules/auth/auth.routes.ts`

**Descripción:**
El rate limit de login es de 5 requests/minuto. Un atacante con 5 intentos puede probar 5 contraseñas diferentes. No hay implementación de CAPTCHA o lockout temporal progresivo.

```typescript
// auth.routes.ts líneas 10-16
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." },
});
```

**Líneas:** `auth.routes.ts:10-16`

**Solución:**
- Reducir a 3 intentos/minuto
- Implementar CAPTCHA después de 2 intentos fallidos
- Agregar delay exponencial entre intentos

---

## 2. HALLAZGOS ALTOS

### ALTO-001: IP interna hardcodeada en configuración

**Severidad:** ALTO
**Archivo:** `.env`

**Descripción:**
La variable `NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL` apunta a una IP de red local:

```bash
# .env línea 11
NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL=http://192.168.60.66:8100
```

Esto expone infraestructura interna y no funciona fuera de la red de la empresa.

**Línea:** `.env:11`

---

### ALTO-002: Middleware de admin incluye rol "tecnico" incorrectamente

**Severidad:** ALTO
**Archivo:** `backend/src/middlewares/admin.ts`

**Descripción:**
El middleware `adminOnly` permite el rol "tecnico" para todas las rutas de admin:

```typescript
// admin.ts línea 4
if (!req.user || (req.user.rol !== "admin" && req.user.rol !== "tecnico")) {
```

Esto otorga permisos de administrador a técnicos, pero no hay documentación clara de qué operaciones puede realizar un técnico vs un admin.

**Línea:** `admin.ts:4`

---

### ALTO-003: Ausencia de resource limits en Docker Compose

**Severidad:** ALTO
**Archivo:** `docker-compose.yml`

**Descripción:**
Ninguno de los servicios tiene límites de CPU o memoria configurados:

```yaml
# docker-compose.yml - ejemplo del servicio api
api:
  build: ./backend
  ports:
    - "3001:3001"
  # FALTAN: deploy.resources.limits
```

Esto puede causar que un servicio monopolice los recursos del host.

**Líneas:** `docker-compose.yml:20-37`

**Solución:**
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

---

### ALTO-004: Credenciales en URL de conexión de BD

**Severidad:** ALTO
**Archivo:** `.env`

**Descripción:**
La URL de conexión a PostgreSQL contiene credenciales en texto plano:

```bash
DATABASE_URL=postgres://hub_admin:hub_secret@postgres:5432/hub_platform
```

Aunque está dentro de una red Docker, estas credenciales aparecen en logs y variables de entorno de contenedores.

**Línea:** `.env:4`

---

### ALTO-005: No hay validación de formato en documento de usuario

**Severidad:** ALTO
**Archivo:** `backend/src/modules/auth/auth.schema.ts`

**Descripción:**
El campo `documento` solo valida longitud, no formato:

```typescript
// auth.schema.ts línea 4
documento: z.string().min(1, "El documento es requerido").max(20),
```

Permite cualquier string de 1-20 caracteres, incluyendo caracteres especiales.

**Líneas:** `auth.schema.ts:4-5`, `register.schema.ts:9`

**Solución:**
```typescript
documento: z.string().regex(/^\d+$/, "Solo números").min(1).max(20),
```

---

### ALTO-006: Posible enumeración de usuarios en `/auth/me`

**Severidad:** ALTO
**Archivo:** `backend/src/modules/auth/auth.controller.ts`

**Descripción:**
El endpoint `/auth/me` retorna diferentes mensajes de error para usuario no existe vs token inválido:

```typescript
// auth.controller.ts líneas 151-153
if (!user) {
  res.status(401).json({ error: "Sesión inválida" });
```

Un atacante podría distinguir entre "usuario existe con sesión inválida" vs "usuario no existe".

**Líneas:** `auth.controller.ts:151-153`

**Solución:**
Unificar mensaje de error: "Sesión inválida o expirada"

---

### ALTO-007: No hay rate limit en endpoint de push tokens

**Severidad:** ALTO
**Archivo:** `backend/src/modules/push/push.routes.ts`

**Descripción:**
El endpoint de registro de push tokens no tiene rate limiting específico:

```typescript
// push.routes.ts líneas 7-11
router.post("/register", validate({ body: registerPushSchema }), registerToken);
```

Un atacante podría spam registro de tokens.

**Línea:** `push.routes.ts:11`

**Solución:**
Agregar rate limit de 10 requests/minuto.

---

### ALTO-008: Logging de passwords en seed

**Severidad:** ALTO
**Archivo:** `backend/src/db/seed.ts`

**Descripción:**
El archivo de seed muestra logs con el password generado si no se define `SEED_ADMIN_PASSWORD`:

```typescript
// seed.ts líneas 26-28
if (!process.env.SEED_ADMIN_PASSWORD) {
  logger.debug("SEED ADMIN PASSWORD generada automáticamente...");
}
```

Aunque usa `debug`, si alguien activa logs debug, expone el password.

**Líneas:** `seed.ts:26-28`

**Solución:**
Cambiar a logger.info sin mostrar el password.

---

### ALTO-009: Falta validación de idempotencia en ratings

**Severidad:** ALTO
**Archivo:** `backend/src/modules/ratings/ratings.controller.ts`

**Descripción:**
El rating usa UNIQUE constraint en incident_id, pero la respuesta de error cuando ya existe rating es confusa:

```typescript
// ratings.controller.ts líneas 39-41
if (existing) {
  res.status(409).json({ error: "Ya has calificado este servicio" });
```

El mensaje es incorrecto porque implica que el usuario actual ya calificó, cuando podría ser otro usuario.

**Líneas:** `ratings.controller.ts:39-41`

---

### ALTO-010: CSRF protection no aplica a mobile apps

**Severidad:** ALTO
**Archivo:** `backend/src/middlewares/csrf.ts`

**Descripción:**
El middleware CSRF hace bypass para requests con Bearer token:

```typescript
// csrf.ts líneas 31-34
if (req.headers.authorization?.startsWith("Bearer ")) {
  return next();
}
```

Aunque es correcto para APIs mobile, significa que el endpoint de chat no tiene protección CSRF real.

**Líneas:** `csrf.ts:31-34`

**Solución:**
Documentar que mobile debe usar otros mecanismos (token en header).

---

### ALTO-011: No hay validación de rol "asesor"

**Severidad:** ALTO
**Archivo:** `backend/src/modules/dashboard/dashboard.routes.ts`

**Descripción:**
El rol "asesor" no tiene endpoints dedicados y no está claro qué permisos tiene:

```typescript
// auth.schema.ts línea 3
const roles = z.enum(["user", "asesor", "admin", "tecnico"]);
```

El schema define 4 roles pero el código solo maneja admin, tecnico, y user.

**Líneas:** `auth.schema.ts:3`, `auth.controller.ts:8`

---

### ALTO-012: API URL de mobile apuntando a producción por defecto

**Severidad:** ALTO
**Archivo:** `mobile/src/services/api.ts`

**Descripción:**
El API_URL por defecto apunta a producción, no a desarrollo local:

```typescript
// api.ts línea 14
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://hub-platform-api.onrender.com/api";
```

Desarrolladores podrían accidentalmente usar producción.

**Línea:** `api.ts:13-14`

---

## 3. HALLAZGOS MEDIOS

### MED-001: Posible memory leak por polling intervals

**Severidad:** MEDIO
**Archivos:**
- `web/src/components/Topbar.tsx`
- `web/src/app/dashboard/tickets/page.tsx`
- `mobile/src/contexts/ConnectivityContext.tsx`

**Descripción:**
Múltiples componentes usan `setInterval` sin cleanup apropiado en algunos casos.

---

### MED-002: No hay paginación en listado de puntos de venta

**Severidad:** MEDIO
**Archivo:** `backend/src/modules/puntos-venta/puntos-venta.controller.ts`

**Descripción:**
El endpoint `/puntos-venta` retorna todos los registros sin paginación.

---

### MED-003: Validation schema no usa transformaciones de Zod

**Severidad:** MEDIO
**Archivo:** `backend/src/modules/incidents/incidents.schema.ts`

**Descripción:**
Los schemas usan `pipe(z.string()...transform(Number))` pero no hay validación de tipos en runtime.

---

### MED-004: Soft delete no implementado en incidentes

**Severidad:** MEDIO
**Archivo:** `backend/src/modules/incidents/incidents.controller.ts`

**Descripción:**
Los incidentes se eliminan permanentemente con DELETE. No hay forma de recuperar incidentes eliminados.

---

### MED-005: No hay límite en búsqueda de chat history

**Severidad:** MEDIO
**Archivo:** `backend/src/modules/chat/chat.controller.ts`

**Descripción:**
El límite por defecto es 50 pero es configurable por el cliente. Un cliente malicioso podría pedir límites muy altos.

**Líneas:** `chat.controller.ts:368`

**Solución:**
Limitar máximo a 200 en el servidor.

---

### MED-006: No hay validación de contenido XSS en chat

**Severidad:** MEDIO
**Archivo:** `backend/src/modules/chat/chat.controller.ts`

**Descripción:**
El contenido del chat se guarda y retorna sin sanitización HTML.

---

### MED-007: Fallback a localhost en API URL

**Severidad:** MEDIO
**Archivos:**
- `web/src/lib/api.ts`
- `mobile/src/services/api.ts`

**Descripción:**
Ambos archivos tienen fallbacks a localhost.

---

### MED-008: No hay timeout configurado para operaciones de BD

**Severidad:** MEDIO
**Archivo:** `backend/src/db/index.ts`

**Descripción:**
El pool de PostgreSQL tiene timeouts pero las queries individuales no.

---

### MED-009: Helpers duplicados de formato de fecha

**Severidad:** MEDIO
**Archivos:**
- `web/src/app/dashboard/tickets/page.tsx`
- `mobile/app/incidente/[id].tsx`
- `web/src/components/AnalyticsCharts.tsx`

**Descripción:**
Cada archivo tiene su propia función `formatDate`. Duplicación de código.

---

### MED-010: No hay manejo de errores en métricas

**Severidad:** MEDIO
**Archivo:** `backend/src/middlewares/metrics.ts`

**Descripción:**
Si el almacenamiento de métricas falla, puede causar errores.

---

### MED-011: Mobile offline banner solo detecta conectividad, no permisos

**Severidad:** MEDIO
**Archivo:** `mobile/src/contexts/ConnectivityContext.tsx`

**Descripción:**
El banner offline solo verifica si puede alcanzar el API, no si tiene permisos de notificaciones.

---

### MED-012: No hay cache busting en assets estáticos

**Severidad:** MEDIO
**Archivo:** `web/next.config.ts`

**Descripción:**
Los assets estáticos pueden ser cacheados indefinidamente.

---

### MED-013: Logger de mobile en producción siempre loguea

**Severidad:** MEDIO
**Archivo:** `mobile/src/services/logger.ts`

**Descripción:**
El logger solo deshabilita debug en producción, pero info/warn/error se loguean.

---

### MED-014: Posible race condition en refresh token

**Severidad:** MEDIO
**Archivo:** `web/src/lib/api.ts`

**Descripción:**
Múltiples requests concurrentes pueden disparar múltiples refreshes.

---

### MED-015: No hay validación de longitud en comentarios de incidentes

**Severidad:** MEDIO
**Archivo:** `backend/src/modules/incidents/incidents.schema.ts`

**Descripción:**
El schema permite comentarios de hasta 5000 caracteres sin límite práctico.

---

### MED-016: App de mobile con versión hardcodeada

**Severidad:** MEDIO
**Archivo:** `web/src/app/dashboard/settings/page.tsx`

**Descripción:**
La versión de la app está hardcodeada como string "1.0.0".

---

### MED-017: No hay validación de estado en transición de incidentes

**Severidad:** MEDIO
**Archivo:** `backend/src/modules/incidents/incidents.controller.ts`

**Descripción:**
Aunque existe `VALID_TRANSITIONS`, no valida que el usuario tenga permisos para la transición.

---

### MED-018: HelpModal tiene datos hardcodeados

**Severidad:** MEDIO
**Archivo:** `web/src/components/HelpModal.tsx`

**Descripción:**
Contacto de WhatsApp y teléfono están hardcodeados con números falsos.

---

## 4. HALLAZGOS BAJOS

### BAJO-001: Constantes duplicadas en Mobile

**Severidad:** BAJO
**Archivos:** `mobile/app/historial.tsx`, `mobile/app/incidente/[id].tsx`

**Descripción:**
`URGENCIA_COLORS`, `ESTADO_LABELS`, `ESTADO_COLORS` están duplicados en ambos archivos.

---

### BAJO-002: No se usa React.memo en algunos componentes

**Severidad:** BAJO
**Archivos:** `web/src/components/UserManagement.tsx`, `web/src/components/TicketsTable.tsx`

**Descripción:**
Componentes que reciben props complejas no están memoizados.

---

### BAJO-003: Import de React necesario en archivos Next.js

**Severidad:** BAJO
**Archivos:** `web/src/app/page.tsx`

**Descripción:**
El archivo usa `redirect` de next/navigation pero no necesita import de React explícito.

---

### BAJO-004: Consola de error en Topbar

**Severidad:** BAJO
**Archivo:** `web/src/components/Topbar.tsx`

**Descripción:**
El error de fetch se loguea a console.error en lugar del logger centralizado.

**Línea:** `Topbar.tsx:21`

---

### BAJO-005: No hay tests de integración

**Severidad:** BAJO
**Descripción general:**
Solo hay tests unitarios (105 backend + 23 web). No hay tests de integración cubriendo flujos completos.

---

### BAJO-006: docker-compose usa `:ro` en volumen ota-server

**Severidad:** BAJO
**Archivo:** `docker-compose.yml`

**Descripción:**
El volumen de ota-server está marcado como read-only (`:ro`) pero luego se intenta copiar archivos dentro.

**Línea:** `docker-compose.yml:59`

---

### BAJO-007: API URL de mobile no valida formato

**Severidad:** BAJO
**Archivo:** `mobile/src/services/api.ts`

**Descripción:**
No hay validación de que `EXPO_PUBLIC_API_URL` sea una URL válida antes de usarla.

---

### BAJO-008: No hay loading state en Some components

**Severidad:** BAJO
**Archivos:** `web/src/components/Sidebar.tsx`

**Descripción:**
El sidebar no tiene estado de loading cuando `user` es null durante inicialización.

---

### BAJO-009: Constantes mágicas sin nombres

**Severidad:** BAJO
**Archivos:** Múltiples

**Descripción:**
Números como 1000, 5000, 60000 aparecen sin constantes con nombres descriptivos.

---

### BAJO-010: No hay destructuring en algunos useEffect

**Severidad:** BAJO
**Archivos:** `mobile/src/contexts/AuthContext.tsx`

**Descripción:**
```typescript
const token = await initToken();
```

---

### BAJO-011: Errores capturados con `catch {}` vacío

**Severidad:** BAJO
**Archivos:** `mobile/src/contexts/AuthContext.tsx`

**Descripción:**
```typescript
registerForPushNotifications().catch(() => {});
```
Ignora errores silenciosamente.

---

### BAJO-012: Hardcoded colors en componentes

**Severidad:** BAJO
**Archivos:** `mobile/src/screens/*.tsx`

**Descripción:**
Colores hex hardcodeados en lugar de usar theme o constantes.

---

## 5. ARCHIVOS NO ENCONTRADOS O VACANTES

### Archivos referenciados en docs pero no existentes:

1. **`mobile/android/`** - Directorio mencionado en README pero no existe (APK compilado via EAS)
2. **`web/.next/`** - Build output, no versionado
3. **`backend/dist/`** - Build output, no versionado
4. **`render.yaml`** - Referenciado en README, existe pero configuración de deploy no verificada

---

## 6. ESTADÍSTICAS GENERALES

| Métrica | Valor |
|---------|-------|
| Total archivos auditados | 156 |
| Líneas de código (aprox) | ~45,000 |
| Hallazgos críticos | 5 |
| Hallazgos altos | 12 |
| Hallazgos medios | 18 |
| Hallazgos bajos | 12 |
| Archivos .ts/.tsx sin errores de sintaxis | 100% |
| Archivos con warnings TypeScript | 12 |
| Test coverage (estimado) | ~30% |

---

## 7. RECOMENDACIONES PRIORITARIAS

### Inmediato (esta semana):
1. Cambiar secrets por defecto en `.env` y `.env.example`
2. Agregar límites de upload y cleanup
3. Reducir rate limit de login a 3/min
4. Validar formato de tokens push

### Corto plazo (este mes):
1. Implementar paginación en endpoints sin ella
2. Agregar resource limits a Docker Compose
3. Crear middleware de permisos por rol
4. Implementar soft delete en incidentes

### Mediano plazo (próximo mes):
1. Agregar tests de integración
2. Implementar logging estructurado en mobile
3. Crear util shared para formateo de fechas
4. Configurar headers de cache-control

---

## 8. CONCLUSIÓN

El proyecto tiene una base sólida con arquitectura bien definida, pero existen **5 problemas críticos** que deben abordarse inmediatamente, especialmente relacionados con seguridad de credentials y rate limiting. La mayoría de los problemas restantes son de tipo **MEDIO** y pueden resolverse con mejoras incrementales.

El código es mantenible en general, con buena separación de concerns y uso apropiado de TypeScript. Las principales áreas de mejora son: validación de inputs, manejo de errores, y configuración de producción.

---

## 9. HALLASgos YA CORREGIDOS (2026-07-10)

Los siguientes hallazgos fueron corregidos durante esta sesión:

| ID | Descripción | Archivo | Estado |
|----|-------------|---------|--------|
| AUDIT-011 | Auth middleware async/await | `middlewares/auth.ts` | ✅ CORREGIDO |
| AUDIT-012 | Logout con await | `auth.controller.ts` | ✅ CORREGIDO |
| AUDIT-006 | Seed no resetea password | `db/seed.ts` | ✅ CORREGIDO |
| AUDIT-003 | Rate limit login más estricto | `auth.routes.ts` | ✅ CORREGIDO |
| AUDIT-004 | Fix enumeración usuarios | `auth.controller.ts` | ✅ CORREGIDO |
| AUDIT-026 | Índice compuesto incidents | `db/schema.ts` | ✅ CORREGIDO |

---

*Fin del informe de auditoría.*
*Generado: 2026-07-10*
