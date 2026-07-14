# PLAN: SUBIR APP A APTOIDE

## Paso 1: Generar el APK

### Opción A: Docker (en tu servidor)

```bash
cd /home/linux/Escritorio/hub-platform-docker

# Generar APK
docker compose --profile build-only run mobile-builder
```

El APK estará en: `mobile/output/app-release.apk`

### Opción B: PWABuilder (más rápido)

1. Ve a: https://www.pwa-builder.io
2. Ingresa: `https://noon-suites-book-creatures.trycloudflare.com`
3. Click "Android"
4. Click "Download"

---

## Paso 2: Crear cuenta en Aptoide

1. Ve a: https://connect.aptoide.com
2. Click "Register"
3. Completa:
   - Email
   - Contraseña
   - Nombre de usuario
4. Confirma el email

---

## Paso 3: Subir el APK

1. Inicia sesión en https://connect.aptoide.com
2. Click "Upload App"
3. Arrastra tu archivo APK o selecciónalo
4. Espera a que cargue (~1-5 min según tamaño)

---

## Paso 4: Completar información de la app

### Información básica:
- **App Name:** HUB AI Assistant
- **Summary:** App de soporte corporativo
- **Description:** (escribe una descripción)
- **Category:** Productivity / Business
- **Tags:** soporte, tickets, helpdesk

### Iconos:
- Sube `mobile/assets/icon-512.png` (512x512)

### Capturas de pantalla (opcional):
- Puedes usar capturas del dashboard o móvil

### Version:
- Se filled automatically desde el APK

---

## Paso 5: Publicar

1. Click "Submit"
2. Esperar aprobación (24-48 horas)
3. Recibirás email cuando esté aprobado

---

## Después de publicado

Una vez en Aptoide:
- Los usuarios podrán buscar "HUB AI Assistant"
- Podrás ver estadísticas de descargas
- Podrás subir actualizaciones cuando tengas nuevas versiones

---

## Para actualizar el APK

1. Genera nueva APK (Paso 1)
2. Ve a tu app en Aptoide Developer
3. Click "Upload new version"
4. Sube el nuevo APK
5. Submit

---

## Links importantes

| Recurso | Link |
|---------|------|
| Aptoide Connect | https://connect.aptoide.com |
| PWABuilder | https://www.pwa-builder.io |
| Tu APK (local) | `mobile/output/app-release.apk` |

---

## Tiempo estimado

| Tarea | Tiempo |
|-------|--------|
| Generar APK (Docker) | 30-50 min (primera vez) |
| Generar APK (PWABuilder) | 5-10 min |
| Registro Aptoide | 5 min |
| Subir APK | 5 min |
| Completar info | 10 min |
| Aprobación | 24-48 horas |

**Total:** ~1-2 horas de trabajo + espera de aprobación

---

## Notas

- El APK funciona independientemente de tu servidor
- Los usuarios necesitarán internet para usar la app
- Mantén tu servidor Docker corriendo
- Actualiza el APK cuando haya cambios importantes

---

*Plan creado: 2026-07-14*
