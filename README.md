# HUB AI Assistant — Plataforma Multi-Aplicación

Repositorio de demostración para una aplicación de soporte corporativo con dashboard admin web, app móvil (Expo), y API backend (Express + PostgreSQL).

---

## Estructura

```
hub-platform/
├── backend/      # API REST (Express + TypeScript + Drizzle ORM + PostgreSQL)
├── web/          # Dashboard Admin (Next.js 15 + React 19 + TailwindCSS + Recharts)
├── mobile/       # App Móvil (Expo SDK 56 + React Native + NativeWind)
└── shared/       # Código compartido (tipos, utilidades)
```

---

## Backend — API

### Stack
- **Express.js 4** + **TypeScript 5**
- **Drizzle ORM** + **PostgreSQL 16**
- **JWT** (auth) + **bcryptjs** (passwords) + **Zod** (validación)
- **Helmet** + **CORS** + **Morgan** (logging)
- **express-rate-limit** (protección anti fuerza bruta global + por endpoint)

### Endpoints

| Método | Ruta | Auth | Admin | Descripción |
|--------|------|:---:|:---:|---|
| `GET` | `/api/health` | No | No | Health check |
| `POST` | `/api/auth/register` | No | No | Registrar usuario (doc + nombre + contraseña) |
| `POST` | `/api/auth/login` | No | No | Login (bloqueado si usuario está bloqueado) |
| `GET` | `/api/auth/me` | Sí | No | Datos del usuario actual |
| `POST` | `/api/incidents` | Sí | No | Crear incidente (auto-crea usuario si documento nuevo) |
| `GET` | `/api/incidents` | Sí | No | Listar incidentes (pag, filtros, búsqueda) |
| `GET` | `/api/incidents/agentes` | Sí | No | Lista de técnicos únicos (para filtro en analítica) |
| `GET` | `/api/incidents/stats` | Sí | No | Estadísticas (timeline + distribución, filtro ?agente=) |
| `GET` | `/api/incidents/:id` | Sí | No | Detalle incidente + comentarios |
| `PATCH` | `/api/incidents/:id` | Sí | Sí | Actualizar estado/agente |
| `DELETE` | `/api/incidents/:id` | Sí | Sí | Eliminar incidente |
| `POST` | `/api/incidents/:id/comments` | Sí | No | Agregar comentario |
| `POST` | `/api/chat/message` | Sí | No | Enviar mensaje al bot |
| `GET` | `/api/chat/history` | Sí | No | Historial de chat |
| `GET` | `/api/dashboard/kpis` | Sí | Sí | KPIs del dashboard (filtro ?start=&end=&agente=) |
| `GET` | `/api/users` | Sí | Sí | Listar usuarios (incluye estado y última actividad) |
| `PATCH` | `/api/users/:id` | Sí | Sí | Actualizar rol/nombre de usuario |
| `PATCH` | `/api/users/:id/toggle-status` | Sí | Sí | Bloquear/desbloquear usuario |

### Gestión de usuarios

- **Registro:** `POST /api/auth/register` crea cuenta con documento + nombre + contraseña
- **Bloqueo:** `PATCH /api/users/:id/toggle-status` alterna entre activo/bloqueado
- **Usuarios bloqueados** reciben 403 al intentar login
- **Última actividad** se actualiza automáticamente en cada request autenticado
- **Auto-creación:** Al reportar un incidente con documento nuevo, el usuario se crea automáticamente

### Filtro por técnico en analítica

Los endpoints `/api/dashboard/kpis` y `/api/incidents/stats` aceptan `?agente=Nombre`.
Usa `GET /api/incidents/agentes` para obtener la lista de técnicos disponibles.

### Rate limiting

- **Global:** 100 req/min por IP (todas las rutas)
- **Auth:** 10 req/15 min en login y register

### Seguridad

- CORS restrictivo con orígenes explícitos (sin wildcard con credenciales)
- Helmet (headers de seguridad)
- Zod en todos los inputs (body, query params)
- JWT con expiración 24h
- Contraseñas con bcrypt (10 salt rounds)
- Rate limiting global + por endpoint

---

## Web — Dashboard Admin

### Stack
- **Next.js 15.5.19** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS 3.4** + **Recharts 3.x** + **Lucide React**
- **exceljs** (exportación Excel)

### Páginas

| Ruta | Descripción |
|------|---|
| `/login` | Login (documento + contraseña) |
| `/dashboard` | Panel de control: KPIs (tickets, usuarios, resueltos), tickets recientes, gestión de usuarios |
| `/dashboard/tickets` | Gestión de tickets con tabla, filtros, acciones (ver detalle, cambiar estado) |
| `/dashboard/analytics` | Analíticas: gráficos (área + donut), exportación Excel, filtro por fechas y técnico |
| `/dashboard/users` | Gestión de usuarios: tabla con nombre, rol, estado, última actividad, bloquear/activar |
| `/` | Redirect a `/login` |

### Filtro por técnico en Analytics

En el Panel de Analítica hay un dropdown que lista todos los técnicos (agentes) del sistema. Al seleccionar uno, las métricas KPIs, la gráfica de evolución y la distribución por urgencia se filtran para mostrar solo los datos de ese técnico.

---

## Móvil — App Expo

### Stack
- **Expo SDK 56** + **React Native 0.85**
- **Expo Router** (file-based navigation)
- **NativeWind 4** (TailwindCSS para React Native)
- **expo-secure-store** (almacenamiento seguro del token)
- **Reanimated 4** + **Gesture Handler** (animaciones)

### Pantallas

| Ruta | Descripción |
|------|---|
| `/` (index) | Login (documento + contraseña) |
| `/chat` | Chatbot con IA, menú expandible, tarjeta de último ticket |
| `/reportar` | Formulario de reporte de incidente |
| `/exito` | Pantalla de éxito post-reporte con acceso rápido al detalle |
| `/historial` | Lista de incidentes con pull-to-refresh, tap → detalle |
| `/incidente/[id]` | Detalle completo del incidente (datos + comentarios) |

### Fix de teclado Android

En builds de producción (APK), NativeWind en TextInput causaba que el teclado no funcionara. Solución: el componente `Input` usa `style` nativo de React Native en vez de `className`. Además se configuró `softwareKeyboardLayoutMode: "resize"` en `app.json`.

---

## Despliegue

### Producción

| Servicio | Plataforma | URL |
|----------|-----------|-----|
| **API** | Render (Docker) | `https://hub-platform-api.onrender.com` |
| **Web** | Vercel | `https://web-a-74c5ba6d.vercel.app` |
| **DB** | Render PostgreSQL 16 | Interna |
| **APK** | EAS Build (Expo) | Link por email |

### Local

```bash
# Terminal 1 — Backend
cd backend
docker compose up -d postgres   # o usar DB local
npx tsx src/index.ts

# Terminal 2 — Web
cd web
npm run dev

# Terminal 3 — Mobile
cd mobile
npx expo start
```

### Variables de entorno

**Backend (`backend/.env`):**
```
DATABASE_URL=postgres://hub_admin:hub_secret@localhost:5432/hub_platform
JWT_SECRET=hub_jwt_secret_dev_2026
PORT=3001
NODE_ENV=development
```

**Web (`web/.env`):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Móvil (`mobile/.env`):**
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Credenciales de prueba

| Campo | Valor |
|---|---|
| **Documento** | `123456789` |
| **Contraseña** | `admin123` |
| **Rol** | `admin` |

---

## Seed (población inicial)

```bash
cd backend
npx tsx src/db/seed.ts
```

Crea el usuario admin. La contraseña se toma de `SEED_ADMIN_PASSWORD` o se genera aleatoria (se muestra en consola). Ya no genera incidentes de prueba.

```bash
SEED_ADMIN_PASSWORD=admin123 npx tsx src/db/seed.ts
```

---

## Migraciones

```bash
cd backend
npx drizzle-kit generate   # generar
npx tsx src/db/migrate.ts  # ejecutar
```

---

## Auditoría de seguridad

Resuelta. Principales fixes aplicados:

| Área | Fix |
|------|-----|
| Rate limiting | Global (100 req/min) + auth (10 req/15min) |
| Validación | Zod en body y query params de todos los endpoints |
| Autenticación | JWT sin fallback inseguro, bloqueo de usuarios |
| CORS | Orígenes explícitos, sin wildcard con credenciales |
| Passwords | bcrypt 10 rounds, seed desde env var |
| Dependencias | drizzle-orm actualizado, Next.js 15.5.19 (fix RCE) |
| Logs | Morgan en dev, errores sin stack traces en producción |
| Docker | Sin hardcodeos, health check con timeouts adecuados |

---

## Changelog

### v2 (actual)
- Registro de usuarios (`/auth/register`)
- Bloqueo/desbloqueo de usuarios (`/users/:id/toggle-status`)
- Columnas `estado` y `ultima_actividad` en users
- Filtro por técnico en analytics (dropdown + endpoints)
- Rate limiting global
- Validación Zod en query params
- Auto-creación de usuario al reportar incidente
- Fix teclado Android (NativeWind → style nativo)
- Fix URLs producción (typo `platafomr` → `platform-api`)
- Seed simplificado (solo admin, sin incidentes falsos)
- Dashboard sin datos hardcodeados
- Next.js 15.5.19 (security patch)