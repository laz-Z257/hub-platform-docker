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
- **express-rate-limit** (protección anti fuerza bruta)

### Endpoints

| Método | Ruta | Auth | Admin | Descripción |
|--------|------|:---:|:---:|---|
| `GET` | `/api/health` | No | No | Health check |
| `POST` | `/api/auth/login` | No | No | Login / auto-registro |
| `GET` | `/api/auth/me` | Sí | No | Datos del usuario actual |
| `POST` | `/api/incidents` | Sí | No | Crear incidente |
| `GET` | `/api/incidents` | Sí | No | Listar incidentes (pag, filtros) |
| `GET` | `/api/incidents/stats` | Sí | No | Estadísticas (timeline + distribución) |
| `GET` | `/api/incidents/:id` | Sí | No | Detalle incidente + comentarios |
| `PATCH` | `/api/incidents/:id` | Sí | Sí | Actualizar estado/agente |
| `DELETE` | `/api/incidents/:id` | Sí | Sí | Eliminar incidente |
| `POST` | `/api/incidents/:id/comments` | Sí | No | Agregar comentario |
| `POST` | `/api/chat/message` | Sí | No | Enviar mensaje al bot |
| `GET` | `/api/chat/history` | Sí | No | Historial de chat |
| `GET` | `/api/dashboard/kpis` | Sí | Sí | KPIs del dashboard |
| `GET` | `/api/users` | Sí | Sí | Listar usuarios (no admin) |
| `PATCH` | `/api/users/:id` | Sí | Sí | Actualizar rol/nombre de usuario |

### Auto-registro

Al crear un incidente desde el móvil, si el documento no existe como usuario, se crea automáticamente. Esto permite que aparezca tanto en Tickets como en Gestión de Usuarios.

### Ejecutar local (Docker)

```bash
cd backend
docker compose up --build -d
```

```bash
# Setup inicial (solo primera vez)
docker compose exec api npx drizzle-kit push
docker compose exec api npx tsx src/db/seed.ts
```

### Variables de entorno (`backend/.env`)

```
DATABASE_URL=postgres://hub_admin:hub_secret@postgres:5432/hub_platform
JWT_SECRET=hub_jwt_secret_dev_2026
PORT=3001
NODE_ENV=development
```

---

## Web — Dashboard Admin

### Stack
- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS 3.4** + **Recharts 3.x** + **Lucide React**
- **exceljs** (exportación Excel)

### Páginas

| Ruta | Descripción |
|------|---|
| `/login` | Login (documento + contraseña) |
| `/dashboard` | Panel de control: KPIs, tickets recientes, gestión de usuarios |
| `/dashboard/tickets` | Gestión de tickets con tabla, filtros, acciones (ver detalle, cambiar estado) |
| `/dashboard/analytics` | Analíticas: gráficos (área + donut), exportación Excel, filtro por fechas |
| `/dashboard/users` | Gestión de usuarios con tabla, búsqueda, filtro por rol, edición de nombre/rol |
| `/` | Redirect a `/login` |

### Ejecutar local

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Abrir `http://localhost:3000`

### Variables de entorno (`web/.env`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Build producción

```bash
npm run build && npm start
```

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

### Ejecutar local

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

### Variables de entorno (`mobile/.env`)

```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### Build APK

```bash
cd mobile
npx eas login
npx eas build --platform android --profile preview
```

El APK se genera en los servidores de Expo (~15 min) y se descarga desde el link que llega por mail o desde el dashboard de Expo.

**Configuración en `eas.json`:**

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://TU-API.onrender.com/api"
      }
    }
  }
}
```

> **Importante:** El perfil `preview` debe llevar `"distribution": "internal"` para que el APK se genere sin firma de Play Store y pueda instalarse directamente en cualquier dispositivo Android. Sin esto, el build se cancela o genera un archivo que Android rechaza al instalar.

**Compatibilidad de dependencias:**

El proyecto requiere TypeScript `~6.0.3` para ser compatible con Expo SDK 56. Usa `npx expo install --check` para verificar que todas las dependencias estén alineadas antes de buildear.

---

## Despliegue

### Backend

| Plataforma | Qué | Costo |
|-----------|-----|-------|
| **Ngrok / Localtunnel** | Túnel HTTPS a localhost | Gratis (PC prendida) |
| **Railway** | API + PostgreSQL | $5/mes crédito gratis |
| **Render** | API Node.js | Gratis (sleep tras 15 min) |
| **Supabase** | PostgreSQL (DB) | Gratis |

#### Túnel rápido (desarrollo)

```bash
# Ngrok
ngrok config add-authtoken TU_TOKEN
ngrok http 3001

# Localtunnel
npx localtunnel --port 3001
```

### Web

| Plataforma | Comando |
|-----------|---------|
| **Vercel** | Root Directory: `web`, Framework: Next.js |

**Variable de entorno en Vercel:**

```
NEXT_PUBLIC_API_URL = https://TU-API.railway.app/api
```

---

## Credenciales de prueba

| Campo | Valor |
|---|---|
| **Documento** | `123456789` |
| **Contraseña** | `user123` |
| **Rol** | `admin` |

---

## Limpiar BD

```bash
docker compose exec api npm run db:seed
```

Esto recrea el admin y 30 incidentes de prueba con nombres reales.

Para vaciar completamente:

```bash
docker compose exec postgres psql "postgres://hub_admin:hub_secret@localhost:5432/hub_platform" \
  -c "TRUNCATE incidents, messages, incident_comments CASCADE; DELETE FROM users WHERE rol != 'admin';"
```

---

## Migraciones

```bash
# Generar
docker compose exec api npx drizzle-kit generate

# Push (sin archivos de migración)
docker compose exec api npx drizzle-kit push
```

---

## Auditoría de seguridad

Resuelta en commit `feat: Railway deploy config, APK build setup, mobile detail screen, audit fixes`. Principales fixes:

- JWT_SECRET sin fallback inseguro
- Rate limiting en `/api/auth/login` (10 intentos / 15 min)
- Cookies con Secure/SameSite condicional
- CORS restrictivo en producción (sin `*` con credenciales)
- Validación Zod en todos los endpoints (chat, dashboard, users)
- Middleware global de errores Express
- `drizzle-orm` actualizado (fix SQL injection CWE-89)
- `next` actualizado a 15.5.19 (fix RCE CVSS 10.0)
- `xlsx` reemplazado por `exceljs` (librería abandonada con 2 HIGH)
