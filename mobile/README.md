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
|------|----------|------|-------------|
| `/` | LoginScreen | No | Login con documento + contraseña |
| `/chat` | ChatScreen | Sí | Chatbot IA con menú interactivo |
| `/reportar` | ReportScreen | Sí | Formulario de reporte de incidentes |
| `/historial` | HistorialScreen | Sí | Lista de tickets con pull-to-refresh |
| `/exito` | SuccessScreen | Sí | Confirmación post-reporte |
| `/incidente/[id]` | DetailScreen | Sí | Detalle del incidente con comentarios |

## Desarrollo en vivo

```bash
cd mobile
npm install
npx expo start          # Iniciar servidor dev
npx expo start --web    # Web (PWA)
```

## Compilar APK

```bash
# Opción 1 — Docker (recomendado, no requiere SDK local)
docker compose --profile build-only run mobile-builder
# APK generado en: mobile/output/app-release.apk

# Opción 2 — Local (requiere Java 17 + Android SDK)
cd android && ./gradlew assembleRelease
# APK generado en: android/app/build/outputs/apk/release/app-release.apk
```

## Variables de entorno

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=/api
```

## URLs destino del API

| Tipo | URL | Dónde se define |
|------|-----|-----------------|
| **PWA (Docker local)** | `/api` (relativa, proxy nginx) | `mobile/.env` |
| **APK nativo (EAS Build)** | `https://hub-platform-api.onrender.com` | Hardcodeada en build de EAS |
| **Dev local** | `http://localhost:3001/api` | `mobile/.env` en desarrollo |

## Seguridad de Sesiones

- **Login envía `scope: "user"`** → Backend crea cookies `user_token`
- **Cookies httpOnly** con path `/` para que se envíen a `/api/*`
- **CORS restringido** en nginx a `http://localhost:3000`
- **No usa localStorage** en web (usa cookies como el dashboard)

## Cambios Recientes (2026-07-27)

### Calidad
- ✅ Logger unificado (reemplazados console.log/error con logger)
- ✅ Sanitización de input en chat (previene XSS, límite 500 chars)
- ✅ Constantes de color centralizadas en `src/constants/colors.ts`
- ✅ Estilos consistentes usando constantes COLORS
- ✅ Colores divergentes corregidos (en_proceso unificado)

### PWA Completa (2026-07-24)
- ✅ manifest.json, service worker, meta tags
- ✅ CORS restringido en nginx (antes era `*`)
- ✅ Login envía `scope: "user"` para cookies aisladas
- ✅ Iconos PWA copiados al build de nginx
- ✅ Service Worker con caché offline (excluye `/api/`)
