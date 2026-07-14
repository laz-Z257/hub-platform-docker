# INFORME EXHAUSTIVO - HUB Platform Docker

**Fecha de análisis:** 2026-07-14  
**Proyecto:** HUB AI Assistant - Plataforma Multi-Aplicación  
**Estado:** En desarrollo activo

---

## TABLA DE CONTENIDOS

1. [Arquitectura](#1-arquitectura)
2. [Backend](#2-backend)
3. [Frontend Web](#3-frontend-web)
4. [Mobile](#4-mobile)
5. [Shared](#5-shared)
6. [Seguridad](#6-seguridad)
7. [Código](#7-código)
8. [Docker](#8-docker)
9. [PWA](#9-pwa)
10. [Dependencias](#10-dependencias)
11. [TODO y Pendientes](#11-todo-y-pendientes)
12. [Recomendaciones](#12-recomendaciones)

---

## 1. ARQUITECTURA

### 1.1 Estructura de Carpetas Completa

```
hub-platform-docker/
├── backend/                    # API REST (Express + TypeScript + Drizzle ORM)
│   ├── src/
│   │   ├── index.ts           # App principal Express
│   │   ├── config/env.ts      # Variables de entorno tipadas
│   │   ├── db/
│   │   │   ├── index.ts      # Pool PostgreSQL + drizzle instance
│   │   │   ├── schema.ts     # Definición de 7 tablas
│   │   │   ├── migrate.ts    # Script de migraciones
│   │   │   └── seed.ts      # Datos iniciales
│   │   ├── lib/
│   │   │   ├── jwt.ts        # JWT utilities
│   │   │   └── logger.ts     # Logging estructurado
│   │   ├── middlewares/
│   │   │   ├── auth.ts       # Verificación JWT
│   │   │   ├── admin.ts      # Restricción admin/tecnico
│   │   │   ├── validate.ts   # Validación Zod
│   │   │   ├── csrf.ts       # Protección CSRF
│   │   │   ├── metrics.ts    # Métricas de requests
│   │   │   └── requestId.ts  # Request ID para logs
│   │   └── modules/
│   │       ├── auth/          # Login, register, logout, refresh
│   │       ├── incidents/     # CRUD incidentes + comentarios
│   │       ├── chat/          # Chatbot con detección de intención
│   │       ├── ratings/       # Sistema de calificaciones
│   │       ├── users/         # Gestión de usuarios
│   │       ├── dashboard/     # KPIs y resúmenes
│   │       ├── push/          # Tokens de notificaciones push
│   │       ├── puntos-venta/  # Puntos de venta
│   │       ├── settings/      # Configuración de empresa
│   │       └── upload/        # Subida de imágenes
│   ├── drizzle/               # Migraciones Drizzle
│   ├── dist/                  # Compilación TypeScript
│   ├── uploads/               # Archivos subidos
│   ├── Dockerfile
│   └── package.json
├── web/                       # Dashboard Admin (Next.js 15 + React 19)
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # 24 componentes reutilizables
│   │   ├── contexts/
│   │   └── lib/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── mobile/                    # App Móvil (Expo SDK 56 + React Native)
│   ├── app/                  # Expo Router (file-based)
│   ├── src/
│   │   ├── components/      # 18 componentes
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   ├── assets/
│   ├── app.json
│   ├── Dockerfile.builder
│   ├── Dockerfile.ota
│   └── package.json
├── ota-server/               # Servidor OTA (nginx)
│   ├── Dockerfile
│   └── nginx.conf
├── shared/                   # Código compartido
│   ├── types/
│   ├── index.ts
│   └── package.json
├── docker-compose.yml
├── .env
├── README.md
├── CHANGELOG.md
├── TODO.md
├── AUDIT-COMPLETA.md
├── PWA-DEPLOY.md
├── DISTRIBUCION-APK.md
├── deploy-pwa.sh
└── cloudflared
```

### 1.2 Todos los Servicios Docker

| Servicio | Imagen | Puerto | Descripción | Estado |
|----------|--------|--------|-------------|--------|
| **postgres** | postgres:16-alpine | 5432 | Base de datos relacional | ✅ Corriendo |
| **api** | Build local | 3001 | Backend REST API Express+TS | ✅ Corriendo |
| **web** | Build local | 3000 | Dashboard Next.js | ✅ Corriendo |
| **ota-server** | Build local | 3002 | Nginx + PWA + Proxy API | ✅ Corriendo |
| **ota-builder** | Build local | - | Generador bundles OTA | ⏸️ Profile |
| **mobile-builder** | Build local | - | Compilador APK | ⏸️ Profile |

### 1.3 Relaciones entre Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO MÓVIL (PWA)                       │
│   ┌─────────┐    ┌──────────┐    ┌────────────┐               │
│   │  Login  │───▶│   Chat   │───▶│  Reportar  │               │
│   └─────────┘    └──────────┘    └────────────┘               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (Cloudflare Tunnel)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ota-server (:3002)                           │
│   ┌─────────────────────────────────────────────────────────────┐│
│   │  nginx reverse proxy                                        ││
│   │  ├── /api/* → api:3001 (proxy_pass)                       ││
│   │  ├── /* → PWA dist (hub-mobile)                           ││
│   │  └── /ota/* → OTA legacy                                  ││
│   └─────────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │  api:3001  │    │  web:3000  │    │postgres:5432│
   │  Express   │    │  Next.js   │    │ PostgreSQL │
   └────────────┘    └────────────┘    └────────────┘
```

---

## 2. BACKEND

### 2.1 Todos los Módulos y sus Archivos

| Módulo | Archivos | Descripción |
|--------|----------|-------------|
| **auth** | auth.routes.ts, auth.controller.ts, auth.schema.ts | Autenticación JWT, login, register, logout, refresh |
| **incidents** | incidents.routes.ts, incidents.controller.ts, incidents.schema.ts | CRUD tickets, comentarios, transiciones estado |
| **chat** | chat.routes.ts, chat.controller.ts, chat.schema.ts | Chatbot con detección de intención (7 categorías) |
| **dashboard** | dashboard.routes.ts, dashboard.controller.ts, dashboard.schema.ts | KPIs, resúmenes, estadísticas |
| **users** | users.routes.ts, users.controller.ts, users.schema.ts | CRUD usuarios, bloqueo, reset password |
| **ratings** | ratings.routes.ts, ratings.controller.ts, ratings.schema.ts | Sistema de calificaciones 1-5 estrellas |
| **push** | push.routes.ts, push.controller.ts, push.schema.ts | Registro de tokens Expo Push |
| **puntos-venta** | puntos-venta.routes.ts, puntos-venta.controller.ts | Listado de puntos de venta |
| **settings** | settings.routes.ts, settings.controller.ts | Configuración de empresa |
| **upload** | upload.routes.ts, upload.controller.ts | Subida de imágenes (5MB máx) |

### 2.2 Esquema de Base de Datos Completo

**7 Tablas Principales:**

```sql
users (
  id              uuid PK DEFAULT gen_random_uuid(),
  documento       varchar(20) NOT NULL UNIQUE,
  nombre          varchar(100) NOT NULL,
  email           varchar(150),
  contrasena      varchar(255) NOT NULL,
  rol             enum(user,asesor,admin,tecnico) DEFAULT 'user',
  estado          enum(activo,bloqueado) DEFAULT 'activo',
  intentos_fallidos integer DEFAULT 0,
  bloqueado_por   uuid REFERENCES users(id),
  token_version   integer DEFAULT 0,
  ultima_actividad timestamp,
  created_at      timestamp DEFAULT NOW()
)

incidents (
  id              uuid PK DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  nombre          varchar(100) NOT NULL,
  documento       varchar(20) NOT NULL,
  punto_venta     varchar(150) NOT NULL,
  telefono        varchar(20) DEFAULT '',
  descripcion     text NOT NULL,
  urgencia        enum(baja,media,alta) DEFAULT 'media',
  estado          enum(pendiente,en_proceso,resuelto) DEFAULT 'pendiente',
  agente          varchar(100),
  solucion        text,
  imagen_url      varchar(500),
  cerrado_por     uuid REFERENCES users(id) ON DELETE SET NULL,
  fecha_cierre    timestamp,
  visto_por_admin boolean DEFAULT false,
  created_at      timestamp DEFAULT NOW(),
  updated_at      timestamp DEFAULT NOW()
)

messages (
  id              uuid PK DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  content         text NOT NULL,
  is_bot          boolean DEFAULT false,
  created_at      timestamp DEFAULT NOW()
)

incident_comments (
  id              uuid PK DEFAULT gen_random_uuid(),
  incident_id     uuid REFERENCES incidents(id) ON DELETE CASCADE,
  autor           varchar(100) NOT NULL,
  texto           text NOT NULL,
  fecha           timestamp DEFAULT NOW()
)

ratings (
  id              uuid PK DEFAULT gen_random_uuid(),
  incident_id     uuid REFERENCES incidents(id) ON DELETE CASCADE UNIQUE,
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  puntuacion      integer NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario      text,
  created_at      timestamp DEFAULT NOW()
)

puntos_venta (
  id              uuid PK DEFAULT gen_random_uuid(),
  nombre          varchar(150) NOT NULL UNIQUE,
  activo          boolean DEFAULT true,
  created_at      timestamp DEFAULT NOW()
)

push_tokens (
  id              uuid PK DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  token           varchar(255) NOT NULL UNIQUE,
  created_at      timestamp DEFAULT NOW()
)

company_settings (
  id              uuid PK DEFAULT gen_random_uuid(),
  nombre          varchar(200) DEFAULT '',
  contribuyente   varchar(50) DEFAULT '',
  direccion       text DEFAULT '',
  updated_at      timestamp DEFAULT NOW()
)
```

**Índices:**

| Índice | Campos | Propósito |
|--------|--------|-----------|
| incidents_user_id_idx | user_id | FK lookup |
| incidents_estado_idx | estado | Filter por estado |
| incidents_urgencia_idx | urgencia | Filter por urgencia |
| incidents_created_at_idx | created_at | Ordenamiento |
| incidents_user_estado_idx | (user_id, estado) | Queries combinadas |
| messages_user_id_idx | user_id | Chat history |
| incident_comments_incident_id_idx | incident_id | Comentarios por ticket |
| ratings_incident_id_idx | incident_id | Rating por ticket |
| push_tokens_user_id_idx | user_id | Tokens por usuario |

### 2.3 Todos los Endpoints de API

| Método | Ruta | Auth | Admin | Descripción |
|--------|------|:----:|:-----:|-------------|
| GET | `/api/health` | No | No | Health check |
| POST | `/api/auth/register` | No | No | Registrar usuario |
| POST | `/api/auth/login` | No | No | Login (rate limit: 3/min) |
| GET | `/api/auth/me` | Sí | No | Datos del usuario actual |
| POST | `/api/auth/refresh` | No | No | Refrescar token (rate limit: 30/min) |
| POST | `/api/auth/logout` | Sí | No | Logout |
| POST | `/api/incidents` | Sí | No | Crear incidente |
| GET | `/api/incidents` | Sí | No | Listar incidentes (paginado) |
| GET | `/api/incidents/:id` | Sí | No | Detalle + comentarios |
| PATCH | `/api/incidents/:id` | Sí | **Sí** | Actualizar estado/agente |
| DELETE | `/api/incidents/:id` | Sí | **Sí** | Eliminar incidente |
| POST | `/api/incidents/:id/comments` | Sí | No | Agregar comentario |
| GET | `/api/incidents/agentes` | Sí | **Sí** | Lista técnicos |
| GET | `/api/incidents/stats` | Sí | **Sí** | Estadísticas |
| GET | `/api/incidents/export` | Sí | **Sí** | Exportar Excel |
| GET | `/api/incidents/unread-count` | Sí | **Sí** | Contador no leídos |
| PATCH | `/api/incidents/mark-seen` | Sí | **Sí** | Marcar como vistos |
| POST | `/api/chat/message` | Sí | No | Enviar mensaje al bot |
| GET | `/api/chat/history` | Sí | No | Historial de chat (límite 200) |
| GET | `/api/dashboard/kpis` | Sí | **Sí** | KPIs |
| GET | `/api/dashboard/summary` | Sí | **Sí** | Resumen completo |
| POST | `/api/ratings/:id` | Sí | No | Calificar incidente |
| GET | `/api/ratings/my-ratings` | Sí | No | IDs calificados por usuario |
| GET | `/api/ratings/:id` | Sí | No | Obtener calificación |
| GET | `/api/ratings` | Sí | **Sí** | Estadísticas admin |
| GET | `/api/users` | Sí | **Sí** | Listar usuarios |
| POST | `/api/users` | Sí | **Sí** | Crear usuario |
| PATCH | `/api/users/:id` | Sí | **Sí** | Actualizar usuario |
| PATCH | `/api/users/:id/toggle-status` | Sí | **Sí** | Bloquear/desbloquear |
| PATCH | `/api/users/:id/reset-password` | Sí | **Sí** | Reset password |
| POST | `/api/push/register` | Sí | No | Registrar token push (rate limit: 10/min) |
| GET | `/api/puntos-venta` | Sí | No | Listar puntos de venta |
| GET | `/api/settings` | Sí | **Sí** | Configuración empresa |
| PUT | `/api/settings` | Sí | **Sí** | Actualizar settings |
| POST | `/api/upload` | Sí | **Sí** | Subir imagen (5MB máx) |
| GET | `/api/metrics` | No | No | Métricas del servidor |

### 2.4 Middlewares Usados

| Middleware | Archivo | Función |
|------------|---------|---------|
| **authMiddleware** | middlewares/auth.ts | Verifica JWT, bloquea usuarios, actualiza última actividad |
| **adminOnly** | middlewares/admin.ts | Restringe a roles admin y tecnico |
| **validate** | middlewares/validate.ts | Valida body/query/params con Zod schemas |
| **csrfProtection** | middlewares/csrf.ts | Protección CSRF con cookies + headers |
| **metricsMiddleware** | middlewares/metrics.ts | Recolecta métricas de requests |
| **requestId** | middlewares/requestId.ts | Genera ID único por request |
| **globalLimiter** | index.ts | Rate limit global: 100 req/min |

### 2.5 Validaciones Zod

| Schema | Campos | Validaciones |
|--------|--------|--------------|
| **loginSchema** | documento, contrasena | documento: regex `/^\d+$/`, min 1, max 20; contrasena: min 4 |
| **registerSchema** | documento, nombre, contrasena | documento: regex `/^\d+$/`, min 1, max 20; nombre: min 1, max 100; contrasena: min 6 |
| **createIncidentSchema** | nombre, documento, punto_venta, telefono, descripcion, urgencia | todos requeridos, urgencia: enum |
| **updateIncidentSchema** | estado, agente, solucion, imagen_url | estado: enum(pendiente/en_proceso/resuelto) |
| **createRatingSchema** | puntuacion, comentario | puntuacion: int 1-5; comentario: max 1000 |
| **registerPushSchema** | token | regex `/^[A-Za-z0-9_\-\[\]]+$/`, max 500 |
| **sendMessageSchema** | content | min 1, max 2000 |

### 2.6 Sistema de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE AUTH JWT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ACCESS TOKEN (JWT)                    REFRESH TOKEN (JWT)       │
│  expiresIn: 1h                        expiresIn: 7d             │
│                                                                  │
│  ALMACENAMIENTO: Cookie httpOnly + secure                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    FLUJO DE AUTH                                 │
│                                                                  │
│  1. POST /api/auth/login                                       │
│     └─▶ bcrypt.compare(contrasena, hash)                       │
│     └─▶ si fail: intentos_fallidos++                           │
│     └─▶ si intentos >= 5: estado = "bloqueado"                 │
│                                                                  │
│  2. Auth Middleware en cada request                             │
│     └─▶ verifyToken(token)                                     │
│     └─▶ check users.estado !== "bloqueado"                     │
│                                                                  │
│  3. POST /api/auth/refresh                                     │
│     └─▶ verifyRefreshToken(refreshToken)                       │
│     └─▶ check token_version en BD                              │
│                                                                  │
│  4. POST /api/auth/logout                                      │
│     └─▶ token_version++ (invalida todos los tokens)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.7 Chat Bot - Detección de Intención

**7 Categorías:**

| Categoría | Keywords | Ejemplos |
|-----------|----------|----------|
| **problema_sistema** | 20+ patterns | "sistema no funciona", "app no responde" |
| **problema_hardware** | 22+ patterns | "impresora no imprime", "pantalla negra" |
| **problema_pv** | 16+ patterns | "punto de venta no abre", "pdv no funciona" |
| **problema_acceso** | 21+ patterns | "no puedo entrar", "olvide mi contrasena" |
| **consultar_estado** | 22+ patterns | "estado de mi reporte", "mis tickets" |
| **faq** | 12+ patterns | "preguntas frecuentes", "como usar" |
| **reportar** | 20+ patterns | "quiero reportar", "crear ticket" |

### 2.8 Sistema de Ratings

- Validación: solo tickets en estado "resuelto"
- Puntuación: entero 1-5 con comentario opcional
- Un usuario solo puede calificar una vez por incidente
- Endpoint admin para estadísticas: promedio, distribución, timeline, promedio por PV

### 2.9 Notificaciones Push

- Registro de tokens Expo Push en tabla `push_tokens`
- Envío via Expo API (`https://exp.host/--/api/v2/push/send`)
- Se envían al resolver ticket o agregar comentario
- Incluye `incidentId` para navegación profunda

### 2.10 Upload de Archivos

- Multer con `memoryStorage`
- Límite: 5MB
- Formatos: png, jpg, jpeg, gif, webp
- UUID como nombre de archivo

---

## 3. FRONTEND WEB

### 3.1 Todas las Páginas y Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | page.tsx | Redirect a /login |
| `/login` | login/page.tsx | Login con validación |
| `/dashboard` | dashboard/page.tsx | KPIs + tickets recientes |
| `/dashboard/tickets` | dashboard/tickets/page.tsx | Tabla completa tickets |
| `/dashboard/analytics` | dashboard/analytics/page.tsx | Gráficos + exportación Excel |
| `/dashboard/users` | dashboard/users/page.tsx | CRUD usuarios |
| `/dashboard/ratings` | dashboard/ratings/page.tsx | Estadísticas calificaciones |
| `/dashboard/settings` | dashboard/settings/page.tsx | Config empresa |
| `/dashboard/external-systems` | dashboard/external-systems/page.tsx | Links externos |

### 3.2 Todos los Componentes (24)

| Componente | Descripción |
|------------|-------------|
| AnalyticsCharts.tsx | Gráficos (timeline, donut, barras) |
| AnalyticsFilters.tsx | Filtros por rango fechas, agente |
| AnalyticsMetrics.tsx | Cards métricas analytics |
| CreateUserModal.tsx | Modal crear usuario |
| DateRangePicker.tsx | Selector rango fechas |
| EditUserModal.tsx | Modal editar usuario |
| HelpModal.tsx | FAQ modal |
| MetricCard.tsx | Card métrica simple |
| Pagination.tsx | Paginación genérica |
| RatingCharts.tsx | Gráficos ratings |
| RatingSummaryCards.tsx | Cards resumen ratings |
| RecentRatingsTable.tsx | Tabla ratings recientes |
| ResetPasswordModal.tsx | Modal reset password |
| ResolveTicketModal.tsx | Modal resolver ticket |
| Sidebar.tsx | Navegación lateral |
| TicketDetailModal.tsx | Modal detalle ticket |
| TicketFilters.tsx | Filtros tickets |
| TicketTable.tsx | Tabla tickets completa |
| TicketSummaryCards.tsx | Cards resumen tickets |
| TicketsTable.tsx | Tabla tickets dashboard |
| Topbar.tsx | Barra superior + notificaciones |
| UserFilters.tsx | Filtros usuarios |
| UserManagement.tsx | Componente gestión usuarios |
| UsersTable.tsx | Tabla usuarios completa |
| UserSummaryCards.tsx | Cards resumen usuarios |

### 3.3 Contextos

**AuthContext**
```typescript
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initializing: boolean;
  login: (documento: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

**ThemeContext**
```typescript
interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}
```

### 3.4 Cliente API

```typescript
// api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = {
  get: <T>(endpoint, schema?) => request<T>(endpoint, undefined, schema),
  post: <T>(endpoint, body?, schema?) => request<T>(endpoint, {method: "POST", body: JSON.stringify(body)}, schema),
  put: <T>(endpoint, body?, schema?) => request<T>(endpoint, {method: "PUT", body: JSON.stringify(body)}, schema),
  patch: <T>(endpoint, body?, schema?) => request<T>(endpoint, {method: "PATCH", body: JSON.stringify(body)}, schema),
  delete: <T>(endpoint, schema?) => request<T>(endpoint, {method: "DELETE"}, schema),
};
```

---

## 4. MOBILE

### 4.1 Todas las Pantallas (7 rutas)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | app/index.tsx | Login screen |
| `/chat` | app/chat.tsx | Chatbot principal |
| `/reportar` | app/reportar.tsx | Formulario reporte |
| `/exito` | app/exito.tsx | Confirmación |
| `/historial` | app/historial.tsx | Lista incidentes |
| `/incidente/[id]` | app/incidente/[id].tsx | Detalle incidente |
| `/ajustes` | app/ajustes.tsx | Configuración |

### 4.2 Todos los Componentes (18)

| Componente | Descripción |
|------------|-------------|
| BotMessageCard.tsx | Mensaje del bot con acciones sugeridas |
| BottomTab.tsx | Navegación inferior |
| ChatBubble.tsx | Burbuja mensaje usuario |
| ChatHeader.tsx | Header chat |
| ChatInput.tsx | Input envío mensajes |
| ChatScreen.tsx | Screen principal chat |
| ExpandableMenu.tsx | Menú desplegable |
| FaqModal.tsx | Modal FAQ |
| Input.tsx | Campo texto |
| Logo.tsx | Logo app |
| OfflineBanner.tsx | Banner sin conexión |
| PrimaryButton.tsx | Botón primario |
| ReportHeader.tsx | Header reporte |
| SafeAreaProviderWrapper.tsx | Safe area wrapper |
| StarRating.tsx | Selector 5 estrellas |
| SubmenuItem.tsx | Item submenú |
| TextAreaField.tsx | Campo textarea |
| TextField.tsx | Campo texto etiquetado |
| TypingIndicator.tsx | Indicador "escribiendo..." |

### 4.3 Contextos

**AuthContext** - Estado de usuario, login/logout, registro push  
**ConnectivityContext** - Online/offline detection con check periódico

### 4.4 Servicios

| Servicio | Función |
|----------|---------|
| **api.ts** | Cliente HTTP con Bearer token, retry, cache |
| **storage.ts** | SecureStore para tokens, localStorage para web |
| **notifications.ts** | Registro Expo Push Token, permisos |
| **logger.ts** | Logging centralizado |

---

## 5. SHARED

### 5.1 Tipos Compartidos

| Archivo | Tipos |
|---------|-------|
| **api.ts** | PaginatedResponse, KpiResponse, CompanySettings, DashboardSummary |
| **auth.ts** | AuthUser, LoginInput, RegisterInput, AuthResponse |
| **user.ts** | ApiUser |
| **incident.ts** | IncidentUrgency, IncidentStatus, Incident, IncidentComment |
| **rating.ts** | Rating, RatingStats, PromedioPv |

---

## 6. SEGURIDAD

### 6.1 Auditoría de Vulnerabilidades

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| CR-001 | Secrets por defecto en .env.example | 🔴 CRÍTICA | ⏳ PENDIENTE |
| ALTO-001 | IP interna hardcodeada | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-002 | Middleware admin incluye "tecnico" | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-003 | Sin resource limits Docker | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-004 | Credenciales en URL BD | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-006 | Enumeración usuarios (ya 401) | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-010 | CSRF bypass with Bearer | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-011 | Rol "asesor" sin permisos | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-036 | Docker sin SHA digest | 🟠 ALTA | ⏳ PENDIENTE |
| ALTO-037 | Sin resource limits Docker | 🟡 MEDIA | ⏳ PENDIENTE |
| ALTO-038 | Secrets como env vars | 🟡 MEDIA | ⏳ PENDIENTE |

### 6.2 Medidas Implementadas

| Medida | Implementación |
|--------|----------------|
| **JWT Auth** | Access 1h, Refresh 7d, token versioning |
| **bcrypt** | 10 salt rounds |
| **Rate Limiting** | Global 100/min, Auth 3/min, Push 10/min |
| **Bloqueo Usuarios** | 5 intentos fallidos = bloqueo |
| **Helmet** | Security headers |
| **CORS** | Orígenes configurables |
| **CSRF** | Cookie + header validation |
| **Zod Validation** | Todos los inputs |
| **File Upload** | 5MB máx, extensiones whitelist |

### 6.3 Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Global | 100 req | 1 min |
| `/api/auth/login` | 3 req | 1 min |
| `/api/auth/refresh` | 30 req | 1 min |
| `/api/push/register` | 10 req | 1 min |

---

## 7. CÓDIGO

### 7.1 Calidad del Código

| Métrica | Valor |
|---------|-------|
| **Tests** | 128 passing (105 backend + 23 web) |
| **ESLint** | Sin warnings ni errores |
| **TypeScript** | Compila sin errores |
| **Limpieza** | ✅ Proyecto limpio |

### 7.2 Patrones Usados

| Patrón | Uso |
|--------|-----|
| **Module Pattern** | Separación routes/controller/schema |
| **Context Pattern** | React contexts para auth/theme |
| **Repository Pattern** | Drizzle ORM como abstracción DB |
| **Service Layer** | api.ts en clientes HTTP |
| **Middleware Pattern** | Express middlewares encadenados |
| **Strategy Pattern** | Chat bot respuestas por intención |

---

## 8. DOCKER

### 8.1 Dockerfiles

**Backend:** Multi-stage (build + prod) con Node 22 Alpine  
**Web:** Multi-stage (deps + build + runner) con Next.js standalone  
**OTA Server:** nginx:alpine simple

### 8.2 Servicios docker-compose.yml

```yaml
services:
  postgres:   # PostgreSQL 16, puerto 5432, healthcheck
  api:        # Express TS, puerto 3001, depende de postgres
  web:        # Next.js, puerto 3000, depende de api
  ota-server: # nginx, puerto 3002, sirve PWA
  ota-builder:# Profile build-only, genera bundles OTA
  mobile-builder: # Profile build-only, compila APK
```

### 8.3 Volúmenes

| Volumen | Destino | Descripción |
|---------|---------|-------------|
| pgdata | /var/lib/postgresql/data | Datos PostgreSQL |
| ota-data | /usr/share/nginx/html | PWA y archivos OTA |

---

## 9. PWA

### 9.1 Estado Actual

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Manifest** | ✅ Implementado | En dist/manifest.json |
| **Service Worker** | ⚠️ Parcial | Default Expo, no personalizado |
| **Install Prompt** | ✅ Funciona | Aparece en Chrome mobile |
| **Offline** | ⚠️ Parcial | Solo UI cacheada |
| **Push Notifications** | ✅ Android Chrome | No iOS Safari |

### 9.2 PWA-URLs

| Entorno | URL |
|---------|-----|
| Local | `http://localhost:3002` |
| Tunnel | `https://noon-suites-book-creatures.trycloudflare.com` |

---

## 10. DEPENDENCIAS

### 10.1 Backend

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| express | ^4.21.2 | Framework |
| drizzle-orm | ^0.45.2 | ORM |
| pg | ^8.13.1 | PostgreSQL driver |
| jsonwebtoken | ^9.0.2 | JWT |
| bcryptjs | ^2.4.3 | Hash passwords |
| zod | ^3.24.2 | Validación |
| helmet | ^8.0.0 | Security headers |
| cors | ^2.8.5 | CORS |
| express-rate-limit | ^7.5.0 | Rate limiting |
| multer | ^2.1.1 | File uploads |
| morgan | ^1.10.0 | HTTP logging |
| cookie-parser | ^1.4.7 | Cookies |

### 10.2 Web

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| next | ^15.5.19 | Framework |
| react | ^19.0.0 | UI |
| tailwindcss | ^3.4.17 | Estilos |
| recharts | ^3.0.0 | Gráficos |
| lucide-react | ^0.460.0 | Iconos |
| exceljs | ^4.4.0 | Export Excel |
| @hub/shared | file:../shared | Tipos compartidos |

### 10.3 Mobile

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| expo | ~56.0.12 | Framework |
| expo-router | ~56.2.11 | Navegación |
| react-native | 0.85.3 | Core |
| nativewind | ^4.2.4 | Estilos (Tailwind) |
| expo-secure-store | ~56.0.4 | Storage seguro |
| expo-notifications | ~56.0.18 | Push notifications |
| expo-updates | ~56.0.19 | OTA updates |
| react-native-reanimated | 4.3.1 | Animaciones |
| react-native-gesture-handler | ~2.31.1 | Gestos |

---

## 11. TODO Y PENDIENTES

### 11.1 Tareas Pendientes

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| CR-001 | Secrets por defecto en .env.example | 🔴 CRÍTICA | ⏳ |
| ALTO-001 | IP interna hardcodeada | 🟠 ALTA | ⏳ |
| ALTO-002 | Middleware admin incluye "tecnico" | 🟠 ALTA | ⏳ |
| ALTO-003 | Sin resource limits Docker | 🟠 ALTA | ⏳ |
| ALTO-004 | Credenciales en URL BD | 🟠 ALTA | ⏳ |
| ALTO-006 | Enumeración usuarios | 🟠 ALTA | ⏳ |
| ALTO-010 | CSRF bypass with Bearer | 🟠 ALTA | ⏳ |
| ALTO-011 | Rol "asesor" sin permisos | 🟠 ALTA | ⏳ |
| ALTO-036 | Docker sin SHA digest | 🟠 ALTA | ⏳ |
| ALTO-037 | Sin resource limits Docker | 🟡 MEDIA | ⏳ |
| ALTO-038 | Secrets como env vars | 🟡 MEDIA | ⏳ |

### 11.2 Bugs Conocidos

| Bug | Descripción | Workaround |
|-----|-------------|------------|
| PWA "Sin conexión" | ConnectivityContext detecta offline con npx serve | Usar cloudflared tunnel |
| Tunnel cloudflared | URL cambia en cada reinicio | Usar named tunnel |

---

## 12. RECOMENDACIONES

### 12.1 Mejoras por Prioridad

| Prioridad | Mejora | Beneficio |
|-----------|--------|-----------|
| 🔴 CRÍTICA | Regenerar secrets con `openssl rand -hex 32` | Seguridad producción |
| 🔴 CRÍTICA | Mover IP hardcodeada a env var | Seguridad |
| 🟠 ALTA | Agregar resource limits a Docker | Estabilidad |
| 🟠 ALTA | Implementar Docker image digests | Reproducibilidad |
| 🟠 ALTA | Definir permisos explícitos rol "asesor" | Claridad permisos |
| 🟡 MEDIA | Personalizar Service Worker para offline | UX offline |
| 🟡 MEDIA | Agregar tests a mobile | Cobertura tests |
| 🟡 MEDIA | Implementar E2E tests | Confianza |
| ⚪ BAJA | Unificar nomenclatura columnas | Consistencia |

### 12.2 Resumen del Proyecto

| Aspecto | Estado | Notas |
|---------|--------|-------|
| **Arquitectura** | ✅ Sólida | Microservicios bien separados |
| **Backend** | ✅ Completo | 10 módulos, 35+ endpoints |
| **Frontend Web** | ✅ Funcional | Dashboard admin completo |
| **Mobile** | ✅ PWA | Funcional, 7 pantallas |
| **Seguridad** | ⚠️ En desarrollo | 11 issues pendientes |
| **Código** | ✅ Limpio | 128 tests, sin warnings |
| **Docker** | ✅ Funcional | 4 servicios containerizados |
| **PWA** | ⚠️ Parcial | Funciona pero sin SW personalizado |
| **Tests** | ✅ 128 passing | Backend + Web |
| **Documentación** | ✅ Excelente | README, CHANGELOG, TODO, guías |

---

**Proyecto maduro y funcional** con buena base de código. Las principales áreas de mejora son seguridad (secrets, resource limits) y automatización (CI/CD, E2E tests).

---

*Informe generado: 2026-07-14*
