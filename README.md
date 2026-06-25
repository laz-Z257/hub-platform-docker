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
| **Web** | Vercel | `https://demo-aplicacion-dashboard.vercel.app` |
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
DATABASE_URL=postgres://user:password@localhost:5432/hub_platform
JWT_SECRET=tu_jwt_secret_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_aqui
PORT=3001
NODE_ENV=development
SEED_ADMIN_PASSWORD=admin123
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

## Auditoría de Seguridad Completa

Auditoría integral del repositorio (2026-06-19): **53 hallazgos** (9 críticos, 16 altos, 17 medios, 11 bajos). Documento completo en [`AUDIT-COMPLETA.md`](./AUDIT-COMPLETA.md).

### Resumen por proyecto

| Proyecto | LOC | Archivos | Hallazgos | Principales issues |
|----------|----:|---------:|----------:|--------------------|
| **backend/** | ~2,500 | 36 | 18 | Race condition en auth middleware, JWT fallback vacío, migraciones huérfanas, export sin validación, upload bloqueante |
| **web/** | ~5,200 | 43 | 15 | IP interna hardcodeada, ESLint deshabilitado, API URL hardcodeada, `alert()` en vez de toasts, sin `next/font` |
| **mobile/** | ~4,100 | 32 | 11 | API URL hardcodeada, `.env` en git, sin refresh token, catch blocks vacíos, 3 variantes de marca |
| **shared/** | ~80 | 6 | 2 | No usado como workspace, tipos duplicados en web |
| **docs/** | — | 10 | 7 | `web/README.md` no es README, `ota-server/` vacío, backend README desactualizado, CHANGELOG duplicado |

### Hallazgos críticos (top 5)

| ID | Hallazgo | Proyecto | Prioridad |
|----|----------|----------|:---------:|
| C1 | Race condition en `authMiddleware` — `next()` antes de verificar usuario bloqueado | backend | 🚨 Inmediato |
| C2 | `JWT_REFRESH_SECRET` fallback a string vacío — refresh tokens forjables | backend | 🚨 Inmediato |
| C4 | IP interna `192.168.x.x` hardcodeada en cliente web | web | 🚨 Inmediato |
| C5 | ESLint `ignoreDuringBuilds: true` — errores pasan a producción | web | 🚨 Inmediato |
| C9 | **0 tests** en 117 archivos fuente | todos | 🔴 Corto |

### Estado de issues de auditorías previas

| Auditoría | Fecha | Hallazgos | Pendientes |
|-----------|:----:|:---------:|:----------:|
| `audit-report.md` | 2026-06-09 | 6 críticos | 3 (comentarios, auto-creación, secrets) |
| `AUDIT.md` | 2026-06-10 | 5H/3M/2L | 8 de 10 |
| `AUDIT-COMPLETA.md` | 2026-06-11 | 7C/7H/8M/8L | Reemplazado por esta auditoría |

### Ver documento completo

→ **[`AUDIT-COMPLETA.md`](./AUDIT-COMPLETA.md)** — 53 hallazgos detallados con matriz de rutas, estado de issues previos, y recomendaciones priorizadas (inmediato/corto/mediano/largo plazo).

---

## Changelog

Ver [`CHANGELOG.md`](./CHANGELOG.md) para el historial completo de cambios.

---

### Errores conocidos y soluciones

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

---

## Historial de Sesión — 2026-06-23

### Problema
Tickets creados desde la app móvil no aparecían en el dashboard web (`http://localhost:3000/dashboard/tickets`).

### Diagnóstico
1. **Causa raíz**: `web/src/lib/api.ts` usaba `http://localhost:3001/api` como URL de API (cross-origin), lo que hacía que las cookies de autenticación se perdieran al hacer requests desde `localhost:3000` hacia `localhost:3001`.
2. **Web dashboard detenido**: El servidor de Next.js en `:3000` no estaba corriendo.
3. **Servicios mezclados**: Backend y web se ejecutaban manualmente fuera de Docker, aunque el `docker-compose.yml` ya los tenía definidos.

### Correcciones aplicadas

#### Móvil (Expo)
| Archivo | Cambio |
|---------|--------|
| `mobile/src/services/api.ts` | Agregado timeout de 15s vía `AbortController`; ocultada `API_URL` de errores al usuario |
| `mobile/src/services/storage.ts` | Cambiado `expo-secure-store` de `import()` dinámico a `import * as SecureStore` estático |
| `mobile/app/ajustes.tsx` | Eliminadas llamadas duplicadas a `deleteToken()`/`deleteUser()` antes de `logout()` |
| `mobile/src/screens/LoginScreen.tsx` | Agregado `keyboardType="numeric"` para input de documento |
| `mobile/src/services/notifications.ts` | Agregados campos faltantes `shouldShowBanner` y `shouldShowList` |

#### Web (Next.js)
| Archivo | Cambio |
|---------|--------|
| `web/src/lib/api.ts` | Cambiada `API_URL` para siempre usar `/api` (same-origin vía rewrite de Next.js) en localhost |
| `web/.env` | Eliminado para forzar uso de rewrite local |

#### Infraestructura — Dockerización
| Archivo | Cambio |
|---------|--------|
| `docker-compose.yml` | Agregado `SEED_ADMIN_PASSWORD: admin123` como default para desarrollo |
| `web/Dockerfile` | Agregado `RUN npm install sharp` (necesario para `next/image` en producción) |
| `backend/drizzle/*.sql` | Eliminados 4 archivos de migración huérfanos (`0008_quiet_manifold`, `0009`, `0010`, `0011`) |

### Estado actual
- **PostgreSQL**: Contenedor Docker (`hub-postgres`) en `:5432`
- **Backend API**: `:3001` — manual o Docker (`hub-api`)
- **Web Dashboard**: `:3000` — manual o Docker (`hub-web`)
- **Expo Mobile**: `:8081` — siempre manual (servidor interactivo fuera de Docker)
- **Login**: `POST /api/auth/login` con `{"documento":"123456789","contrasena":"admin123"}` → OK
- **Tickets**: 3 tickets visibles vía API (incluyendo el creado desde mobile)

### Cómo levantar todo

```bash
# Opción 1 — Todo via Docker
cd /home/linux/Escritorio/hub-platform-docker
docker compose up -d --build

# Opción 2 — Manual (hot-reload)
# Terminal 1: PostgreSQL
docker compose up -d postgres
# Terminal 2: Backend
cd backend && npx tsx src/index.ts
# Terminal 3: Web
cd web && npm run dev
# Terminal 4: Mobile
cd mobile && npx expo start --web
```

---

## Historial de Sesión — 2026-06-23 (continuación)

### Problema
Al hacer clic en "Limpiar Caché" en Ajustes, la app mostraba `"Token no proporcionado"` en la consola y el chat no cargaba correctamente al navegar de vuelta.

### Causa raíz
1. **Orden incorrecto en `handleClearCache`**: `localStorage.clear()` se ejecutaba **antes** de `logout()`. Si el token en memoria se había perdido (hot reload), `logout()` intentaba leer de localStorage, encontraba vacío, y enviaba la petición sin `Authorization` → backend respondía "Token no proporcionado".
2. **Sin redirect automático al restaurar sesión**: Al recargar la página web, el token se restauraba de `localStorage` pero el usuario se quedaba en el login o navegaba manualmente al chat sin token en memoria.
3. **Sin protección en ChatScreen**: Si el usuario llegaba a `/chat` sin autenticación, intentaba hacer llamadas API sin token.

### Correcciones aplicadas

| Archivo | Cambio |
|---------|--------|
| `mobile/app/ajustes.tsx` | Movido `localStorage.clear()` **después** de `logout()`; reemplazado `Alert.alert` por `confirmAction()` con `window.confirm` en web; acortado mensaje de confirmación |
| `mobile/src/contexts/AuthContext.tsx` | Agregado `router.replace("/chat")` después de restaurar token exitosamente |
| `mobile/src/screens/LoginScreen.tsx` | Agregado `useEffect` que redirige a `/chat` si ya hay `user` en el contexto |
| `mobile/src/screens/ChatScreen.tsx` | Agregado `if (!user) router.replace("/")` para redirigir al login si no hay sesión |

### Otros cambios del día

| Archivo | Cambio |
|---------|--------|
| `backend/src/modules/ratings/ratings.controller.ts` | Upsert de rating cambiado a `409 Conflict` con mensaje "Ya has calificado este servicio" |
| `mobile/src/components/BotMessageCard.tsx` | Nueva prop `alreadyRated` — muestra "✅ Ya calificado" si es `true` |
| `mobile/src/screens/ChatScreen.tsx` | Verifica `GET /api/ratings/:id` al cargar último incidente; maneja 409 en `handleSubmitRating` |
| `README.md` | Agregada sección **Build APK** con diagnóstico, comandos locales, EAS y OTA |

---

## Build APK — Diagnóstico y Pasos

### Diagnóstico — ¿La máquina está lista para compilar?

| Requisito | Estado | Detalle |
|---|---|---|
| **Java 17** | ✅ | OpenJDK 17.0.17 (Temurin) |
| **Android SDK** | ✅ | `/home/linux/android-sdk` |
| **Build tools** | ✅ | `36.0.0` (requerido por compileSdk 36) |
| **Platform SDK** | ✅ | `android-36` (compileSdk 36) |
| **NDK** | ✅ | `27.1.12297006` (requerido) |
| **`node_modules`** | ✅ | Instalados en `mobile/` |
| **Proyecto prebuilt** | ✅ | `mobile/android/` generado con `npx expo prebuild` |

### Build local (Gradle) — APK para instalar directo

```bash
cd /home/linux/Escritorio/hub-platform-docker/mobile/android
./gradlew assembleRelease
```

**Output**: `mobile/android/app/build/outputs/apk/release/app-release.apk`

Tiempo estimado: **5–15 min** la primera vez (descarga dependencias de Gradle, compila, etc.).

> **Nota**: La APK firma con el **debug keystore** incluido en el proyecto (`android/app/debug.keystore`). Sirve perfecto para instalar directo en el celular. **No sirve para Play Store** (para eso necesitas un keystore propio de release).

### Build con EAS (nube — si hay créditos)

```bash
cd /home/linux/Escritorio/hub-platform-docker/mobile
npx eas build --platform android --profile preview
```

Requiere: `eas-cli` instalado y sesión iniciada con la cuenta Expo `laz65585`.

### OTA Updates (actualización sin reinstalar)

```bash
docker compose --profile build-only run ota-builder
```

Sirve los bundles actualizados vía el servidor OTA en `http://localhost:3002`.

---

### Historial de Sesión — 2026-06-24

### Cambios realizados

#### Web — Calificaciones (Ratings)
| Archivo | Cambio |
|---------|--------|
| `web/src/app/dashboard/ratings/page.tsx:59` | Eliminado truncamiento a 14 caracteres en nombres de PV → se pasa el nombre completo |
| `web/src/components/RatingCharts.tsx:53` | Ancho del YAxis aumentado de 110 a 230px para nombres largos de PV |
| `web/src/components/RatingCharts.tsx` | Limpiados imports no usados (`LineChart`, `Line`, `ScatterChart`, `Scatter`, `CartesianGrid`) y props |
| `web/src/components/RatingCharts.tsx:13` | Agregado filtro `ratedPvs` — solo muestra PVs con al menos 1 calificación |

#### Web — Gestión de Usuarios
| Archivo | Cambio |
|---------|--------|
| `web/src/components/UserFilters.tsx` | Eliminado dropdown de filtro por rol (solo queda buscador) |
| `web/src/app/dashboard/users/page.tsx` | Eliminado estado `roleFilter` y lógica de filtrado por rol |

#### Backend — Notificaciones push en comentarios
| Archivo | Cambio |
|---------|--------|
| `backend/src/modules/incidents/incidents.controller.ts:276-311` | Al agregar comentario a un ticket, se envía notificación push + mensaje del bot al creador del ticket (mismo patrón que resolución) |

### Estado actual del proyecto

- **Web**: Dashboard en `http://localhost:3000` — Docker (`hub-web`)
- **API**: Backend en `http://localhost:3001` — Docker (`hub-api`)
- **DB**: PostgreSQL en `localhost:5432` — Docker (`hub-postgres`)
- **OTA**: Servidor en `http://localhost:3002` — Docker (`hub-ota-server`)
- **Mobile**: Expo dev en `http://localhost:8081`
- **Login**: Documento `123456789`, contraseña `admin123`

### Pendiente

- `mobile/Dockerfile.builder` y servicio `mobile-builder` en docker-compose
- Nginx reverse proxy + Let's Encrypt (SSL)
- Archivos legacy (`render.yaml`, `web/vercel.json`) pendientes de limpieza

---

# Verificación rápida
```bash
# Login
curl -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"documento":"123456789","contrasena":"admin123"}'

# Tickets
CSRF=$(grep 'csrf-token' /tmp/cookies.txt | awk '{print $NF}')
curl -b /tmp/cookies.txt -H "x-csrf-token: $CSRF" \
  http://localhost:3000/api/incidents
```