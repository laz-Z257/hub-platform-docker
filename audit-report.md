# Auditoría de Seguridad y Calidad — hub-platform

Fecha: 2026-06-09

Autor: Informe generado automáticamente (revisión manual realizada)

---

## Resumen ejecutivo

Este documento resume la auditoría completa del proyecto `hub-platform` (backend, web, mobile y shared). Se identificaron varios hallazgos críticos relacionados con control de acceso, manejo de tokens, creación automática de usuarios, validación de entradas y gestión de secretos. Se incluyen evidencias (rutas y archivos), mitigaciones operativas inmediatas, cambios recomendados y un plan de priorización.

## Alcance
- Repositorio revisado: `backend/`, `web/`, `mobile/`, `shared/`.
- Archivos clave inspeccionados (lista completa más abajo).

## Hallazgos críticos (resumen)

1. Comentarios en incidentes sin verificación de propietario
   - Archivo: `backend/src/modules/incidents/incidents.controller.ts`
   - Riesgo: cualquier usuario autenticado puede agregar comentarios a incidentes ajenos si conoce el `id`.

2. Estadísticas accesibles a no-admin
   - Archivo: `backend/src/modules/incidents/incidents.routes.ts` (ruta: `/api/incidents/stats`)
   - Riesgo: divulgación de métricas internas.

3. JWT y datos de usuario almacenados en cookies accesibles por JS
   - Archivo: `web/src/lib/api.ts` (cookie `auth-token` y `auth-user`)
   - Riesgo: XSS puede robar tokens; PII expuesto.

4. Creación automática de usuarios no verificada
   - Archivo: `backend/src/modules/incidents/incidents.controller.ts` (`createIncident`)
   - Riesgo: cuentas fantasma, posibles problemas de privacidad y enumeración.

5. Secrets hardcodeados en `docker-compose.yml`
   - Archivo: `backend/docker-compose.yml` (`POSTGRES_PASSWORD`, `JWT_SECRET`)

6. Falta validación de parámetros de ruta (`:id`) en múltiples endpoints

## Evidencia detallada (fragmentos relevantes)

### 1) `addComment` — falta verificación de propietario

Archivo: `backend/src/modules/incidents/incidents.controller.ts`

Fragmento (resumen):

```ts
// recupera incidente
const [incident] = await db
  .select()
  .from(incidents)
  .where(eq(incidents.id, id))
  .limit(1);

// ... no valida incident.user_id contra req.user.userId

await db.insert(incidentComments).values({ incident_id: id, autor, texto }).returning();
```

Riesgo: un usuario autenticado puede comentar en incidentes que no le pertenecen.

### 2) `GET /api/incidents/stats` — endpoint no protegido

Archivo: `backend/src/modules/incidents/incidents.routes.ts`

Fragmento (resumen):

```ts
router.post('/', validate(createIncidentSchema), createIncident);
router.get('/stats', getStats); // no adminOnly
```

### 3) Token en cookie JS

Archivo: `web/src/lib/api.ts`

Fragmento: `document.cookie = 'auth-token=${token}; path=/; max-age=86400; samesite=lax${isSecure() ? '; secure' : ''}``

Recomendación: backend debe establecer cookie `HttpOnly; Secure; SameSite=Strict` o migrar a otro flujo con refresh tokens.

### 4) Creación automática de usuarios

Archivo: `backend/src/modules/incidents/incidents.controller.ts`

Fragmento (resumen):

```ts
if (!existingUser) {
  const randomPwd = crypto.randomBytes(12).toString('hex');
  const hashed = await bcrypt.hash(randomPwd, 10);
  await db.insert(users).values({ documento, nombre, email: `${documento}@hub.ai`, contrasena: hashed, rol: 'user' });
}
```

Riesgo: creación de cuentas no verificadas y posibilidad de enumeración por `documento`.

## Recomendaciones operativas inmediatas (no requieren cambios en el código fuente)

1. Rotar secretos si `docker-compose.yml` fue compartido o almacenado en repositorio público.
2. Habilitar IP allowlist/VPN para entornos staging/prod hasta aplicar fixes.
3. Añadir WAF y reglas que detecten abuso de `/api/incidents/:id/comments`.
4. Ejecutar `npm audit` en cada subproyecto y priorizar actualizaciones.
5. Habilitar CSP a nivel de hosting para reducir XSS.

Comandos útiles:

```bash
cd backend
npm ci
npm audit --production
cd ../web
npm ci
npm audit --production
cd ../mobile
npm ci
npm audit --production
```

## Cambios de código recomendados (priorizados)

1. Verificar propiedad en `POST /api/incidents/:id/comments` — permitir sólo al propietario (`incident.user_id === req.user.userId`) o a `admin`.
2. Restringir `/api/incidents/stats` con `adminOnly` o scope específico.
3. Migrar almacenamiento de JWT en web a cookie `HttpOnly` emitida por backend o usar refresh tokens.
4. Evitar crear usuarios automáticamente desde `createIncident`; usar flow de invitado o verificación por email.
5. Añadir validación Zod para todos los `params` que contienen `:id` (UUIDs).
6. Revisar `package.json` y alinear `express` y `@types/express`.

## Plan de mitigación y estimaciones (tickets sugeridos)

- P1 (4–8h): Validar propiedad en `POST /api/incidents/:id/comments` + tests.
- P1 (2–4h): Proteger `/api/incidents/stats` (adminOnly) + tests.
- P1 (8–16h): Migración de token web a cookie `HttpOnly` (backend + frontend work + E2E tests).
- P2 (6–12h): Evitar creación automática de usuarios — implementar guest/invite flow.
- P2 (4–8h): Añadir validación Zod para `:id` y mejorar manejo de errores.

## Observabilidad y seguimiento

- Añadir logs de auditoría para operaciones sensibles (crear/actualizar/eliminar incidentes, comentarios, cambios de rol).
- Añadir alertas por patrones inusuales: múltiples comentarios en distintos incidents por un mismo usuario en un corto periodo, intentos de login fallidos, etc.

## Archivos inspeccionados (lista)

- backend/src/index.ts
- backend/src/config/env.ts
- backend/src/lib/jwt.ts
- backend/src/middlewares/auth.ts
- backend/src/middlewares/admin.ts
- backend/src/middlewares/validate.ts
- backend/src/modules/incidents/incidents.routes.ts
- backend/src/modules/incidents/incidents.controller.ts
- backend/src/modules/auth/auth.controller.ts
- backend/src/modules/auth/auth.routes.ts
- backend/src/db/schema.ts
- backend/docker-compose.yml
- backend/Dockerfile
- backend/package.json
- web/src/lib/api.ts
- mobile/src/services/storage.ts

---

Si deseas, puedo generar PRs de ejemplo con los cambios sugeridos (requiere autorización explícita). También puedo añadir un `audit-report.md` en la raíz del repo (este archivo) y un `sre-runbook.md` con pasos operativos. Ya agregué `audit-report.md`.
