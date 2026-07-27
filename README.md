# HUB AI Assistant - Plataforma de Soporte Corporativo

Plataforma de soporte con ticketing, chatbot inteligente y dashboard administrativo.

> **Estado:** ✅ Producción Ready | PWA Completa | Sesiones Aisladas | 2026-07-24

---

## Estructura del Proyecto

```
hub-platform-docker/
├── backend/          # API REST (Express + TypeScript + Drizzle ORM + PostgreSQL)
├── web/              # Dashboard Admin (Next.js 15 + React 19 + TailwindCSS)
├── mobile/           # App Móvil PWA (Expo SDK 56 + React Native + NativeWind)
├── ota-server/       # Servidor nginx para PWA mobile + proxy API
├── shared/           # Tipos TypeScript compartidos (@hub/shared)
├── docker-compose.yml
├── render.yaml       # Deploy backend en Render
└── .env.example
```

## Arquitectura

```
┌──────────────────────────────────────────────────┐
│              Backend API (Render)                 │
│         hub-platform-api.onrender.com             │
│         Express + TypeScript + PostgreSQL          │
│    Sesiones Aisladas + Cookies Scope + CSRF       │
└──────────┬────────────────────┬───────────────────┘
           │                    │
    ┌──────▼──────┐     ┌──────▼──────┐
    │  Dashboard  │     │   Mobile    │
    │  (Docker)   │     │  PWA (Docker)│
    │  Puerto 3000│     │  Puerto 8081 │
    └─────────────┘     └─────────────┘
```

| Componente | Tecnología | Puerto | Descripción |
|------------|-----------|--------|-------------|
| **postgres** | PostgreSQL 16 | 5432 | Base de datos relacional |
| **api** | Express.js + TypeScript | 3001 | Backend REST API con sesiones aisladas |
| **web** | Next.js 15 (React 19) | 3000 | Dashboard administrativo |
| **mobile** | Expo SDK 56 + PWA | 8081 | App móvil PWA instalable |
| **ota-server** | nginx Alpine | 3002 | Proxy API + PWA (opcional) |

---

## Quick Start

```bash
# 1. Clonar y configurar
cp .env.example .env
# Editar .env con valores seguros (ver sección Variables de Entorno)

# 2. Iniciar servicios
docker compose up -d

# 3. Acceder
# Dashboard:  http://localhost:3000
# API:        http://localhost:3001/api/health
```

### Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Documento | `123456789` |
| Contraseña | La definida en `SEED_ADMIN_PASSWORD` del `.env` |
| Rol | `admin` |

---

## Tecnologías

### Backend

- **Runtime:** Node.js 22 (Alpine)
- **Framework:** Express.js 4 + TypeScript 5
- **ORM:** Drizzle ORM 0.45 + PostgreSQL 16
- **Auth:** JWT + bcrypt (10 rounds) + token versioning
- **Validación:** Zod 3.24
- **Seguridad:** Helmet, CORS, CSRF, rate limiting (100/min global, 3/min auth)
- **Testing:** Vitest

### Frontend Web (Dashboard)

- **Framework:** Next.js 15 (App Router) + React 19
- **Estilos:** TailwindCSS 3.4 + dark mode
- **Gráficos:** Recharts 3.x (memoizados)
- **Exportación:** ExcelJS
- **Iconos:** Lucide React

### Mobile

- **Framework:** Expo SDK 56 + React Native 0.85
- **Navegación:** Expo Router (file-based)
- **Estilos:** NativeWind 4 (TailwindCSS para RN)
- **Storage:** expo-secure-store
- **Animaciones:** Reanimated 4 + Gesture Handler
- **Notificaciones:** expo-notifications
- **OTA Updates:** expo-updates

---

## Backend - API REST

### Estructura

```
backend/src/
├── index.ts              # App Express
├── config/env.ts         # Variables de entorno tipadas
├── db/
│   ├── schema.ts         # 8 tablas con índices
│   ├── migrate.ts        # Migraciones Drizzle
│   └── seed.ts           # Admin + ~73 puntos de venta
├── middlewares/
│   ├── auth.ts           # JWT + bloqueo de usuarios
│   ├── admin.ts          # Restricción admin/tecnico
│   ├── validate.ts       # Zod validation
│   ├── csrf.ts           # CSRF protection
│   ├── metrics.ts        # Request metrics
│   └── requestId.ts      # Request ID para logs
└── modules/
    ├── auth/             # Login, register, logout, refresh
    ├── incidents/        # CRUD tickets + comentarios
    ├── chat/             # Chatbot (7 intenciones)
    ├── ratings/          # Calificaciones 1-5
    ├── users/            # Gestión usuarios
    ├── dashboard/        # KPIs y estadísticas
    ├── push/             # Notificaciones push
    ├── puntos-venta/     # Catálogo PDVs
    ├── settings/         # Configuración empresa
    └── upload/           # Subida de imágenes
```

### Endpoints

| Método | Ruta | Auth | Admin | Descripción |
|--------|------|:---:|:---:|---|
| GET | `/api/health` | No | No | Health check |
| GET | `/api/health/db` | No | No | Health check con DB |
| POST | `/api/auth/register` | No | No | Registrar usuario |
| POST | `/api/auth/login` | No | No | Login |
| GET | `/api/auth/me` | Sí | No | Usuario actual |
| POST | `/api/auth/refresh` | No | No | Refrescar token |
| POST | `/api/auth/logout` | Sí | No | Logout |
| POST | `/api/incidents` | Sí | No | Crear incidente |
| GET | `/api/incidents` | Sí | No | Listar (paginado) |
| GET | `/api/incidents/:id` | Sí | No | Detalle + comentarios |
| PATCH | `/api/incidents/:id` | Sí | Sí | Actualizar estado/agente |
| DELETE | `/api/incidents/:id` | Sí | Sí | Eliminar |
| POST | `/api/incidents/:id/comments` | Sí | No | Agregar comentario |
| GET | `/api/incidents/agentes` | Sí | Sí | Lista técnicos |
| GET | `/api/incidents/stats` | Sí | Sí | Estadísticas |
| GET | `/api/incidents/export` | Sí | Sí | Datos para exportar |
| GET | `/api/incidents/unread-count` | Sí | Sí | No leídos |
| PATCH | `/api/incidents/mark-seen` | Sí | Sí | Marcar vistos |
| POST | `/api/chat/message` | Sí | No | Mensaje al bot |
| GET | `/api/chat/history` | Sí | No | Historial chat |
| GET | `/api/dashboard/kpis` | Sí | Sí | KPIs |
| GET | `/api/dashboard/summary` | Sí | Sí | Resumen |
| POST | `/api/ratings/:id` | Sí | No | Calificar incidente |
| GET | `/api/ratings/my-ratings` | Sí | No | Mis calificaciones |
| GET | `/api/ratings` | Sí | Sí | Stats admin |
| GET | `/api/users` | Sí | Sí | Listar usuarios |
| POST | `/api/users` | Sí | Sí | Crear usuario |
| PATCH | `/api/users/:id` | Sí | Sí | Actualizar |
| PATCH | `/api/users/:id/toggle-status` | Sí | Sí | Bloquear/desbloquear |
| PATCH | `/api/users/:id/reset-password` | Sí | Sí | Reset password |
| POST | `/api/push/register` | Sí | No | Registrar token push |
| GET | `/api/puntos-venta` | Sí | No | Puntos de venta |
| GET | `/api/settings` | Sí | Sí | Config empresa |
| PATCH | `/api/settings` | Sí | Sí | Actualizar config |
| POST | `/api/upload` | Sí | Sí | Subir imagen |
| GET | `/api/metrics` | No | No | Métricas |

### Roles

| Acción | user | asesor | admin | tecnico |
|--------|:---:|:---:|:---:|:---:|
| Login mobile | Sí | Sí | Sí | Sí |
| Crear incidentes | Sí | Sí | Sí | Sí |
| Chat | Sí | Sí | Sí | Sí |
| Calificar tickets | Sí | Sí | Sí | Sí |
| Dashboard admin | No | No | Sí | Sí |
| CRUD usuarios | No | No | Sí | Sí |
| Exportar datos | No | No | Sí | Sí |

### Chatbot - Intenciones

| Categoría | Keywords |
|-----------|----------|
| problema_sistema | sistema no funciona, caído, no responde |
| problema_hardware | impresora, lector, pantalla, teclado |
| problema_pv | punto de venta, PDV, caja, terminal |
| problema_acceso | no puedo entrar, contraseña, bloqueado |
| consultar_estado | estado de reporte, ticket, incidente |
| faq | preguntas frecuentes, guía |
| reportar | reportar problema, crear ticket |

---

## Dashboard Web

### Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Login con validación y mensaje de bloqueo |
| `/dashboard` | KPIs, tickets recientes, gestión usuarios |
| `/dashboard/tickets` | CRUD tickets con filtros, paginación, exportar Excel |
| `/dashboard/analytics` | Gráficos (timeline, donut, barras), filtros por agente/fecha |
| `/dashboard/users` | Gestión usuarios, bloqueo, reset password |
| `/dashboard/ratings` | Calificaciones con estadísticas y gráficos |
| `/dashboard/settings` | Config empresa, apariencia, mantenimiento |
| `/dashboard/external-systems` | Módulos externos |

---

## Mobile

### PWA Completa (Progressive Web App)

La aplicación móvil es una **PWA instalable** que funciona tanto en navegadores como en dispositivos móviles.

**Características:**
- ✅ **Instalable** - Se puede agregar a la pantalla de inicio
- ✅ **Offline** - Service Worker cachea assets estáticos
- ✅ **Responsive** - Adaptada para móviles y tablets
- ✅ **Meta tags** - iOS y Android configurados
- ✅ **Iconos** - 192x192 y 512x512
- ✅ **CORS seguro** - Restringido a dominios permitidos

### Pantallas

| Ruta | Descripción |
|------|-------------|
| `/` | Login con validación y bloqueo |
| `/chat` | Chatbot con acciones sugeridas |
| `/reportar` | Formulario de reporte con autocompletado |
| `/exito` | Confirmación post-reporte |
| `/historial` | Lista de incidentes con pull-to-refresh |
| `/incidente/[id]` | Detalle con comentarios y rating |
| `/ajustes` | Configuración y logout |

### Acceder a la PWA

```bash
# 1. Iniciar el contenedor mobile
docker compose up -d mobile

# 2. Acceder desde navegador
# http://localhost:8081

# 3. Instalar como app
# Chrome/Edge: Clic en ícono de instalar en barra de direcciones
# Mobile: "Agregar a pantalla principal"
```

### Compilar APK

```bash
# Con Docker
docker compose --profile build-only run mobile-builder
# Output: mobile/output/app-release.apk

# Con EAS Build (nube)
cd mobile
eas build -p android --profile preview
```

Ver [DISTRIBUCION-APK.md](./DISTRIBUCION-APK.md) para distribución.

---

## Variables de Entorno

### .env (raíz - Docker)

```bash
# PostgreSQL - GENERAR CON: openssl rand -base64 24
POSTGRES_USER=hub_admin
POSTGRES_PASSWORD=<generar_seguro>
DATABASE_URL=postgres://hub_admin:<password>@postgres:5432/hub_platform

# JWT - GENERAR CON: openssl rand -hex 32
JWT_SECRET=<generar_seguro>
JWT_REFRESH_SECRET=<generar_seguro>

# Server
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Security
MAX_LOGIN_ATTEMPTS=5
SEED_ADMIN_PASSWORD=<generar_seguro>

# External systems
NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL=http://192.168.60.66:8100
```

### mobile/.env

```bash
# PWA (Docker local) - URL relativa (proxy nginx)
EXPO_PUBLIC_API_URL=/api

# Desarrollo local (sin proxy)
EXPO_PUBLIC_API_URL=http://localhost:3001/api

# Producción (Render)
EXPO_PUBLIC_API_URL=https://hub-platform-api.onrender.com/api
```

### Seguridad de Sesiones

El sistema implementa **sesiones aisladas** entre dashboard y mobile:

- **Dashboard** usa cookies `admin_token` con header `X-Auth-Scope: admin`
- **Mobile** usa cookies `user_token` con `scope: "user"` en login
- **Cookies** tienen path `/` para que el navegador las envíe a `/api/*`
- **Prioridad** de extracción: `admin_token` > `user_token` > `token`

Esto evita conflictos cuando se usan ambas aplicaciones simultáneamente.

---

## Comandos Útiles

```bash
# Iniciar todos los servicios
docker compose up -d

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f api

# Reiniciar un servicio
docker compose restart api

# Migraciones manual
docker compose exec api npm run db:migrate

# Seed manual
docker compose exec api npm run db:seed

# Tests backend
cd backend && npm test

# Tests web
cd web && npm test
```

---

## Infraestructura

| Servicio | Plataforma | URL |
|----------|------------|-----|
| Backend API | Render | `https://hub-platform-api.onrender.com` |
| Mobile APK | Expo EAS | Build via `eas build` |
| Mobile OTA | Expo EAS | Updates via `eas update` |

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Este archivo |
| `CHANGELOG.md` | Historial de cambios (2026-07-24: PWA, sesiones, export) |
| `PENDIENTES.md` | 6 resueltos, 62 pendientes |
| `AUDIT-COMPLETA.md` | Auditoría de seguridad (46 hallazgos) |
| `PWA-DEPLOY.md` | Guía deploy PWA |
| `DISTRIBUCION-APK.md` | Guía distribución APK |

---

## Cambios Recientes (2026-07-24)

### ✅ Implementado

| Feature | Descripción |
|---------|-------------|
| **PWA Completa** | manifest.json, service worker, meta tags iOS/Android, iconos |
| **Sesiones Aisladas** | Dashboard y mobile no comparten cookies |
| **Export con Filtros** | Excel respeta filtros de fecha (Hoy, Semana, Mes, 30d) |
| **CORS Seguro** | Nginx mobile restringido a localhost:3000 |
| **Cookies Scope** | Header X-Auth-Scope para aislamiento total |

### 📊 Estado de Calidad

- **68 hallazgos totales** → 6 resueltos, 62 pendientes
- **Tests:** 105 pasando en backend
- **TypeScript:** Compila sin errores en backend y web
- **Docker:** Todos los servicios corriendo y saludables

---

Privado - Todos los derechos reservados
