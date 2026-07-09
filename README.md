# HUB AI Assistant - Plataforma Multi-Aplicación

Plataforma de soporte corporativo completa con arquitectura de microservicios containerizados.

> **Estado: En desarrollo** | PWA Mobile implementada - 2026-07-08

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
├── PWA-PLAN-3-PASOS.md      # Plan de migración a PWA
├── PWA-MIGRATION-PLAN.md    # Documentación original de migración PWA
└── render.yaml
```

### Arquitectura General

| Componente | Tecnología | Puerto | Descripción |
|------------|-----------|--------|-------------|
| **postgres** | PostgreSQL 16 | 5432 | Base de datos relacional |
| **api** | Express.js + TypeScript | 3001 | Backend REST API |
| **web** | Next.js 15 (React 19) | 3000 | Dashboard administrativo |
| **ota-server** | nginx Alpine | 3002 | Servidor PWA mobile + proxy API + OTA legacy |
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

### Variables de Entorno Mobile (mobile/.env)

```bash
# Para desarrollo local:
EXPO_PUBLIC_API_URL=http://localhost:3001/api

# Para PWA con cloudflared (temporal):
EXPO_PUBLIC_API_URL=https://abc123.trycloudflare.com/api

# Para producción (Render):
EXPO_PUBLIC_API_URL=https://hub-platform-api.onrender.com/api
```

### Puertos de Servicios

| Servicio | Puerto | URL |
|----------|--------|-----|
| PostgreSQL | 5432 | `postgres://localhost:5432/hub_platform` |
| API Backend | 3001 | `http://localhost:3001/api` |
| Web Dashboard | 3000 | `http://localhost:3000` |
| OTA Server / PWA | 3002 | `http://localhost:3002` (incluye proxy API en `/api/`) |

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

## 10. PWA Mobile (Progressive Web App)

### Por qué PWA?

La app móvil se migró de **APK nativa** a **PWA** para:

- **Eliminar complejidad de build**: No más Java SDK de 8GB ni Android SDK
- **Instalación instantánea**: Sin Play Store, sin APK
- **Acceso universal**: Funciona en cualquier navegador, cualquier dispositivo
- **Actualizaciones automáticas**: Siempre tienes la última versión
- **No requiere compilación**: Un simple `npx expo export` genera el build

### Arquitectura de la PWA

```
                        ┌─────────────────────────────────────┐
                        │           cloudflared                │
                        │   (túnel público temporal)           │
                        │   https://abc123.trycloudflare.com    │
                        └────────────────┬─────────────────────┘
                                         │
                        ┌────────────────▼─────────────────────┐
                        │         nginx :3002                  │
                        │  ┌─────────────────────────────────┐│
                        │  │  Proxy /api/* → api:3001       ││
                        │  │  Serve /hub-mobile/* (PWA)     ││
                        │  │  Serve /ota/* (OTA legacy)     ││
                        │  └─────────────────────────────────┘│
                        └────────────────┬─────────────────────┘
                                         │
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
   ┌──────▼──────┐              ┌───────▼───────┐             ┌───────▼───────┐
   │  ota-server │              │     api       │             │   postgres    │
   │  (nginx)    │              │   :3001       │             │    :5432      │
   │             │              │               │             │               │
   │ hub-mobile/ │              │ Backend REST  │             │ PostgreSQL 16  │
   │     PWA     │              │ Express+TS    │             │               │
   └─────────────┘              └───────────────┘             └───────────────┘
```

### URLs de la PWA

| Entorno | URL |
|---------|-----|
| Local | `http://localhost:3002/` |
| Red local | `http://<tu-ip>:3002/` |
| Tunnel público | Usar cloudflared (ver abajo) |

### Configuración de nginx (ota-server/nginx.conf)

El servidor nginx actúa como reverse proxy para que todo funcione desde el mismo puerto:

```nginx
server {
    listen 3002;
    server_name _;
    root /usr/share/nginx/html/hub-mobile;

    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    add_header X-Content-Type-Options "nosniff";

    # ===== API PROXY =====
    location /api/ {
        proxy_pass http://api:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # ===== PWA HUB MOBILE =====
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /hub-mobile/ {
        alias /usr/share/nginx/html/hub-mobile/;
        try_files $uri $uri/ /hub-mobile/index.html;
    }

    location /hub-mobile {
        return 301 /hub-mobile/;
    }

    # ===== OTA LEGACY =====
    location /ota/ {
        alias /usr/share/nginx/html/;
        try_files $uri $uri/ /ota/index.html;
    }

    location /ota {
        return 301 /ota/;
    }
}
```

### Generar/Actualizar la PWA ( paso a paso )

**Cuando hagas cambios en el código mobile, sigue estos pasos:**

**1. Configurar la URL de la API en mobile/.env:**

```bash
cd /home/linux/Escritorio/hub-platform-docker/mobile
echo "EXPO_PUBLIC_API_URL=https://TU_LINK_CLOUDFLARED/api" > .env
```

**2. Generar el build web de Expo:**

```bash
npx expo export --platform web --clear
```

**3. Ir a la carpeta raíz del proyecto:**

```bash
cd /home/linux/Escritorio/hub-platform-docker
```

**4. Copiar archivos al contenedor y reiniciar:**

```bash
docker compose build ota-server && docker compose up -d --force-recreate ota-server && docker compose cp mobile/dist/. ota-server:/usr/share/nginx/html/hub-mobile/
```

**5. Regenerar el tunnel cloudflared:**

```bash
./cloudflared tunnel --url http://localhost:3002
```

**6. Usar el nuevo link que cloudflared te da.**

---

### Acceso desde Celular (fuera de la red local)

Usa **cloudflared** para crear un túnel público temporal:

**1. Descargar cloudflared (solo una vez):**

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
chmod +x cloudflared
```

**2. Ejecutar tunnel:**

```bash
./cloudflared tunnel --url http://localhost:3002
```

Te dará un link como:
```
https://abc123.trycloudflare.com
```

**3. Ese link pónlo en el navegador del celular.**

**Nota:** Cada vez que cierres cloudflared y lo vuelvas a abrir, el link cambia.

---

### Link Fijo con Cloudflare (producción)

Para tener un link permanente:

1. Crear cuenta en https://dash.cloudflare.com/
2. Crear un tunnel named:
   ```bash
   cloudflared tunnel create pwa-hub
   ```
3. Configurar en `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <tu-tunnel-id>
   credentials-file: /root/.cloudflared/<tu-tunnel-id>.json

   ingress:
     - hostname: pwa.tudominio.com
       service: http://localhost:3002
     - service: http_status:404
   ```
4. En Cloudflare DNS, agregar CNAME:
   - Name: `pwa`
   - Target: `<tu-tunnel-id>.cfargotunnel.com`
5. Ejecutar:
   ```bash
   cloudflared service run pwa-hub
   ```

Resultado: `https://pwa.tudominio.com`

---

### Instalar PWA en Android

1. Abrir el link de la PWA en Chrome
2. Aparecerá banner "Instalar" o ir a **Menú > Agregar a pantalla de inicio**
3. La app aparece como icono normal en el home

---

### Diferencias con APK

| Característica | PWA | APK |
|---------------|-----|-----|
| Instalación | Instantánea (browser) | Play Store o APK |
| Notificaciones push (Android) | Sí (Chrome) | Sí |
| Notificaciones push (iOS) | No (Safari no soporta) | Sí |
| Offline | Parcial (UI cacheada) | Completo |
| Tamaño | ~0 MB (browser cache) | ~50-100 MB |
| Cámara | `<input type="file">` | expo-camera |

---

### Estructura de archivos de la PWA

```
ota-server/
├── Dockerfile
├── nginx.conf              # Configuración nginx con proxy API
└── usr/share/nginx/html/
    ├── hub-mobile/         # PWA (carpeta principal)
    │   ├── _expo/          # Assets JS/CSS
    │   ├── assets/         # Imágenes y fonts
    │   ├── index.html      # Entry point
    │   ├── favicon.ico
    │   └── metadata.json
    └── ota/                # OTA legacy (para APK Expo)
        ├── _expo/
        ├── assets/
        └── metadata.json
```

---

### Nota sobre persistencia

Los archivos de la PWA se copian **dentro del volumen Docker**. Si haces `docker compose down -v` se perderán.

Para hacerlos persistentes en disco, modifica `docker-compose.yml`:

```yaml
# Cambiar de:
volumes:
  - ota-data:/usr/share/nginx/html:ro

# A:
volumes:
  - ./ota-server/usr/share/nginx/html:/usr/share/nginx/html
```

---

## Licencia

Privado - Todos los derechos reservados

---

## Historial de Desarrollo

### 2026-07-08 - Implementación PWA Mobile

**Lo que se hizo:**

1. Se migró la app mobile de Expo (APK) a **PWA** (Progressive Web App)
2. Se configuró `ota-server` como reverse proxy para servir:
   - PWA en `/` y `/hub-mobile/`
   - API proxy en `/api/` → `api:3001`
   - OTA legacy en `/ota/`
3. Se actualizó `nginx.conf` con proxy_pass a la API
4. Se crearon scripts para generar build PWA con URL de API configurable
5. Se implementó tunnel cloudflared para acceso público temporal

**Archivos modificados:**
- `mobile/app.json` - configuración web PWA
- `mobile/package.json` - scripts para build web
- `ota-server/nginx.conf` - proxy API + rutas PWA
- `docker-compose.yml` - volumen ota-server sin `:ro`
- `README.md` - documentado todo

**Pendiente:**
- [ ] Persistir archivos PWA en disco (actualmente en volumen Docker)
- [ ] Link fijo con Cloudflare tunnel named
- [ ] Dominio propio configurado
- [ ] Posiblemente eliminar Dockerfiles de APK (`Dockerfile.builder`, `Dockerfile.ota`)

**Link de prueba actual:**
```
https://initial-tells-franklin-tire.trycloudflare.com
```

---

### Continuación sugerida para próxima sesión:

1. **Probar PWA completa** - login, chat, reportar incidente, historial
2. **Decidir si mantener APK o solo PWA**
3. **Configurar link fijo** con cuenta Cloudflare
4. **Persisitir archivos PWA** en disco修改 docker-compose.yml
5. **Limpiar código** - eliminar Dockerfiles builder/ota si no se usan
