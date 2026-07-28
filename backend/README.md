# Backend API

API REST del hub-platform. Express + TypeScript + Drizzle ORM + PostgreSQL.

## Stack

- **Node.js 22** + **Express 4** + **TypeScript 5**
- **Drizzle ORM 0.45** + **PostgreSQL 16**
- **Zod 3.24** (validación)
- **JWT** (jsonwebtoken) + **bcryptjs**
- **Helmet** + **CORS** + **CSRF** + **rate-limit**
- **Vitest** (testing)

## Seguridad

### Sesiones Aisladas (2026-07-28)

El sistema implementa **sesiones aisladas** entre dashboard y mobile:

- **Cookies con scope:**
  - Dashboard: `admin_token` + `admin_refreshToken` (path `/`)
  - Mobile: `user_token` + `user_refreshToken` (path `/`)
  - Genéricas: `token`, `refreshToken` (path `/`, legacy)

- **Header X-Auth-Scope:**
  - Dashboard envía `X-Auth-Scope: admin`
  - Mobile envía `X-Auth-Scope: user`
  - Backend usa este header para seleccionar la cookie correcta

- **Logout aislado:**
  - Logout en mobile solo limpia cookies `user_*`
  - Logout en dashboard solo limpia cookies `admin_*`
  - NO incrementa token_version (mantiene otras sesiones activas)

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

### Rate Limiting

- **Global:** 100 requests/min
- **Auth endpoints:** 10 requests/min (register), 3/min (login)
- **Incidents:** 60 requests/min
- **Push register:** 10 requests/min

## Scripts

```bash
npm run dev           # Desarrollo con tsx watch
npm run build         # Compilar TypeScript
npm start             # Producción
npm run db:generate   # Generar migración Drizzle
npm run db:migrate    # Ejecutar migraciones
npm run db:seed       # Poblar DB con datos iniciales
npm run db:setup      # Migrar + seed
npm test              # Vitest run
npm run test:watch    # Vitest watch
```

## Base de Datos

### Tablas (8)

| Tabla | Descripción | Índices |
|-------|-------------|:-------:|
| `users` | Usuarios con roles | 1 |
| `incidents` | Tickets de soporte | 7 |
| `messages` | Mensajes de chat | 2 |
| `incident_comments` | Comentarios en tickets | 1 |
| `ratings` | Calificaciones (CHECK 1-5) | 2 |
| `puntos_venta` | Puntos de venta (~73) | 1 |
| `company_settings` | Configuración empresa | 0 |
| `push_tokens` | Tokens de notificaciones | 1 |

### Enums

| Enum | Valores |
|------|---------|
| `rol` | user, asesor, admin, tecnico |
| `user_estado` | activo, bloqueado |
| `urgencia` | baja, media, alta |
| `estado` | pendiente, en_proceso, resuelto |

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|:----:|-------------|
| POST | /api/auth/login | ❌ | Login (acepta `scope: "admin" \| "user"`) |
| POST | /api/auth/register | ❌ | Registro |
| GET | /api/auth/me | ✅ | Perfil actual |
| POST | /api/auth/refresh | ❌ | Renovar token (scope-aware) |
| POST | /api/auth/logout | ❌ | Cerrar sesión (limpia todas las cookies) |
| GET | /api/incidents | ✅ | Listar incidentes (paginado) |
| POST | /api/incidents | ✅ | Crear incidente |
| GET | /api/incidents/stats | ✅ | Estadísticas |
| GET | /api/incidents/export-data | ✅ | Exportar Excel (con filtros de fecha) |
| GET | /api/users | ✅ | Listar usuarios |
| POST | /api/users | ✅ | Crear usuario |
| PATCH | /api/users/:id | ✅ | Actualizar (verifica duplicado) |
| GET | /api/puntos-venta | ✅ | Listar puntos de venta |
| GET | /api/ratings | ✅ | Estadísticas de calificaciones |
| GET | /api/ratings/stats | ❌ | Stats públicas |
| GET | /api/chat/history | ✅ | Historial chat (paginado, límite 200) |
| GET | /api/dashboard/summary | ✅ | Resumen (N+1 optimizado) |
| GET | /api/metrics | ✅✅ | Métricas (admin only) |

## Cambios Recientes (2026-07-28)

### Seguridad
- ✅ Constraint CHECK en ratings (puntuación 1-5) en base de datos
- ✅ Password mínimo 6 chars en login (verificado)
- ✅ Push token verifica owner antes de reasignar (verificado)
- ✅ `updateUser` verifica documento duplicado (retorna 409) (verificado)
- ✅ `ultima_actividad` throttle cada 5 min (verificado)
- ✅ `/api/metrics` protegido con auth + adminOnly (verificado)
- ✅ `/uploads` protegido con middleware de auth (verificado)

### Pendiente
- ❌ `bloqueado_por` FK sin ON DELETE (requiere migración SQL manual por referencia circular)

### Performance
- ✅ N+1 query en `getSummary` optimizado con GROUP BY (verificado)
- ✅ Chat history con límite 200 y paginación (verificado)
- ✅ Índice compuesto `incidents(user_id, estado)` (verificado)

### Código
- ✅ Seed centralizado en `constants.ts` (verificado)
- ✅ Token version validation en auth middleware

### Sesiones Aisladas (2026-07-24)
- ✅ Cookies con path `/` (antes era `/dashboard` o `/user`)
- ✅ Header `X-Auth-Scope` para aislamiento total
- ✅ `clearAllTokenCookies()` para logout completo
- ✅ `detectRefreshScope()` para refresh scope-aware
- ✅ Prioridad invertida: `admin_token` > `user_token` > `token`