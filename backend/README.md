# Backend API

API REST del hub-platform. Express + TypeScript + Drizzle ORM + PostgreSQL.

## Stack

- Express 4
- Drizzle ORM + pg
- Zod (validación)
- JWT (jsonwebtoken)
- bcryptjs
- Helmet + CORS + rate-limit

## Seguridad

### Sesiones Aisladas (2026-07-24)

El sistema implementa **sesiones aisladas** entre dashboard y mobile para evitar conflictos:

- **Cookies con scope:**
  - Dashboard: `admin_token` (path `/`)
  - Mobile: `user_token` (path `/`)
  - Genéricas: `token` (path `/`, legacy)

- **Header X-Auth-Scope:**
  - Dashboard envía `X-Auth-Scope: admin`
  - Mobile envía `X-Auth-Scope: user` (en login)
  - Backend usa este header para seleccionar la cookie correcta

- **Prioridad de extracción:**
  - `admin_token` > `user_token` > `token`
  - Esto evita que el token del mobile se use en el dashboard

### Funciones Clave

```typescript
// backend/src/lib/jwt.ts
setTokenCookies(res, payload, scope)  // Crea cookies con scope
extractToken(req)                      // Extrae token según scope
clearAllTokenCookies(res)              // Limpia todas las cookies
detectRefreshScope(req)                // Detecta scope del refresh token
```

### CORS

- **Desarrollo:** localhost:3000, localhost:8081, IPs privadas
- **Producción:** Definido en `CORS_ORIGIN` (separado por comas)
- **Mobile nginx:** Restringido a `http://localhost:3000`

## Scripts

```bash
npm run dev           # Desarrollo con tsx watch
npm run build         # Compilar TypeScript
npm start             # Producción
npm run db:generate   # Generar migración Drizzle
npm run db:migrate    # Ejecutar migraciones
npm run db:seed       # Poblar DB con datos iniciales
```

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/login | ❌ | Login (acepta `scope: "admin" \| "user"`) |
| POST | /api/auth/register | ❌ | Registro |
| GET | /api/auth/me | ✅ | Perfil actual |
| POST | /api/auth/refresh | ❌ | Renovar token (scope-aware) |
| POST | /api/auth/logout | ❌ | Cerrar sesión (limpia todas las cookies) |
| GET | /api/incidents | ✅ | Listar incidentes |
| POST | /api/incidents | ✅ | Crear incidente |
| GET | /api/incidents/stats | ✅ | Estadísticas |
| GET | /api/incidents/export | ✅ | Exportar Excel (con filtros de fecha) |
| GET | /api/users | ✅ | Listar usuarios |
| POST | /api/users | ✅ | Crear usuario |
| GET | /api/puntos-venta | ✅ | Listar puntos de venta |
| GET | /api/ratings | ✅ | Estadísticas de calificaciones |

## Cambios Recientes (2026-07-27)

### Seguridad
- ✅ Password mínimo 6 chars en login (antes 4)
- ✅ Push token verifica owner antes de reasignar
- ✅ `updateUser` verifica documento duplicado (retorna 409)
- ✅ `ultima_actividad` throttle cada 5 min (reduce writes)
- ✅ `/api/metrics` protegido con auth + adminOnly
- ✅ `/uploads` protegido con middleware de auth (verifica cookies)

### Sesiones Aisladas (2026-07-24)
- ✅ Cookies con path `/` (antes era `/dashboard` o `/user`)
- ✅ Header `X-Auth-Scope` para aislamiento total
- ✅ `clearAllTokenCookies()` para logout completo
- ✅ `detectRefreshScope()` para refresh scope-aware
- ✅ Prioridad invertida: `admin_token` > `user_token` > `token`
