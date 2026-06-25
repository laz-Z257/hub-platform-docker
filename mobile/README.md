# Mobile App

App móvil Expo/React Native para reporte de incidentes y chat de soporte con IA.

## Stack

| Componente | Tecnología |
|---|---|
| Framework | React Native 0.85.3 + Expo SDK 56 |
| Navegación | expo-router (file-based routing) |
| Estilos | NativeWind v4 (TailwindCSS para RN) + StyleSheet |
| Iconos | lucide-react-native |
| Animaciones | react-native-reanimated 4.3.1 |
| Gestos | react-native-gesture-handler |
| Auth storage | expo-secure-store (native) / localStorage (web) |
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
npx expo start --web    # Web
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

## OTA Updates (actualización sin reinstalar)

```bash
docker compose --profile build-only run ota-builder
```

Los bundles se sirven via `ota-server` en `http://localhost:3002`.

## Variables de entorno

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## API Endpoints que consume

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Validar sesión |
| POST | `/auth/logout` | Logout |
| GET | `/chat/history?limit=30` | Historial del chat |
| POST | `/chat/message` | Enviar mensaje al bot |
| GET | `/incidents?limit=50` | Listar incidentes |
| POST | `/incidents` | Crear incidente |
| GET | `/incidents/{id}` | Detalle del incidente |
