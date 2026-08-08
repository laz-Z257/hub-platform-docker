# HUB AI Assistant - Plataforma de Soporte Corporativo

Plataforma de soporte con ticketing, chatbot inteligente y dashboard administrativo.

> **Estado:** ✅ Código listo para producción | PWA Completa | Sesiones Aisladas | Soft Deletes | 2026-08-04

---

## Estructura del Proyecto

```
hub-platform-docker/
├── backend/          # API REST (Express + TypeScript + Drizzle ORM + PostgreSQL)
├── web/              # Dashboard Admin (Next.js 15 + React 19 + TailwindCSS)
├── mobile/           # App Móvil PWA (Expo SDK 56 + React Native + NativeWind)
├── shared/           # Tipos TypeScript compartidos (@hub/shared)
├── docker-compose.yml
├── render.yaml       # Deploy backend en Render (alternativo)
└── .env.example
```

## Arquitectura

```
┌──────────────────────────────────────────────────┐
│          Backend API (Docker / Render)              │
│       URL definida por el despliegue elegido        │
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

---

## Quick Start (Desarrollo Local)

```bash
# 1. Clonar y configurar
cp .env.example .env
# Editar .env con valores seguros (ver sección Variables de Entorno)

# 2. Iniciar servicios
docker compose up -d

# 3. Acceder
# Dashboard:  http://localhost:3000
# API:        http://localhost:3001/api/health
# Mobile:     http://localhost:8081
```

### Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Documento | `123456789` |
| Contraseña | La definida en `SEED_ADMIN_PASSWORD` del `.env` |
| Rol | `admin` |

---

## Backend - API REST

### Tecnología

- **Runtime:** Node.js 22 (Alpine)
- **Framework:** Express.js 4 + TypeScript 5
- **ORM:** Drizzle ORM 0.45 + PostgreSQL 16
- **Auth:** JWT + bcrypt (10 rounds) + token versioning
- **Validación:** Zod 3.24
- **Seguridad:** Helmet, CORS, CSRF, rate limiting (100/min global, 3/min auth)
- **Testing:** Vitest

### Estructura

```
backend/src/
├── index.ts              # App Express
├── config/env.ts         # Variables de entorno tipadas
├── db/
│   ├── schema.ts         # 8 tablas con índices + constraints
│   ├── migrate.ts        # Migraciones Drizzle
│   └── seed.ts           # Admin + ~73 puntos de venta
├── middlewares/
│   ├── auth.ts           # JWT + bloqueo de usuarios + token version
│   ├── admin.ts          # Restricción admin/tecnico
│   ├── validate.ts       # Zod validation
│   ├── csrf.ts           # CSRF protection
│   ├── metrics.ts        # Request metrics
│   └── requestId.ts      # Request ID para logs
└── modules/
    ├── auth/             # Login, register, logout, refresh
    ├── incidents/        # CRUD tickets + comentarios
    ├── chat/             # Chatbot (7 intenciones)
    ├── ratings/          # Calificaciones 1-5 con constraint CHECK
    ├── users/            # Gestión usuarios
    ├── dashboard/        # KPIs y estadísticas
    ├── push/             # Notificaciones push
    ├── puntos-venta/     # Catálogo PDVs
    ├── settings/         # Configuración empresa
    ├── upload/           # Subida de imágenes
    └── external-systems/ # Redirect a sistemas externos (auth + admin)
```

> 📘 **Documentación detallada de cada módulo** (endpoints, auth, comportamientos): [`backend/src/modules/README.md`](./backend/src/modules/README.md)

### Endpoints

| Método | Ruta | Auth | Admin | Descripción |
|--------|------|:---:|:---:|---|
| GET | `/api/health` | No | No | Health check |
| GET | `/api/health/db` | Sí | Sí | Health check con DB (admin/técnico) |
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
| GET | `/api/incidents/export-data` | Sí | Sí | Datos para exportar |
| GET | `/api/incidents/unread-count` | Sí | Sí | No leídos |
| PATCH | `/api/incidents/mark-seen` | Sí | Sí | Marcar vistos |
| POST | `/api/chat/message` | Sí | No | Mensaje al bot |
| GET | `/api/chat/history` | Sí | No | Historial chat (paginado) |
| GET | `/api/dashboard/kpis` | Sí | Sí | KPIs |
| GET | `/api/dashboard/summary` | Sí | Sí | Resumen |
| POST | `/api/ratings/:id` | Sí | No | Calificar incidente |
| GET | `/api/ratings/my-ratings` | Sí | No | Mis calificaciones |
| GET | `/api/ratings` | Sí | Sí | Stats admin |
| GET | `/api/ratings/stats` | No | No | Stats públicas |
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
| GET | `/api/metrics` | Sí | Sí | Métricas (protegido) |
| GET | `/api/external-systems/:module` | Sí | Sí | Redirect 302 al sistema externo |

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

### Sesiones Aisladas (Dashboard + Mobile)

El sistema implementa **sesiones aisladas** entre dashboard y mobile:

- **Dashboard** usa cookies `admin_token` con header `X-Auth-Scope: admin`
- **Mobile** usa cookies `user_token` con header `X-Auth-Scope: user`
- **Cookies** tienen path `/` para que el navegador las envíe a `/api/*`
- **Prioridad** de extracción: `admin_token` > `user_token` > `token`
- **Logout aislado:** Cerrar sesión en mobile NO cierra dashboard (y viceversa)

Esto evita conflictos cuando se usan ambas aplicaciones simultáneamente.

### Seguridad y Calidad

| Feature | Descripción |
|---------|-------------|
| **Seguridad Backend** | `/uploads` y `/metrics` protegidos con auth |
| **Password Policy** | Login y register exigen mínimo 6 chars |
| **Push Token Security** | Verifica owner antes de reasignar |
| **Ratings Constraint** | CHECK constraint en BD (1-5) |
| **Performance** | N+1 query optimizado, ultima_actividad throttle |
| **updateUser** | Verifica documento duplicado (409) |
| **Chat History** | Límite 200, paginación con offset |
| **Soft Deletes** | Campo `deleted_at` en users e incidents |
| **UPSERT Atómico** | Settings sin race conditions |
| **JWT Solo Cookies** | Token eliminado del body, solo httpOnly cookies |
| **CSRF estable** | Token no rota por llamada (multi-pestaña no rompe sesión) |
| **Documentación API** | OpenAPI/Swagger completo |

---

## Dashboard Web

### Tecnología

- **Framework:** Next.js 15 (App Router) + React 19
- **Estilos:** TailwindCSS 3.4 + dark mode
- **Gráficos:** Recharts 3.x (memoizados)
- **Exportación:** ExcelJS
- **Iconos:** Lucide React
- **Testing:** Vitest

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
| `/dashboard/external-systems` | 16 módulos externos (links seguros vía backend) |

### Funcionalidades

- **Dark mode completo** — dashboard y páginas `/user/*`
- **Dashboard responsive** — sidebar colapsable con breakpoints
- **Modales custom** — sin `alert()` nativos (Modal + useModal)
- **Helpers centralizados** — `utils.ts` y `styles.ts` sin duplicación
- **Exportación Excel** con filtros de fecha
- **Gráficos memoizados** en analytics
- **Sistemas externos seguros** — las URLs viven en el backend; el frontend usa un redirect protegido (`/api/external-systems/:module`)

### Variables

```bash
# El frontend usa ruta relativa /api (NEXT_PUBLIC_API_URL es opcional)
NEXT_PUBLIC_API_URL=http://api:3001/api    # Opcional (Docker interno)
# NEXT_PUBLIC_SUPPORT_WHATSAPP=https://wa.me/573000000000
# NEXT_PUBLIC_SUPPORT_PHONE=+57 300 000 0000
```

### Tests

- ✅ 46 tests de componentes y hooks pasando

---

## Mobile - App PWA

### Tecnología

- **Framework:** Expo SDK 56 + React Native 0.85
- **Navegación:** Expo Router (file-based)
- **Estilos:** NativeWind 4 (TailwindCSS para RN)
- **Storage:** expo-secure-store
- **Animaciones:** Reanimated 4 + Gesture Handler
- **Notificaciones:** expo-notifications
- **Builds nativos y OTA opcionales:** Expo EAS + expo-updates (no incluidos en Docker)

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

### Variables

```bash
# PWA en Docker: ruta relativa (el nginx del contenedor proxya /api → api:3001)
EXPO_PUBLIC_API_URL=/api

# Desarrollo local (sin proxy)
EXPO_PUBLIC_API_URL=http://localhost:3001/api

# Build nativo EAS: URL pública del API
EXPO_PUBLIC_API_URL=https://api.tudominio.com/api
```

### Calidad

- **Logger unificado** — sin `console.log` dispersos
- **Sanitización de input** — ChatInput con límite de 500 chars
- **Constantes de color** — centralizadas en `constants/colors.ts`
- **Error Boundaries** — pantalla de error en vez de crash
- **Crash Reporting** — compatible con Sentry
- **PWA completa** — manifest.json + service worker + iconos
- **Tests** — 14 tests unitarios (Jest)

---

## Deploy a Servidor Docker (VPS)

### Qué debe configurar la persona que despliega

Antes de ejecutar Docker, debe reemplazar los valores de ejemplo en `.env`:

| Variable | Qué debe poner |
|----------|----------------|
| `POSTGRES_USER` | Usuario de PostgreSQL, normalmente `hub_admin` |
| `POSTGRES_PASSWORD` | Contraseña nueva y segura para PostgreSQL |
| `DATABASE_URL` | La misma contraseña anterior dentro de `postgres://usuario:contraseña@postgres:5432/hub_platform` |
| `JWT_SECRET` | Secreto nuevo para firmar sesiones |
| `JWT_REFRESH_SECRET` | Otro secreto nuevo y diferente para refresh tokens |
| `SEED_ADMIN_PASSWORD` | Contraseña inicial del administrador `123456789` |
| `CORS_ORIGIN` | Los dos dominios reales, separados por coma |
| `EXTERNAL_SYSTEMS_URL` | URL del sistema externo, o eliminar la línea si no se usa |

Los valores se generan con los comandos indicados en la tabla de variables. No debe reutilizar los valores del ejemplo ni compartir el archivo `.env`.

El archivo `.env` solo se crea en el servidor:

```bash
cp .env.production.example .env
nano .env
```

La contraseña de `DATABASE_URL` debe coincidir exactamente con `POSTGRES_PASSWORD`. La contraseña del administrador inicial corresponde al documento `123456789`.

### 1. Preparar el servidor

```bash
# Requisitos: Docker + Docker Compose
sudo apt install docker.io docker-compose-v2
git clone <tu-repo> hub-platform && cd hub-platform

# Firewall: abrir solo 80 y 443 (la API 3001 no se expone públicamente)
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

Los puertos internos de API, dashboard y PWA quedan enlazados a `127.0.0.1` en Docker. No deben publicarse mediante reglas adicionales del firewall; el acceso externo debe pasar por Nginx con HTTPS.

### 2. Configurar dominio y variables

```bash
# Los dominios admin.tudominio.com y app.tudominio.com deben apuntar (DNS) a este servidor
cp .env.production.example .env
nano .env   # reemplazar todos los <GENERAR> por secrets
```

**Variables REQUERIDAS (generar con `openssl rand`):**

| Variable | Ejemplo | Cómo generar |
|----------|---------|-------------|
| `POSTGRES_PASSWORD` | `B3kX...` | `openssl rand -base64 24` |
| `JWT_SECRET` | `a1b2...` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `c3d4...` | `openssl rand -hex 32` |
| `SEED_ADMIN_PASSWORD` | `e5f6...` | `openssl rand -hex 16` |
| `CORS_ORIGIN` | `https://admin.tudominio.com,https://app.tudominio.com` | Tus dominios |
| `DATABASE_URL` | `postgres://hub_admin:<password>@postgres:5432/hub_platform` | Misma pass de arriba |
| `EXTERNAL_SYSTEMS_URL` | `https://.../login.xhtml` | URL completa del login del sistema externo (solo si lo usas) |

### 3. Configurar Nginx reverse proxy (en el servidor)

Primero crea `/etc/nginx/sites-available/hub-platform` **solo con HTTP** (certbot agregará HTTPS después):

```nginx
# Dashboard Web
server {
    listen 80;
    server_name admin.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Mobile PWA
server {
    listen 80;
    server_name app.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilita el sitio y prueba antes de pedir los certificados:

```bash
sudo ln -s /etc/nginx/sites-available/hub-platform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Obtén los certificados con certbot (agrega HTTPS y el redirect automáticamente):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d admin.tudominio.com -d app.tudominio.com
sudo systemctl reload nginx
```

### 4. Ajustar variables para producción

En el `.env` del servidor:

```bash
NODE_ENV=production
CORS_ORIGIN=https://admin.tudominio.com,https://app.tudominio.com
```

> ℹ️ No necesitas configurar `NEXT_PUBLIC_API_URL` ni un subdominio para la API: el dashboard usa una ruta relativa `/api` y nginx/Next.js la proxean internamente a `api:3001`.

Crea `mobile/.env` (para build PWA):

```bash
cat > mobile/.env <<'EOF'
# PWA en Docker: ruta relativa (el nginx del contenedor proxya /api → api:3001)
EXPO_PUBLIC_API_URL=/api
EOF
```

> ⚠️ El navegador llama a `app.tudominio.com/api`, y el nginx del contenedor mobile lo proxya a `api:3001`. No necesitas un subdominio separado para la API. Esta URL relativa solo aplica a la PWA servida por Docker; para builds nativos EAS usa la URL pública del API.

### 5. Iniciar todo

```bash
# Construir imágenes (LENTO la primera vez ~30 min)
docker compose build

# Iniciar
docker compose up -d

# Verificar salud
docker compose ps
curl http://localhost:3001/api/health
curl -sL http://localhost:3000 | head -1
```

`/api/health/db` requiere una sesión administrativa y no debe usarse como endpoint público de monitorización. Para monitorización externa usa `/api/health`.

El contenedor `api` ejecuta automáticamente las migraciones y el seed al iniciar. Si un servicio aparece como `unhealthy`, revisar sus logs antes de continuar:

```bash
docker compose logs --tail=100 api
docker compose logs --tail=100 web
docker compose logs --tail=100 mobile
```

Cuando los cuatro servicios estén `healthy`, acceder a:

- `https://admin.tudominio.com` para el dashboard.
- `https://app.tudominio.com` para la PWA.
- `https://admin.tudominio.com/login` para iniciar sesión como administrador.

### 6. Post-deploy

```bash
# Ver logs
docker compose logs -f --tail=50

# Forzar rebuild de un servicio
docker compose build api && docker compose up -d api --force-recreate

# Backup DB
docker exec hub-postgres pg_dump -U hub_admin hub_platform > backup_$(date +%Y%m%d).sql
```

---

## Variables de Entorno

### .env (raíz - Docker)

```bash
# PostgreSQL - GENERAR CON: openssl rand -base64 24
POSTGRES_USER=hub_admin
POSTGRES_PASSWORD=<generar>
DATABASE_URL=postgres://hub_admin:<password>@postgres:5432/hub_platform

# JWT - GENERAR CON: openssl rand -hex 32
JWT_SECRET=<generar>
JWT_REFRESH_SECRET=<generar>

# Server
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Opcionales (tienen defaults)
# PORT=3001
# MAX_LOGIN_ATTEMPTS=5
# JWT_EXPIRES_IN=24h

# Admin password (si no se define, se genera una aleatoria en seed)
SEED_ADMIN_PASSWORD=<generar>

# Sistema externo (solo backend — nunca expuesto al frontend)
EXTERNAL_SYSTEMS_URL=http://192.168.60.66:8100/Seguridad-WEB/XHTML/general/login.xhtml
```

> Las variables de `web/.env` y `mobile/.env` están documentadas en sus secciones correspondientes.

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
| Backend API | Docker o Render | URL definida por el despliegue |
| Mobile PWA | Docker + Nginx | `http://localhost:8081` en local |
| Mobile nativo | Expo EAS (opcional) | `eas build` con perfiles de `mobile/eas.json` |
| Actualizaciones OTA | Expo EAS (opcional) | `eas update`; no hay servidor OTA propio en Docker |

---

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Este archivo |
| `backend/src/modules/README.md` | Documentación de los 11 módulos del backend |
| `CHANGELOG.md` | Historial de cambios |
| `backend/openapi.yaml` | Documentación API REST (OpenAPI 3.0) |

---

## Estado de Calidad (2026-08-04)

### Tests

| Módulo | Tests | Comando |
|--------|:-----:|---------|
| Backend | ✅ 148 pasando | `cd backend && npm test` |
| Web | ✅ 46 pasando | `cd web && npm test` |
| Mobile | ✅ 14 pasando | `cd mobile && npm test` |

### Verificación

- **TypeScript:** Compila sin errores en backend, web y mobile
- **Docker:** Los cuatro servicios definidos en `docker-compose.yml` corriendo y saludables en la verificación local
- **Lint web:** 0 warnings
- **Seguridad:** 0 pendientes críticos (CSRF estable, URLs externas fuera del frontend)
- **Infra:** Métricas Prometheus, PWA con iconos PNG

---

Privado - Todos los derechos reservados
