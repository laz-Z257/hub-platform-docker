# Web — Dashboard Admin

Dashboard administrativo para la plataforma HUB AI Assistant.

## Stack

- **Next.js 15.5.19** (App Router) + **React 19** + **TypeScript 5**
- **TailwindCSS 3.4** + **Recharts 3.x** + **Lucide React**
- **exceljs** (exportación Excel)
- **Vitest** (testing)

## Características

### ✅ Sesiones Aisladas (2026-07-24)

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
- Variables CSS centralizadas (`--brand`, `--brand-light`, `--brand-bg`, `--sidebar-width`)
- Área de usuario pendiente (6 pantallas)

### ✅ Sidebar Responsive (CSS Variable)

- Ancho definido como variable CSS `--sidebar-width: 250px`
- Usado en `Sidebar.tsx`, `Topbar.tsx`, `dashboard/layout.tsx`

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/login` | Login admin (documento + contraseña) |
| `/user/login` | Login usuario |
| `/dashboard` | KPIs: tickets, usuarios, resueltos, tickets recientes |
| `/dashboard/tickets` | Gestión de tickets con tabla, filtros, cambio de estado |
| `/dashboard/analytics` | Analíticas: gráficos (área + donut), exportación Excel |
| `/dashboard/users` | Gestión de usuarios: tabla, roles, bloqueo/activación |
| `/dashboard/ratings` | Calificaciones: promedios, gráficos, tabla detallada |
| `/dashboard/settings` | Config empresa, apariencia, mantenimiento |
| `/dashboard/external-systems` | Módulos externos |

### Área Usuario (Mobile Web)

| Ruta | Descripción | Dark Mode |
|------|-------------|:---------:|
| `/user/chat` | Chatbot IA | ❌ |
| `/user/reportar` | Formulario de reporte | ❌ |
| `/user/historial` | Lista de tickets | ❌ |
| `/user/incidente/[id]` | Detalle del incidente | ❌ |
| `/user/ajustes` | Configuración | ❌ |
| `/user/exito` | Confirmación post-reporte | ❌ |

## Componentes (26)

| Categoría | Componentes |
|-----------|-------------|
| **Tickets** | `TicketsTable`, `TicketFilters`, `TicketDetailModal`, `ResolveTicketModal`, `TicketSummaryCards` |
| **Analytics** | `AnalyticsCharts`, `AnalyticsFilters`, `AnalyticsMetrics` |
| **Usuarios** | `UserManagement`, `UsersTable`, `CreateUserModal`, `EditUserModal`, `ResetPasswordModal`, `UserFilters`, `UserSummaryCards` |
| **Ratings** | `RatingCharts`, `RatingSummaryCards`, `RecentRatingsTable` |
| **Layout** | `Sidebar`, `Topbar`, `Pagination`, `HelpModal`, `MetricCard`, `DateRangePicker` |

## Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm start          # Producción (requiere build previo)
npm run lint       # ESLint
npm test           # Vitest
npm run test:watch # Vitest watch
```

## Docker

```bash
docker compose up -d web              # Levantar
docker compose up -d --build web      # Rebuildear
```

Servido en `http://localhost:3000`.

## Cambios Recientes (2026-07-28)

### Verificado
- ✅ Sidebar width usa variable CSS `--sidebar-width` (verificado)
- ✅ Sesiones aisladas con cookies scope (verificado)
- ✅ Exportación Excel con filtros de fecha funcionales (verificado)
- ✅ Dark mode completo en dashboard (verificado)

### Pendiente
- ❌ Dark mode en área de usuario (6 pantallas)
- ❌ Responsive en dashboard (sidebar fijo 250px)
- ❌ Reemplazar `alert()`/`confirm()` nativos con modales
- ❌ Middleware no valida JWT, solo existencia de cookie

### Sesiones Aisladas (2026-07-24)
- ✅ `setAuthScope()` antes de cada request
- ✅ Header `X-Auth-Scope` en todas las peticiones API
- ✅ Fix exportación Excel: filtros de fecha ahora funcionan correctamente
- ✅ Función `getDefaultRange()` con fechas locales (no UTC)
- ✅ `handleExport()` recibe el `filter` actual y calcula el rango correcto