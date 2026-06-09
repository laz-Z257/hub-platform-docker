# Mobile App

App móvil Expo/React Native para reporte de incidentes y chat de soporte con IA.

## Qué incluye

- Login con JWT (documento + contraseña)
- Chat de soporte con IA (conectado al backend)
- Reporte de incidentes con campos validados
- Historial de tickets con pull-to-refresh
- Detalle de incidente con comentarios
- Pantalla de éxito post-reporte
- Rutas con `expo-router`
- Estilos con `nativewind`
- Almacenamiento seguro de sesión (`expo-secure-store`)

## Comandos

```bash
cd mobile
npm install
npm start
```

Para ejecutar en Android, iOS o web:

```bash
npm run android
npm run ios
npm run web
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
