# Mobile App

App móvil Expo/React Native para reporte de incidentes y chat de soporte con IA.

## PWA Completa (2026-07-24)

✅ **Progressive Web App instalable y funcional**

### Características PWA

| Feature | Estado | Descripción |
|---------|--------|-------------|
| **manifest.json** | ✅ | Configuración PWA con nombre, iconos, colores |
| **Service Worker** | ✅ | Caché offline de assets estáticos |
| **Iconos** | ✅ | 192x192 y 512x512 en `/assets/` |
| **Meta tags iOS** | ✅ | apple-mobile-web-app-capable, title, icon |
| **Meta tags Android** | ✅ | theme-color, manifest |
| **CORS seguro** | ✅ | Restringido a `http://localhost:3000` |
| **Instalable** | ✅ | "Agregar a pantalla principal" |
| **Offline** | ✅ | Service Worker cachea la app |

### Archivos PWA

```
mobile/public/
├── manifest.json    # Configuración PWA
├── sw.js           # Service Worker con caché
└── index.html      # Template con meta tags
```

### Acceder a la PWA

```bash
# 1. Iniciar contenedor
docker compose up -d mobile

# 2. Abrir en navegador
# http://localhost:8081

# 3. Instalar
# Chrome/Edge: Ícono de instalar en barra de direcciones
# Mobile: "Agregar a pantalla principal"
```

## Stack

| Componente | Tecnología |
|---|---|
| Framework | React Native 0.85.3 + Expo SDK 56 |
| Navegación | expo-router (file-based routing) |
| Estilos | NativeWind v4 (TailwindCSS para RN) + StyleSheet |
| Iconos | lucide-react-native |
| Animaciones | react-native-reanimated 4.3.1 |
| Gestos | react-native-gesture-handler |
| Auth storage | expo-secure-store (native) / cookies httpOnly (web) |
| Estado | React Context (AuthContext) |

## Pantallas

| Ruta | Pantalla | Auth | Descripción |
|------|----------|:----:|-------------|
| `/` | LoginScreen | No | Login con documento + contraseña (mín 6 chars) |
| `/chat` | ChatScreen | Sí | Chatbot IA con menú interactivo |
| `/reportar` | ReportScreen | Sí | Formulario de reporte de incidentes |
| `/historial` | HistorialScreen | Sí | Lista de tickets con pull-to-refresh |
| `/exito` | SuccessScreen | Sí | Confirmación post-reporte |
| `/incidente/[id]` | DetailScreen | Sí | Detalle del incidente con comentarios |
| `/ajustes` | SettingsScreen | Sí | Configuración y logout |

## Estructura de Archivos

```
mobile/
├── app/                    # Rutas (expo-router)
│   ├── _layout.tsx        # Root layout con providers
│   ├── index.tsx          # Login (redirect)
│   ├── chat.tsx           # ChatScreen
│   ├── reportar.tsx       # ReportScreen
│   ├── historial.tsx      # HistorialScreen
│   ├── exito.tsx          # SuccessScreen
│   ├── incidente/[id].tsx # DetailScreen
│   └── ajustes.tsx        # SettingsScreen
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── constants/
│   │   └── colors.ts      # Colores centralizados (COLORS, URGENCIA_COLORS, etc.)
│   ├── contexts/          # AuthContext, ConnectivityContext
│   ├── screens/           # LoginScreen (usado por index.tsx)
│   ├── services/          # api.ts, storage.ts, logger.ts
│   └── types/             # Tipos TypeScript
└── public/                # PWA (manifest.json, sw.js, index.html)
```

## Desarrollo en vivo

```bash
cd mobile
npm install
npx expo start          # Iniciar servidor dev
npx expo start --web    # Web (PWA)
```

## Builds nativos opcionales

```bash
# El proyecto no incluye un builder nativo en Docker.
# El directorio android/ puede existir localmente, pero está ignorado por Git.
# Usa Expo Application Services (EAS) para builds nativos reproducibles.
npx eas-cli build --platform android --profile preview
# Genera un APK instalable para pruebas.

npx eas-cli build --platform android --profile production
# Genera el artefacto de producción configurado en mobile/eas.json.
```

Los perfiles y la URL pública del API están definidos en `eas.json`. Estos builds requieren una cuenta/proyecto EAS configurado y no forman parte de `docker compose up`.

## Actualizaciones OTA opcionales

La configuración de `expo-updates` está activa para builds nativos. Para publicar una actualización mediante EAS:

```bash
npx eas-cli update --channel preview --message "Descripción del cambio"
```

La PWA de Docker se actualiza reconstruyendo la imagen `mobile`; no utiliza OTA.

## Variables de entorno

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=/api
```

## URLs destino del API

| Tipo | URL | Dónde se define |
|------|-----|-----------------|
| **PWA (Docker local)** | `/api` (relativa, proxy nginx) | `mobile/.env` |
| **Build nativo (EAS Build)** | `https://hub-platform-api.onrender.com/api` | `mobile/eas.json` |
| **Dev local** | `http://localhost:3001/api` | `mobile/.env` en desarrollo |

## Seguridad de Sesiones

- **Login envía `scope: "user"`** → Backend crea cookies `user_token`
- **Todas las peticiones envían `X-Auth-Scope: user`** → Aislamiento completo
- **Cookies httpOnly** con path `/` para que se envíen a `/api/*`
- **CORS restringido** en nginx a `http://localhost:3000`
- **En web (PWA)** el access token y el usuario se guardan en `localStorage` (conocido: riesgo XSS, pendiente de migrar a memoria/cookie); la sesión de refresh vive en cookie httpOnly
- **En nativo** tokens y usuario van en `expo-secure-store` (Keychain/Keystore)
- **Logout aislado:** Cerrar sesión en mobile NO afecta dashboard

## Testing

```bash
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con cobertura
```

### Tests incluidos

- **constants.test.ts** - Tests de constantes de color (URGENCIA_COLORS, ESTADO_LABELS, etc.)
- **logger.test.ts** - Tests del servicio de logging

### Configuración

- Jest 29 con preset `@react-native/jest-preset`
- Testing Library para React Native
- Mocks automáticos para expo-router, expo-secure-store, etc.

## Crash Reporting

El sistema incluye un servicio de crash reporting que puede integrarse con Sentry:

```bash
# Configurar DSN de Sentry en mobile/.env
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### Características

- **ErrorBoundary** - Captura errores de React y muestra pantalla de error
- **Crash Reporting** - Envía reportes a Sentry (si está configurado)
- **Device Info** - Incluye modelo, OS, versión de app
- **User Context** - Rastrea usuario actual para debugging
- **Breadcrumbs** - Registro de navegación antes del crash

Si no hay DSN configurado, los errores se loguean localmente.

## Constantes de Color

Centralizadas en `src/constants/colors.ts`:

```typescript
// Uso en componentes
import { COLORS, URGENCIA_COLORS, ESTADO_COLORS, ESTADO_LABELS } from "../src/constants/colors";

// COLORS: primary, primaryLight, textDark, background, error, success, etc.
// URGENCIA_COLORS: alta (#EF4444), media (#F59E0B), baja (#22C55E)
// ESTADO_COLORS: pendiente (#3B82F6), en_proceso (#F59E0B), resuelto (#22C55E)
```

## Estado de Calidad

| Aspecto | Estado |
|---------|:------:|
| TypeScript | ✅ 0 errores |
| Tests | ✅ 14/14 pasando |
| Error Boundaries | ✅ Implementados |
| Crash Reporting | ✅ Implementado |
| Sesiones Aisladas | ✅ Funcionando |
| PWA | ✅ Completa |
| Dark Mode | ❌ Pendiente (6 pantallas) |

---

## Cambios Recientes (2026-07-28)

### Verificado
- ✅ Password mínimo 6 chars en login (corregido de 4 a 6)
- ✅ Constantes de color centralizadas en `src/constants/colors.ts`
- ✅ `historial.tsx` usa imports de COLORS (verificado)
- ✅ `incidente/[id].tsx` usa imports de COLORS (verificado)
- ✅ `isReady` state tiene propósito: controla render post-splash screen
- ✅ Logger unificado (reemplazados console.log/error)
- ✅ Sanitización de input en chat (previene XSS, límite 500 chars)

### Pendiente
- ❌ Sin Error Boundaries (crash = pantalla blanca)
- ❌ Sin tests unitarios
- ❌ Sin Sentry/Crashlytics

### PWA Completa (2026-07-24)
- ✅ manifest.json, service worker, meta tags
- ✅ CORS restringido en nginx (antes era `*`)
- ✅ Login envía `scope: "user"` para cookies aisladas
- ✅ Iconos PWA copiados al build de nginx
- ✅ Service Worker con caché offline (excluye `/api/`)
