# HUB AI Assistant — Plataforma Multi-Aplicación

> **Última actualización:** 2026-07-03

Repositorio de demostración para una aplicación de soporte corporativo con dashboard admin web, app móvil (Expo), y API backend (Express + PostgreSQL).

---

## 🚀 Quick Start — Para levantar todo desde casa

Solo necesitas **Docker** y **Git**.

```bash
# 1. Clonar
git clone https://github.com/laz-Z257/hub-platform-docker.git
cd hub-platform-docker

# 2. Levantar todo el stack (API + Web + DB + OTA)
docker compose up -d
# Espera ~30s a que todo inicie

# 3. Abrir el dashboard
# http://localhost:3000 — Dashboard Web
# http://localhost:3001/api/health — Health check de la API

# 4. Credenciales de prueba
# Documento: 123456789
# Contraseña: admin123

# 5. Compilar APK (opcional — cuando quieras la app)
docker compose --profile build-only run mobile-builder
# APK generado en: mobile/output/app-release.apk

# 6. Desarrollo mobile en vivo (opcional)
cd mobile
npm install
npx expo start
# Escanea el QR con Expo Go en tu teléfono
```

> **Nota:** La app mobile apunta a `https://hub-platform-api.onrender.com/api` por defecto. Si quieres usar tu propio backend local, crea `mobile/.env` con:
> ```
> EXPO_PUBLIC_API_URL=http://localhost:3001/api
> ```

---

## Resumen de funcionalidades recientes (Julio 2026)

| Fecha | Funcionalidad | Descripción |
|-------|---------------|-------------|
| 2026-07-03 | **Fix múltiples valoraciones** | El usuario solo puede calificar un servicio una vez. Se optimizó la consulta de ratings con un nuevo endpoint `/ratings/my-ratings`. |
| 2026-07-01 | **Chatbot inteligente** | Detección automática de intención del usuario (7 categorías de problemas). Respuestas formales con sugerencias de acciones. |
| 2026-07-01 | **Modo oscuro web** | Dashboard web con tema oscuro completo y variables CSS. |
| 2026-07-01 | **Optimización analytics** | Gráficos con scroll horizontal, memoización de componentes y handlers, loading skeletons. |

---

## Estructura

```
hub-platform/
├── backend/      # API REST (Express + TypeScript + Drizzle ORM + PostgreSQL)
├── web/          # Dashboard Admin (Next.js 15 + React 19 + TailwindCSS + Recharts)
├── mobile/       # App Móvil (Expo SDK 56 + React Native + NativeWind)
├── ota-server/   # Servidor OTA (nginx) para actualizaciones móviles
└── shared/       # Código compartido (tipos, utilidades)
```

---

## Docker — Todos los servicios

Todo el stack corre en Docker. Solo necesitas `docker compose`.

| Servicio | Puerto | Siempre activo | Descripción |
|----------|--------|----------------|-------------|
| **postgres** | 5432 | ✅ | PostgreSQL 16 |
| **api** | 3001 | ✅ | Backend Express |
| **web** | 3000 | ✅ | Dashboard Next.js |
| **ota-server** | 3002 | ✅ | Sirve bundles OTA (nginx) |
| **ota-builder** | — | ❌ Bajo demanda | Genera bundles OTA |
| **mobile-builder** | — | ❌ Bajo demanda | Compila APK Android |

### Comandos básicos

```bash
# Levantar todo
docker compose up -d

# Rebuildear tras cambios
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

### Mobile en Docker

La app móvil **no corre dentro de Docker**. Es una app nativa (React Native/Expo) que se instala en un teléfono. Docker se usa solo para compilar:

| Comando | Qué hace |
|---------|----------|
| `docker compose --profile build-only run mobile-builder` | Compila un APK y lo deja en `mobile/output/` |
| `docker compose --profile build-only run ota-builder` | Genera bundles OTA y los sirve el `ota-server` |

Para desarrollo en vivo:
```bash
cd mobile
npx expo start
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
| `POST` | `/api/auth/register` | No | No | Registrar usuario |
| `POST` | `/api/auth/login` | No | No | Login |
| `GET` | `/api/auth/me` | Sí | No | Datos del usuario actual |
| `POST` | `/api/incidents` | Sí | No | Crear incidente |
| `GET` | `/api/incidents` | Sí | No | Listar incidentes |
| `GET` | `/api/incidents/agentes` | Sí | No | Lista de técnicos únicos |
| `GET` | `/api/incidents/stats` | Sí | No | Estadísticas |
| `GET` | `/api/incidents/:id` | Sí | No | Detalle incidente + comentarios |
| `PATCH` | `/api/incidents/:id` | Sí | Sí | Actualizar estado/agente |
| `DELETE` | `/api/incidents/:id` | Sí | Sí | Eliminar incidente |
| `POST` | `/api/incidents/:id/comments` | Sí | No | Agregar comentario |
| `POST` | `/api/chat/message` | Sí | No | Enviar mensaje al bot |
| `GET` | `/api/chat/history` | Sí | No | Historial de chat |
| `GET` | `/api/dashboard/kpis` | Sí | Sí | KPIs del dashboard |
| `POST` | `/api/ratings/:id` | Sí | No | Calificar incidente resuelto |
| `GET` | `/api/ratings/my-ratings` | Sí | No | IDs de incidentes calificados por el usuario |
| `GET` | `/api/ratings/:id` | Sí | No | Obtener calificación de un incidente |
| `GET` | `/api/ratings` | Sí | Sí | Estadísticas de calificaciones (admin) |
| `GET` | `/api/users` | Sí | Sí | Listar usuarios |
| `PATCH` | `/api/users/:id` | Sí | Sí | Actualizar rol/nombre |
| `PATCH` | `/api/users/:id/toggle-status` | Sí | Sí | Bloquear/desbloquear usuario |

### Chat Bot
- **POST** `/api/chat/message` — Retorna `{ userMessage, botMessage, suggestedActions[] }` con detección de intención por keywords (7 categorías de problema)
- Las respuestas son formales, sin emojis. Texto con `**negrita**` se renderiza en mobile como bold.

### Seguridad

- CORS restrictivo con orígenes explícitos
- Helmet (headers de seguridad)
- Zod en todos los inputs
- JWT con expiración 24h
- Contraseñas con bcrypt (10 salt rounds)
- Rate limiting: 100 req/min global, 10 req/15 min en auth

---

## Web — Dashboard Admin

### Stack
- **Next.js 15.5.19** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS 3.4** + **Recharts 3.x** + **Lucide React**
- **exceljs** (exportación Excel)
- **Modo oscuro** con variables CSS y overrides para todos los textos

### Páginas

| Ruta | Descripción |
|------|---|
| `/login` | Login (muestra mensaje de bloqueo en rojo) |
| `/dashboard` | KPIs, tickets recientes, gestión de usuarios |
| `/dashboard/tickets` | Gestión de tickets con tabla, filtros, acciones |
| `/dashboard/analytics` | Analíticas con gráficos (scroll horizontal, carga lazy, memoizados), exportación Excel |
| `/dashboard/users` | Gestión de usuarios con bloqueo/desbloqueo |
| `/dashboard/ratings` | Calificaciones y estadísticas |

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
| `/` (index) | Login (mensaje de bloqueo en rojo, Alert si estaba en sesión) |
| `/chat` | Chatbot con detección de intención, chips de acciones sugeridas, scroll to bottom flotante |
| `/reportar` | Formulario de reporte de incidente |
| `/exito` | Confirmación post-reporte |
| `/historial` | Lista de incidentes con pull-to-refresh |
| `/incidente/[id]` | Detalle completo del incidente |

### Compilar APK

```bash
# Con Docker
docker compose --profile build-only run mobile-builder

# Sin Docker (requiere Java 17 + Android SDK)
cd mobile/android
./gradlew assembleRelease
```

El APK se genera en `mobile/output/app-release.apk`.

### Desarrollo en vivo

```bash
cd mobile
npm install
npx expo start
```

---

## Credenciales de prueba

| Campo | Valor |
|-------|-------|
| Documento | `123456789` |
| Contraseña | `admin123` |
| Rol | `admin` |

---

## Seed (población inicial)

```bash
cd backend
SEED_ADMIN_PASSWORD=admin123 npx tsx src/db/seed.ts
```

---

## Migraciones

```bash
cd backend
npx drizzle-kit generate
npx tsx src/db/migrate.ts
```

---

## Documentación adicional

- [`CHANGELOG.md`](./CHANGELOG.md) — Historial completo de cambios
- [`AUDIT-COMPLETA.md`](./AUDIT-COMPLETA.md) — Auditoría de seguridad completa (53 hallazgos)
