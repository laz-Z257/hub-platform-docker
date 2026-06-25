# Web — Dashboard Admin

Dashboard administrativo para la plataforma HUB AI Assistant.

## Stack

- **Next.js 15.5.19** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS 3.4** + **Recharts 3.x** + **Lucide React**
- **exceljs** (exportación Excel)

## Páginas

| Ruta | Descripción |
|------|---|
| `/login` | Login (documento + contraseña) |
| `/dashboard` | KPIs: tickets, usuarios, resueltos, tickets recientes |
| `/dashboard/tickets` | Gestión de tickets con tabla, filtros, cambio de estado |
| `/dashboard/analytics` | Analíticas: gráficos (área + donut), exportación Excel |
| `/dashboard/users` | Gestión de usuarios: tabla, roles, bloqueo/activación |
| `/dashboard/ratings` | Calificaciones: promedios, gráficos, tabla detallada |

## Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm start          # Producción (requiere build previo)
```

## Docker

```bash
docker compose up -d web              # Levantar
docker compose up -d --build web      # Rebuildear
```

Servido en `http://localhost:3000`.
