# HUB AI Assistant - Plataforma Multi-Aplicación

Plataforma de soporte corporativo completa con arquitectura de microservicios containerizados.

## Tabla de Contenidos

1. [Estructura General](#1-estructura-general-del-proyecto)
2. [Tecnologías Utilizadas](#2-tecnologías-utilizadas)
3. [Docker](#3-docker)
4. [Backend](#4-backend)
5. [Frontend Web](#5-frontend-web)
6. [Mobile](#6-mobile)
7. [Configuración](#7-configuración-general)
8. [Documentación Adicional](#8-documentación-adicional)
9. [Cómo Funciona Todo Junto](#9-cómo-funciona-todo-junto)

---

## 1. Estructura General del Proyecto

```
hub-platform-docker/
├── backend/          # API REST (Express + TypeScript + Drizzle ORM + PostgreSQL)
├── web/              # Dashboard Admin (Next.js 15 + React 19 + TailwindCSS)
├── mobile/           # App Móvil (Expo SDK 56 + React Native + NativeWind)
├── ota-server/       # Servidor OTA (nginx) para actualizaciones móviles
├── shared/           # Código compartido (tipos TypeScript)
├── docker-compose.yml
├── .env / .env.example
├── README.md, CHANGELOG.md, TODO.md, AUDIT-COMPLETA.md
└── render.yaml
```

### Arquitectura General

| Componente | Tecnología | Puerto | Descripción |
|------------|-----------|--------|-------------|
| **postgres** | PostgreSQL 16 | 5432 | Base de datos relacional |
| **api** | Express.js + TypeScript | 3001 | Backend REST API |
| **web** | Next.js 15 (React 19) | 3000 | Dashboard administrativo |
| **ota-server** | nginx Alpine | 3002 | Servidor de bundles OTA |
| **mobile-builder** | Node + Java 17 + Android SDK | - | Compilador de APK (bajo demanda) |
| **ota-builder** | Expo/React Native | - | Generador de bundles OTA (bajo demanda) |

---

## 2. Tecnologías Utilizadas

### Backend

- **Runtime**: Node.js 22 (Alpine)
- **Framework**: Express.js 4 + TypeScript 5
- **ORM**: Drizzle ORM 0.45
- **Base de datos**: PostgreSQL 16
- **Auth**: JWT (jsonwebtoken) + bcryptjs (10 salt rounds)
- **Validación**: Zod 3.24
- **Seguridad**: Helmet (headers), CORS, express-rate-limit
- **Logging**: Morgan + logger personalizado
- **Testing**: Vitest

### Frontend Web

- **Framework**: Next.js 15.5.19 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: TailwindCSS 3.4
- **Gráficos**: Recharts 3.x
- **Iconos**: Lucide React
- **Exportación**: ExcelJS
- **Dark Mode**: Soporte completo con CSS variables

### Mobile (React Native)

- **Framework**: Expo SDK 56
- **React Native**: 0.85
- **Navegación**: Expo Router (file-based)
- **Estilos**: NativeWind 4 (TailwindCSS para RN)
- **Almacenamiento seguro**: expo-secure-store
- **Animaciones**: Reanimated 4 + Gesture Handler
- **Notificaciones**: expo-notifications
- **Actualizaciones OTA**: expo-updates

### Código Compartido

- Paquete `@hub/shared` con tipos TypeScript reutilizables entre backend, web y mobile

---

## 3. Docker

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    healthcheck: pg_isready cada 5s
    restart: unless-stopped

  api:
    build: ./backend
    ports: ["3001:3001"]
    depends_on: postgres (con condition service_healthy)
    environment:
      - DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
      - PORT=3001, NODE_ENV, CORS_ORIGIN
      - SEED_ADMIN_PASSWORD
    restart: unless-stopped

  web:
    build: ./web (multi-stage)
    ports: ["3000:3000"]
    NEXT_PUBLIC_API_URL=http://api:3001/api
    depends_on: api
    restart: unless-stopped

  ota-server:
    build: ./ota-server
    ports: ["3002:3002"]
    volumes: ota-data:/usr/share/nginx/html:ro
    restart: unless-stopped

  ota-builder:
    build: ./mobile (Dockerfile.ota)
    profiles: [build-only]
    volumes: ota-data:/output

  mobile-builder:
    build: . (mobile/Dockerfile.builder)
    profiles: [build-only]
    volumes: ./mobile/output:/output
```

### Dockerfiles Individuales

**Backend Dockerfile** (multi-stage):
- Build: Instala deps, compila TypeScript
- Prod: Copia dist, usa `node:22-alpine`
- CMD: Migra BD, ejecuta seed, inicia servidor

**Web Dockerfile** (multi-stage):
- deps: Instala npm deps
- build: `next build` con shared/
- runner: Output standalone + sharp

**OTA Server** (nginx):
- Imagen nginx:alpine
- Puerto 3002
- Headers CORS permisivos para Expo

**Mobile Builder** (Java 17 + Android SDK):
- Node 22 + OpenJDK 17
- Android SDK command-line tools
- Build tools 36.0.0, platform android-36

---

## 4. Backend

### Estructura de Archivos

```
backend/src/
├── index.ts              # App principal Express
├── config/env.ts         # Variables de entorno tipadas
├── db/
│   ├── index.ts          # Pool PostgreSQL + drizzle instance
│   ├── schema.ts         # Definición de tablas
│   ├── migrate.ts        # Script de migraciones
│   └── seed.ts           # Datos iniciales
├── lib/
│   ├── jwt.ts            # JWT utilities (sign, verify, cookies)
│   └── logger.ts         # Logging winston-like
├── middlewares/
│   ├── auth.ts           # Verificación JWT
│   ├── admin.ts          # Restricción admin/tecnico
│   ├── validate.ts       # Validación Zod
│   ├── csrf.ts           # Protección CSRF
│   ├── metrics.ts        # Métricas de requests
│   └── requestId.ts      # Request ID para logs
└── modules/
    ├── auth/             # Login, register, logout, refresh
    ├── incidents/        # CRUD incidentes + comentarios
    ├── chat/             # Chatbot con detección de intención
    ├── ratings/          # Sistema de calificaciones
    ├── users/            # Gestión de usuarios
    ├── dashboard/        # KPIs y resúmenes
    ├── push/             # Tokens de notificaciones push
    ├── puntos-venta/     # Puntos de venta
    ├── settings/         # Configuración de empresa
    └── upload/           # Subida de imágenes
```

### Modelos de Datos (Esquema PostgreSQL)

```typescript
// Users
users: {
  id: uuid (PK), documento: varchar(20) UNIQUE, nombre, email,
  contrasena: varchar(255), rol: enum(user|asesor|admin|tecnico),
  estado: enum(activo|bloqueado), intentos_fallidos,
  bloqueado_por: uuid (FK users), token_version,
  ultima_actividad: timestamp, created_at
}

// Incidents
incidents: {
  id: uuid (PK), user_id: uuid (FK users),
  nombre, documento, punto_venta, telefono, descripcion: text,
  urgencia: enum(baja|media|alta), estado: enum(pendiente|en_proceso|resuelto),
  agente: varchar, solucion: text, imagen_url,
  cerrado_por: uuid (FK users), fecha_cierre: timestamp,
  visto_por_admin: boolean, created_at, updated_at
}

// Messages (Chat)
messages: {
  id: uuid (PK), user_id: uuid (FK users),
  content: text, is_bot: boolean, created_at
}

// Incident Comments
incident_comments: {
  id: uuid (PK), incident_id: uuid (FK incidents),
  autor, texto: text, fecha
}

// Ratings
ratings: {
  id: uuid (PK), incident_id: uuid (FK incidents) UNIQUE,
  user_id: uuid (FK users), puntuacion: int, comentario: text, created_at
}

// Puntos de Venta
puntos_venta: { id: uuid, nombre: varchar UNIQUE, activo, created_at }

// Push Tokens
push_tokens: { id: uuid, user_id: uuid (FK users), token: varchar UNIQUE }

// Company Settings
company_settings: { id: uuid, nombre, contribuyente, direccion, updated_at }
```

### Endpoints API REST

| Método | Ruta | Auth | Admin | Descripción |
|--------|------|:---:|:---:|---|
| GET | `/api/health` | No | No | Health check |
| POST | `/api/auth/register` | No | No | Registrar usuario |
| POST | `/api/auth/login` | No | No | Login |
| GET | `/api/auth/me` | Sí | No | Datos del usuario actual |
| POST | `/api/auth/refresh` | No | No | Refrescar token |
| POST | `/api/auth/logout` | Sí | No | Logout |
| POST | `/api/incidents` | Sí | No | Crear incidente |
| GET | `/api/incidents` | Sí | No | Listar incidentes (paginado) |
| GET | `/api/incidents/:id` | Sí | No | Detalle + comentarios |
| PATCH | `/api/incidents/:id` | Sí | Sí | Actualizar estado/agente |
| DELETE | `/api/incidents/:id` | Sí | Sí | Eliminar incidente |
| POST | `/api/incidents/:id/comments` | Sí | No | Agregar comentario |
| GET | `/api/incidents/agentes` | Sí | Sí | Lista técnicos |
| GET | `/api/incidents/stats` | Sí | Sí | Estadísticas |
| GET | `/api/incidents/export` | Sí | Sí | Exportar Excel |
| GET | `/api/incidents/unread-count` | Sí | Sí | Contador no leídos |
| PATCH | `/api/incidents/mark-seen` | Sí | Sí | Marcar como vistos |
| POST | `/api/chat/message` | Sí | No | Enviar mensaje al bot |
| GET | `/api/chat/history` | Sí | No | Historial de chat |
| GET | `/api/dashboard/kpis` | Sí | Sí | KPIs |
| GET | `/api/dashboard/summary` | Sí | Sí | Resumen completo |
| POST | `/api/ratings/:id` | Sí | No | Calificar incidente |
| GET | `/api/ratings/my-ratings` | Sí | No | IDs calificados por usuario |
| GET | `/api/ratings/:id` | Sí | No | Obtener calificación |
| GET | `/api/ratings` | Sí | Sí | Estadísticas admin |
| GET | `/api/users` | Sí | Sí | Listar usuarios |
| POST | `/api/users` | Sí | Sí | Crear usuario |
| PATCH | `/api/users/:id` | Sí | Sí | Actualizar usuario |
| PATCH | `/api/users/:id/toggle-status` | Sí | Sí | Bloquear/desbloquear |
| PATCH | `/api/users/:id/reset-password` | Sí | Sí | Reset password |
| POST | `/api/push/register` | Sí | No | Registrar token push |
| GET | `/api/puntos-venta` | Sí | No | Listar puntos de venta |
| GET | `/api/settings` | Sí | Sí | Configuración empresa |
| PATCH | `/api/settings` | Sí | Sí | Actualizar settings |
| POST | `/api/upload` | Sí | Sí | Subir imagen |
| GET | `/api/metrics` | No | No | Métricas |

### Sistema de Chat Bot Inteligente

El módulo de chat incluye detección automática de intención con **7 categorías**:

1. **problema_sistema** - Sistema no funciona, no responde, caído
2. **problema_hardware** - Impresora, lector, pantalla, teclado
3. **problema_pv** - Punto de venta, PDV, caja, terminal
4. **problema_acceso** - No puede entrar, olvida contraseña, bloqueado
5. **consultar_estado** - Estado de reporte, ticket, incidente
6. **faq** - Preguntas frecuentes, guía de uso
7. **reportar** - Reportar problema, crear ticket

Respuestas formales con soporte para `**negrita**` en mobile.

### Seguridad Implementada

- **CORS** restrictivo con orígenes configurables
- **Helmet** headers de seguridad
- **Zod** validación en todos los inputs
- **JWT** con expiración 1h (access) y 7d (refresh)
- **bcrypt** 10 salt rounds para contraseñas
- **Rate limiting**: 100 req/min global, 10 req/15min en auth
- **Bloqueo de usuarios** tras 5 intentos fallidos (configurable)
- **Token versioning** para invalidación de sesiones
- **CSRF** protection con cookies

---

## 5. Frontend Web

### Estructura

```
web/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing/redirect
│   ├── providers.tsx      # Context providers
│   ├── globals.css         # Estilos globales
│   ├── middleware.ts       # Protección de rutas
│   ├── login/
│   │   └── page.tsx        # Login page
│   └── dashboard/
│       ├── layout.tsx      # Dashboard layout con sidebar
│       ├── page.tsx        # Dashboard principal
│       ├── tickets/        # Gestión de tickets
│       ├── analytics/      # Analíticas con gráficos
│       ├── users/          # Gestión de usuarios
│       ├── ratings/        # Calificaciones
│       ├── settings/       # Configuración
│       └── external-systems/
├── components/             # Componentes reutilizables
│   ├── AnalyticsCharts.tsx
│   ├── AnalyticsFilters.tsx
│   ├── MetricCard.tsx
│   ├── TicketsTable.tsx
│   ├── UserManagement.tsx
│   ├── Topbar.tsx
│   ├── Sidebar.tsx
│   └── ...
├── contexts/
│   └── AuthContext.tsx     # Auth provider
└── lib/
    └── api.ts              # Cliente API
```

### Rutas del Dashboard

| Ruta | Descripción |
|------|-------------|
| `/login` | Login con validación y mensaje de bloqueo |
| `/dashboard` | KPIs, tickets recientes, gestión de usuarios |
| `/dashboard/tickets` | Tabla completa de tickets con filtros, paginación |
| `/dashboard/analytics` | Gráficos (timeline, donut, barras), exportación Excel |
| `/dashboard/users` | Gestión de usuarios con bloqueo/desbloqueo |
| `/dashboard/ratings` | Calificaciones con estadísticas y gráficos |
| `/dashboard/settings` | Configuración de empresa |
| `/dashboard/external-systems` | Sistemas externos |

### Características Principales

- **Dark mode** completo con variables CSS
- **Gráficos interactivos** con Recharts (memoizados)
- **Exportación Excel** con ExcelJS
- **Loading skeletons** para mejor UX
- **Notificaciones** con polling a `/incidents/unread-count`
- **Filtros avanzados** por rango de fechas, agente, estado

---

## 6. Mobile

### Estructura

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout con providers
│   ├── index.tsx           # Login
│   ├── chat.tsx            # Chatbot
│   ├── reportar.tsx        # Formulario de reporte
│   ├── exito.tsx           # Confirmación
│   ├── historial.tsx       # Lista de incidentes
│   ├── incidente/[id].tsx  # Detalle de incidente
│   └── ajustes.tsx          # Configuración
├── src/
│   ├── components/         # 18 componentes reutilizables
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ConnectivityContext.tsx
│   ├── services/
│   │   ├── api.ts          # Cliente API con retry/refresh
│   │   ├── storage.ts      # Secure storage
│   │   ├── notifications.ts
│   │   └── logger.ts
│   └── types/
├── package.json
├── app.json                # Config Expo
├── tailwind.config.js
└── Dockerfile.builder      # Para compilar APK
```

### Pantallas

| Ruta | Descripción |
|------|-------------|
| `/` (index) | Login con validación y mensaje de bloqueo |
| `/chat` | Chatbot con acciones sugeridas, scroll to bottom |
| `/reportar` | Formulario de reporte con autocompletado |
| `/exito` | Confirmación post-reporte |
| `/historial` | Lista de incidentes con pull-to-refresh |
| `/incidente/[id]` | Detalle con comentarios y rating |
| `/ajustes` | Configuración y logout |

### Características Móviles

- **NativeWind** (TailwindCSS para RN)
- **Expo Router** navegación file-based
- **expo-secure-store** almacenamiento seguro de token
- **expo-notifications** notificaciones push
- **Reanimated 4** animaciones
- **Gesture Handler** gestos
- **Dark/Light mode** automático
- **Offline banner** cuando no hay conexión
- **Auto-refresco de sesión** con retry logic
- **Manejo de bloqueo de usuarios** con mensaje original del backend

---

## 7. Configuración General

### Variables de Entorno (.env)

```bash
# PostgreSQL
POSTGRES_USER=hub_admin
POSTGRES_PASSWORD=hub_secret
DATABASE_URL=postgres://hub_admin:hub_secret@postgres:5432/hub_platform

# JWT
JWT_SECRET=mi_secret_jwt_seguro_123
JWT_REFRESH_SECRET=mi_refresh_secret_seguro_456

# Server
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Security
MAX_LOGIN_ATTEMPTS=5
SEED_ADMIN_PASSWORD=admin123

# External
NEXT_PUBLIC_EXTERNAL_SYSTEMS_URL=http://192.168.60.66:8100
```

### Puertos de Servicios

| Servicio | Puerto | URL |
|----------|--------|-----|
| PostgreSQL | 5432 | `postgres://localhost:5432/hub_platform` |
| API Backend | 3001 | `http://localhost:3001/api` |
| Web Dashboard | 3000 | `http://localhost:3000` |
| OTA Server | 3002 | `http://localhost:3002` |

### Credenciales de Prueba

| Campo | Valor |
|-------|-------|
| Documento | `123456789` |
| Contraseña | `admin123` |
| Rol | `admin` |

### Seed de Datos

El proyecto incluye un script de seed que:
1. Crea el usuario admin con `SEED_ADMIN_PASSWORD`
2. Inserta ~73 puntos de venta predefinidos

---

## 8. Documentación Adicional

### Archivos de Documentación

- **README.md** - Este archivo
- **CHANGELOG.md** - Historial de cambios del proyecto
- **TODO.md** - Lista de tareas pendientes y mejoras planeadas
- **AUDIT-COMPLETA.md** - Auditoría de seguridad completa con 53 hallazgos documentados

### Changelog Resumen

| Fecha | Cambios |
|-------|---------|
| 2026-07-03 | Fix ratings múltiples |
| 2026-07-01 | Chatbot inteligente, modo oscuro |
| 2026-06-17 | Bloqueo usuarios, notificaciones push |
| 2026-06-16 | Calificaciones, FAQ, comentarios |
| 2026-06-12 | Bloqueo por intentos, reset password |

---

## 9. Cómo Funciona Todo Junto

### Quick Start con Docker

```bash
# Clonar el repositorio
git clone <repo-url>
cd hub-platform-docker

# Copiar variables de entorno
cp .env.example .env

# Iniciar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f
```

### Flujo de Autenticación

1. **Login**: Usuario envía `documento` + `contrasena`
2. **Backend**: Valida, verifica bloqueo, compara bcrypt, genera JWT
3. **Response**: Token en cookie `token` + `refreshToken` (httpOnly)
4. **Cliente**: Guarda token, almacena usuario en contexto
5. **Refresh**: Cada 1h expira el access token, se usa refreshToken para renovarlo

### Flujo de Reporte de Incidente

1. **Mobile**: Usuario completa formulario (nombre, doc, punto de venta, descripción)
2. **API**: Crea incidente en BD con estado `pendiente`
3. **Admin**: Ve incidente en dashboard, puede cambiar estado a `en_proceso` o `resuelto`
4. **Al resolver**: Sistema envía mensaje de chat al usuario + push notification
5. **Usuario**: Puede calificar el servicio (1-5 estrellas)

### Sistema de Chat Bot

1. **Usuario**: Envía mensaje de texto
2. **Backend**: Detecta intención por keywords (7 categorías)
3. **Response**: Texto formal + acciones sugeridas + autoAction
4. **Mobile**: Renderiza con soporte para `**negrita**`

### Actualizaciones OTA

```bash
# Desarrollo en vivo
npx expo start

# Build OTA bundle
docker compose --profile build-only run ota-builder

# Servidor OTA disponible en puerto 3002
```

### Compilación APK

```bash
# Compilar APK con Docker
docker compose --profile build-only run mobile-builder

# Output: mobile/output/app-release.apk
```

---

## Licencia

Privado - Todos los derechos reservados
