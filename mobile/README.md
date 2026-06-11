# Mobile App

App móvil Expo/React Native para reporte de incidentes y chat de soporte con IA.

## Stack técnico

| Componente | Tecnología |
|---|---|
| Framework | React Native 0.85.3 + Expo SDK 56 |
| Navegación | expo-router (file-based routing) |
| Estilos | NativeWind v4 (TailwindCSS para RN) + StyleSheet |
| Iconos | lucide-react-native |
| Animaciones | react-native-reanimated 4.3.1 |
| Gestos | react-native-gesture-handler |
| Fuentes | Inter vía @expo-google-fonts/inter |
| Auth storage | expo-secure-store (native) / localStorage (web) |
| Estado | React Context (AuthContext) |
| Notificaciones | (pendiente) |
| Offline | (pendiente) |

## Pantallas

| Ruta | Pantalla | Auth | Descripción |
|------|----------|------|-------------|
| `/` | LoginScreen | No | Login con documento + contraseña, validación client-side |
| `/chat` | ChatScreen | Sí | Chatbot IA con menú interactivo expandible |
| `/reportar` | ReportScreen | Sí | Formulario de reporte de incidentes (5 campos + urgencia) |
| `/historial` | — | Sí | Lista de tickets con pull-to-refresh |
| `/exito` | — | Sí | Confirmación post-reporte con animaciones + copy ticket ID |
| `/incidente/[id]` | — | Sí | Detalle completo del incidente con comentarios |

## Funcionalidades actuales

- [x] Login con JWT + persistencia en SecureStore
- [x] Chatbot con respuestas automáticas y menú interactivo
- [x] Menú del bot: Consultar saldo, Estado solicitud, Soporte técnico (expandible), Hablar con agente
- [x] Reporte de incidentes con validación (nombre, documento, punto_venta, teléfono, descripción, urgencia)
- [x] Historial de tickets con pull-to-refresh
- [x] Detalle de ticket con info completa + comentarios timeline
- [x] Pantalla de éxito con animaciones y copia al portapapeles
- [x] Bottom tab navigation (Chatbot - Reportar - Historial)
- [x] Dark mode (herencia del sistema)
- [x] Splash screen animada con fuentes Inter
- [x] Sesión persistente al cerrar/reabrir la app

## API Endpoints que consume

| Método | Endpoint | Uso |
|--------|----------|-----|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Validar sesión al iniciar |
| POST | `/auth/logout` | Logout |
| GET | `/chat/history?limit=30` | Historial del chat |
| POST | `/chat/message` | Enviar mensaje al bot |
| GET | `/incidents?limit=50` | Listar incidentes |
| GET | `/incidents?limit=1` | Último incidente (banner) |
| POST | `/incidents` | Crear incidente |
| GET | `/incidents/{id}` | Detalle del incidente |

## Mejoras pendientes (propuestas)

| Prioridad | Mejora | Descripción |
|-----------|--------|-------------|
| 🟡 Media | Refresh token | Implementar renovación silenciosa de token en lugar de forzar re-login |
| 🟡 Media | TypeScript stable | Migrar de TS 6.0 (pre-release) a TS 5.7+ |
| 🔵 Baja | Filtros en historial | Filtrar tickets por estado, fecha o urgencia |
| 🔵 Baja | Adjuntar fotos | Agregar imágenes al reportar incidente |
| 🔵 Baja | Editar perfil | Pantalla de perfil de usuario |
| 🔵 Baja | Cambiar contraseña | Desde la app |
| 🔵 Baja | Biometric auth | Huella/FaceID para login |
| 🔵 Baja | Notificaciones push | Alertas de cambio de estado de tickets |
| 🔵 Baja | Offline mode | Cache con AsyncStorage + sincronización |
| 🔵 Baja | Navegación por gestos | Swipe entre tabs |

## Comandos

```bash
cd mobile
npm install
npm start          # Iniciar en modo desarrollo
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## Build APK (EAS)

```bash
npx eas login
npx eas build --platform android --profile preview
```

El APK tarda ~15-20 min en los servidores de Expo. Al terminar, Expo manda un link de descarga.

### Requisitos del build

| Requisito | Valor |
|---|---|
| `eas.json` → `preview.distribution` | `"internal"` (obligatorio para APK instalable) |
| `eas.json` → `preview.android.buildType` | `"apk"` |
| TypeScript | `~6.0.3` (compatible con Expo SDK 56) |
| `EXPO_PUBLIC_API_URL` | URL del backend en Render |

### Por qué `distribution: "internal"`

Sin esta propiedad, EAS genera el APK con perfil de distribución `"store"` (Play Store), lo que produce un archivo que **Android rechaza al instalar** con el mensaje "No se pudo instalar". Con `"internal"`, el APK se firma con el keystore de desarrollo de Expo y se instala directamente en cualquier dispositivo.

### Verificar dependencias antes de buildear

```bash
npx expo-doctor         # 21/21 checks deben pasar
npx expo install --check  # verificar versiones alineadas con SDK 56
```

## Variables de entorno

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://hub-platform-api.onrender.com/api
```

## Notas

- La app usa `expo-clipboard` (no `react-native/Clipboard`) para evitar warnings en SDK 56
- El `SplashScreen.preventAutoHideAsync()` está envuelto en try/catch para evitar crashes en reload
- Las animaciones (`ExpandableMenu`) limpian sus timeouts al desmontar para evitar memory leaks
- El import de tipos compartidos usa ruta relativa (`../../../shared/`) — pendiente de migrar a alias/workspace
