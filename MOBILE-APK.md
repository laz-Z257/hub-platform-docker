# 📱 Generar APK — hub-platform

Guía completa para compilar la app móvil de HUB AI Assistant y distribuirla en Android.

---

## Requisitos

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| Docker | ✅ Instalado | Docker Compose v2+ |
| RAM | 8 GB | 16 GB |
| Disco libre | 20 GB | 30 GB |
| CPU | x86_64 | 4+ núcleos |
| SO | Linux / macOS / Windows | — |

> ⚠️ La primera compilación tarda **30-50 min** (descarga SDK + compila). Las siguientes **5-10 min**.

---

## 1. Generar APK

Desde la raíz del proyecto:

```bash
docker compose --profile build-only run mobile-builder
```

El APK aparece en `mobile/output/app-release.apk`.

### Opciones alternativas

**EAS Build (nube Expo, recomendado si no querés saturar tu PC):**
```bash
cd mobile
eas build -p android --profile preview
```

**Local sin Docker** (requiere Android Studio instalado):
```bash
cd mobile
npx expo run:android
```

---

## 2. Pasar APK al celular

### Opción A — Servidor HTTP (misma red WiFi)
```bash
cd mobile/output
python3 -m http.server 8080
```
En el navegador del celular: `http://[IP_DE_TU_PC]:8080/app-release.apk`

Saber tu IP: `ip addr` o `ifconfig` (buscar `192.168.x.x`)

### Opción B — Google Drive
Subís el APK, lo abrís desde el celular, descargás e instalás.

### Opción C — USB
Copiás el archivo al celular por cable, luego lo abrís desde el administrador de archivos.

### Opción D — Desde el mismo celular (sin PC)
Si tenés Termux en Android podés clonar y compilar directo, pero no recomendado (muy lento).

> 📲 Al instalar, Android puede pedir **"Permitir instalación de orígenes desconocidos"** — aceptás y listo.

---

## 3. Configurar API URL para producción

Por defecto la app apunta a `http://localhost:3001/api` (solo funciona en desarrollo en tu PC).

Para que funcione desde **cualquier internet**:

### 3.1. Tener la API online

**Opción 1 — Servidor propio con Docker:**
```bash
# En el servidor
docker compose up -d postgres api
```
La API queda en `http://[IP_DEL_SERVIDOR]:3001/api`

**Opción 2 — Render / Railway (gratuito):**
Deployás el backend en la nube. Cada servicio da una URL pública tipo `https://hub-api.onrender.com`.

**Opción 3 — ngrok (temporal, test):**
```bash
ngrok http 3001
```
Da una URL pública temporal como `https://abc123.ngrok.io`.

### 3.2. Configurar la app

Antes de generar la APK, editá `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=https://tudominio.com/api
```

Luego generás la APK normalmente y la app ya apunta a tu servidor.

---

## 4. Notas importantes

- La app se llama **HUB AI Assistant**, package `com.hubplatform.aiapp`
- Si cambiás la URL de la API después, **tenés que regenerar la APK**
- Las credenciales de la app (login) se manejan contra la API configurada
- El APK release está firmado con debug keystore (para distribución necesitás una keystore propia)

---

## 5. Solución de problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| `npm ci` falla | `@hub/shared` no se copió al contenedor | Asegurate de estar en `main` con el último commit |
| APK no aparece en `output/` | Build falló silenciosamente | Revisá logs con `docker compose logs mobile-builder` |
| App no conecta a la API | URL incorrecta o servidor caído | Verificá `EXPO_PUBLIC_API_URL` y que el servidor esté accesible |
| Error de firma al instalar | APK sin firmar o debug | Usá `app-release.apk`, no debug |
