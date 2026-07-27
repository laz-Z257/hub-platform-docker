# Web — Dashboard Admin

Dashboard administrativo para la plataforma HUB AI Assistant.

## Stack

- **Next.js 15.5.19** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS 3.4** + **Recharts 3.x** + **Lucide React**
- **exceljs** (exportación Excel)

## Características (2026-07-24)

### ✅ Sesiones Aisladas

- **Cookies con scope:** Dashboard usa `admin_token` con header `X-Auth-Scope: admin`
- **Persistencia:** Las cookies tienen path `/` para que se envíen a `/api/*`
- **Middleware:** Next.js valida cookies en el servidor antes de renderizar

### ✅ Exportación Excel con Filtros

- **Filtros de fecha funcionales:**
  - "Hoy" → Solo incidentes de hoy
  - "Esta Semana" → Desde el lunes hasta hoy
  - "Este Mes" → Desde el día 1 hasta hoy
  - "Últimos 30 Días" → Últimos 30 días
  - "Rango" → Fechas personalizadas

- **Función `getDefaultRange()`:** Calcula fechas locales (no UTC) para evitar problemas de zona horaria

### ✅ Dark Mode

- Dashboard completo con soporte dark mode
- Área de usuario pendiente (6 pantallas)

## Páginas

| Ruta | Descripción |
|------|---|
| `/login` | Login (documento + contraseña) |
| `/dashboard` | KPIs: tickets, usuarios, resueltos, tickets recientes |
| `/dashboard/tickets` | Gestión de tickets con tabla, filtros, cambio de estado |
| `/dashboard/analytics` | Analíticas: gráficos (área + donut), exportación Excel con filtros |
| `/dashboard/users` | Gestión de usuarios: tabla, roles, bloqueo/activación |
| `/dashboard/ratings` | Calificaciones: promedios, gráficos, tabla detallada |

## Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm start          # Producción (requiere build previo)
npm run lint       # ESLint
npm test           # Vitest
```

## Docker

```bash
docker compose up -d web              # Levantar
docker compose up -d --build web      # Rebuildear
```

Servido en `http://localhost:3000`.

## Cambios Recientes (2026-07-27)

### UI
- ✅ Botón "Editar" removido del menú de acciones en gestión de usuarios

### Sesiones Aisladas (2026-07-24)
- ✅ `setAuthScope()` antes de cada request
- ✅ Header `X-Auth-Scope` en todas las peticiones API
- ✅ Fix exportación Excel: filtros de fecha ahora funcionan correctamente
- ✅ Función `getDefaultRange()` con fechas locales (no UTC)
- ✅ `handleExport()` recibe el `filter` actual y calcula el rango correcto
