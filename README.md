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

En el Panel de Analítica hay un dropdown que lista todos los técnicos (agentes) del sistema. Al seleccionar uno:
- Las métricas KPIs se filtran (total incidentes, pendientes, etc.)
- La gráfica de evolución (área) muestra solo incidentes de ese técnico
- La distribución por urgencia (donut) se actualiza
- La **gráfica de barras por estado** muestra pendientes, en proceso y resueltos del técnico

Si se deja en "Todos los técnicos", se muestra el total general.

### Asignar técnico desde tickets

En la tabla de Gestión de Tickets, el menú de acciones (⋮) de cada ticket incluye un campo **"Asignar técnico"** donde se puede escribir el nombre de un técnico. Al asignarlo:
- Se actualiza el incidente con `PATCH /api/incidents/:id { agente: "Nombre" }`
- El técnico aparece automáticamente en el dropdown de Analytics

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

> El `docker-compose.yml` usa la sintaxis `${VAR:-default}`, por lo que si `.env` contiene estas variables, Docker Compose las usará automáticamente. No hay secrets hardcodeados.

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
- Filtro por técnico en analytics (dropdown + endpoints `?agente=`)
- Asignar técnico desde la tabla de tickets (input en menú de acciones)
- Gráfica de barras por estado en Analytics (pendientes, en proceso, resueltos)
- Endpoint `GET /incidents/agentes` (lista de técnicos únicos)
- `GET /incidents/stats` ahora retorna `statusCounts` para la gráfica de barras
- Rate limiting global
- Validación Zod en query params
- Auto-creación de usuario al reportar incidente
- Fix teclado Android (NativeWind → style nativo)
- Fix URLs producción (typo `platafomr` → `platform-api`)
- Seed simplificado (solo admin, sin incidentes falsos)
- Dashboard sin datos hardcodeados
- Next.js 15.5.19 (security patch)

### v2.1 (security fixes)
- P0: Verificación de propiedad en `POST /incidents/:id/comments` (solo dueño o admin)
- P0: SSL `rejectUnauthorized: true` en PostgreSQL (db/index, migrate, seed)
- P0: Secrets en `docker-compose.yml` usan variables de entorno (`${VAR:-default}`)
- Tipos compartidos extraídos a `shared/types/` (evita duplicación web ↔ mobile)

## Errores conocidos y soluciones

### 🐛 Render Docker no arrancaba (`x-render-routing: no-server`)
**Causa:** `process.exit(0)` en `migrate.ts` y `seed.ts` mataba el shell del contenedor Docker antes de que `index.js` arrancara.
**Solución:** Eliminar `process.exit()` de ambos scripts. El shell `;` en el CMD permite que los scripts terminen naturalmente y el servidor arranque.

### 🐛 Render build fallaba en Node.js nativo
**Causa:** El `buildCommand` (`npm run build` → `tsc`) fallaba en Render sin logs claros.
**Solución:** Cambiar el servicio a Docker (más confiable) y ajustar el `render.yaml`.

### 🐛 Teclado no funcionaba en el APK de Android
**Causa:** NativeWind/Tailwind `className` en `TextInput` rompe el input en builds de producción Android. `KeyboardAvoidingView` también contribuía al problema en algunos dispositivos.
**Solución:** Reescribir `Input.tsx` y `LoginScreen.tsx` usando `style={}` nativo de React Native en vez de `className`. Configurar `softwareKeyboardLayoutMode: "resize"` en `app.json`.

### 🐛 `CREATE SCHEMA IF NOT EXISTS "drizzle"` fallaba en PostgreSQL
**Causa:** Drizzle intenta crear un schema `drizzle` para sus migrations, pero el usuario de PostgreSQL no tiene permisos o el schema ya existe.
**Solución:** Capturar el error en `migrate.ts` con try/catch y continuar. Las migraciones se aplican igualmente en el schema `public`.

### 🐛 Reinicios en loop en Render (logs con solo warnings SSL)
**Causa:** Los scripts `migrate.ts` y `seed.ts` tenían pools de PostgreSQL sin `connectionTimeoutMillis`, lo que causaba que se colgaran indefinidamente si la DB no respondía.
**Solución:** Agregar `connectionTimeoutMillis: 10000` y `query_timeout: 15000` a todos los pools. Agregar `timeout 40` en el CMD del Dockerfile para forzar terminación de scripts colgados.