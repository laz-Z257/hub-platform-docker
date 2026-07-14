# Guía de Distribución de APK - HUB Mobile

> Guía completa para distribuir tu APK fuera de Google Play Store.

---

## Tabla de Contenidos

1. [Generar el APK](#generar-el-apk)
2. [Tiendas de Aplicaciones](#tiendas-de-aplicaciones)
3. [Plataformas de Descarga Directa](#plataformas-de-descarga-directa)
4. [Convertir PWA a APK](#convertir-pwa-a-apk)
5. [Firmar el APK](#firmar-el-apk)

---

## Generar el APK

### Usando Docker (recomendado)

```bash
docker compose --profile build-only run mobile-builder
```

El APK se genera en: `mobile/output/app-release.apk`

### Usando EAS Build (nube)

```bash
cd mobile
eas build -p android --profile preview
```

---

## Tiendas de Aplicaciones

### 1. Aptoide Connect

**Web:** https://connect.aptoide.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | GRATIS |
| **Cuenta** | Requiere registro |
| **Revisión** | 24-48 horas |
| **Políticas** | Laxas |

**Pasos:**
1. Ve a https://connect.aptoide.com/register
2. Crea una cuenta gratuita
3. Inicia sesión en el dashboard
4. Selecciona "Upload App"
5. Sube tu archivo APK
6. Completa: nombre, descripción, categoría, icono
7. Espera aprobación

---

### 2. APKPure

**Web:** https://apkpure.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | GRATIS |
| **Cuenta** | Opcional (mejor con cuenta) |
| **Revisión** | Rápido |

**Pasos:**
1. Ve a https://apkpure.com
2. Crea cuenta o inicia sesión
3. Busca "Developer" o ve a https://apkpure.com/developer
4. Sube tu APK
5. Completa la información

---

### 3. Samsung Galaxy Store

**Web:** https://seller.samsung.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | GRATIS |
| **Cuenta** | Requiere registro |
| **Distribución** | Solo dispositivos Samsung |

**Pasos:**
1. Ve a https://seller.samsung.com
2. Regístrate como desarrollador
3. Crea tu app
4. Sube el APK
5. Espera aprobación

---

### 4. Amazon Appstore

**Web:** https://developer.amazon.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | GRATIS |
| **Cuenta** | Requiere registro |
| **Distribución** | Dispositivos Amazon (Fire TV, tablets) |

**Pasos:**
1. Ve a https://developer.amazon.com
2. Regístrate gratis
3. Crea una nueva app
4. Sube tu APK
5. Completa la información del producto

---

### 5. Uptodown

**Web:** https://uptodown.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | GRATIS |
| **Cuenta** | Requiere registro |
| **Revisión** | Rápido |

**Pasos:**
1. Ve a https://uptodown.com
2. Regístrate como desarrollador
3. Sube tu APK

---

### 6. iBerry

**Web:** https://iberry.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | GRATIS |
| **Cuenta** | Registro simple |

---

### Comparativa de Tiendas

| Tienda | Costo | Registro | Aprobación | Notas |
|--------|-------|----------|------------|-------|
| **Aptoide** | Gratis | Sí | 24-48h | Muy fácil, popular |
| **APKPure** | Gratis | Opcional | Rápido | Gran audiencia |
| **Samsung** | Gratis | Sí | variable | Solo Samsung |
| **Amazon** | Gratis | Sí | variable | Dispositivos Amazon |
| **Uptodown** | Gratis | Sí | Rápido | Popular en España/Latam |
| **iBerry** | Gratis | Sí | variable | Alternativa |

---

## Plataformas de Descarga Directa

Estas plataformas no son tiendas de apps, pero permiten descargar archivos directamente.

### 1. MediaFire

**Web:** https://www.mediafire.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | Gratis (con ads) |
| **Limite** | 10GB por archivo |
| **Ventaja** | Muy conocido, fácil |

**Pasos:**
1. Ve a https://www.mediafire.com
2. Sube tu archivo APK
3. Comparte el enlace de descarga

**Limitaciones:**
- Los usuarios descargan el archivo, no lo instalan directamente
- No hay actualizaciones automáticas

---

### 2. Google Drive

**Web:** https://drive.google.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | Gratis (15GB incluidos) |
| **Ventaja** | Muy conocido |

**Pasos:**
1. Sube el APK a Google Drive
2. Hazlo público o compártelo
3. Los usuarios descargan y instalan manualmente

**Limitaciones:**
- Android bloquea instalación de "orígenes desconocidos" por defecto
- Los usuarios deben habilitar "Fuentes desconocidas"

---

### 3. Mega.nz

**Web:** https://mega.nz

| Aspecto | Detalle |
|---------|---------|
| **Costo** | Gratis (50GB) |
| **Ventaja** | Cifrado, rápido |

---

### 4. Discord (o Telegram/WhatsApp)

| Aspecto | Detalle |
|---------|---------|
| **Costo** | Gratis |
| **Ventaja** | Directo, grupal |

**Pasos:**
1. Sube el APK a Discord
2. Compártelo en un canal o grupo
3. Los usuarios descargan directamente

---

### 5. GitHub Releases

**Web:** https://github.com

| Aspecto | Detalle |
|---------|---------|
| **Costo** | Gratis (repos públicos) |
| **Ventaja** | Profesional, versionado |

**Pasos:**
1. Crea un repositorio en GitHub
2. Ve a "Releases"
3. Crea una nueva release
4. Attach tu archivo APK
5. Comparte el enlace

**Ventajas:**
- Control de versiones
- Historial de cambios
- Profesional

---

### 6. itch.io

**Web:** https://itch.io

| Aspecto | Detalle |
|---------|---------|
| **Costo** | Gratis |
| **Ventaja** | Fácil, comunitario |
| **Ideal para** | PWAs y apps |

**Pasos:**
1. Ve a https://itch.io
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Sube tu APK
5. Establece precio (o gratis)
6. Comparte el enlace

---

## Convertir PWA a APK

Si solo tienes la PWA (no el APK nativo), puedes convertirla.

### PWABuilder

**Web:** https://www.pwa-builder.io

| Aspecto | Detalle |
|---------|---------|
| **Costo** | GRATIS |
| **Resultado** | APK/Android Studio/Store packages |

**Pasos:**
1. Ve a https://www.pwa-builder.io
2. Ingresa la URL de tu PWA o sube los archivos
3. Selecciona "Android"
4. Descarga el APK generado
5. (Opcional) Usa el paquete de Android Studio para subir a Google Play

---

## Firmar el APK

El APK debe estar firmado para poder instalarse en Android.

### APK de Debug (no recomendado para distribución)

El APK generado con `docker compose --profile build-only run mobile-builder` está firmado con clave de debug.

**Limitaciones:**
- Google Play no acepta claves de debug
- Aptoide y otros sí aceptan APK debug para pruebas

### APK de Release (recomendado)

Para distribución en tiendas oficiales, necesitas:

1. **Crear una keystore:**

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Firmar el APK:**

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore my-app.apk my-key-alias
```

3. **Alinear el APK:**

```bash
zipalign -v 4 my-app.apk my-app-aligned.apk
```

### Usando EAS para build de release

```bash
cd mobile
eas build -p android --profile production
```

Esto genera un APK firmado correctamente.

---

## Resumen Rápido

### Para distribución rápida y fácil:

1. **Subir a tiendas (recomendado):**
   - Aptoide: https://connect.aptoide.com
   - APKPure: https://apkpure.com/developer

2. **Para descargar directa:**
   - MediaFire: https://www.mediafire.com
   - Discord/Telegram
   - GitHub Releases

3. **Para convertir PWA a APK:**
   - PWABuilder: https://www.pwa-builder.io

---

## Links Útiles

| Recurso | Link |
|---------|------|
| Aptoide Connect | https://connect.aptoide.com |
| APKPure Developers | https://apkpure.com/developer |
| Samsung Seller Portal | https://seller.samsung.com |
| Amazon Appstore | https://developer.amazon.com |
| Uptodown Developers | https://uptodown.com |
| itch.io | https://itch.io |
| PWABuilder | https://www.pwa-builder.io |
| MediaFire | https://www.mediafire.com |
| Google Drive | https://drive.google.com |
| Mega.nz | https://mega.nz |
| GitHub | https://github.com |

---

## Notas Importantes

1. **Orígenes desconocidos:** Los usuarios deberán habilitar "Instalar desde orígenes desconocidos" en su celular.

2. **Permisos:** El APK requiere permisos de internet para funcionar.

3. **Versión mínima:** Verifica que el APK sea compatible con Android 6.0+ (API 23).

4. **Firma:** Las tiendas oficiales (Google Play, Samsung, Amazon) requieren APK firmado con clave de release.

5. **Updates:** Solo las tiendas automáticas ofrecen actualizaciones. En descargas directas, los usuarios deben descargar la nueva versión manualmente.

---

*Documento creado: 2026-07-14*
