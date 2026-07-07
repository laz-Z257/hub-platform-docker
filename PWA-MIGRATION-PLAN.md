# Plan de Migración: Expo Native App → PWA

## Objetivo

Migrar la aplicación mobile de **Expo (APK nativo)** a **PWA (Progressive Web App)** para eliminar la complejidad de compilación Android/Java SDK, manteniendo la misma experiencia de usuario.

---

## Estado Actual vs Futuro

### Estado Actual
```
mobile/
├── app/                    # Expo Router (file-based routing)
├── src/
│   ├── components/         # 18 componentes
│   ├── services/
│   └── types/
├── package.json
├── app.json
├── tailwind.config.js
├── Dockerfile.builder      # Compila APK (~8GB, lento)
├── Dockerfile.ota          # Genera bundle OTA (~5GB)
└── ...
```

### Estado Futuro
```
mobile/
├── app/                    # Expo Router (file-based routing)
├── src/
│   ├── components/         # Se mantienen
│   ├── services/
│   └── types/
├── package.json            # Se agrega "web" en expo
├── app.json                # Se configura PWA
├── tailwind.config.js      # Se mantiene
└── Dockerfile.*            # SE ELIMINAN ❌
```

---

## Estructura del Plan

### FASE 1: Preparación
### FASE 2: Cambios en el Proyecto Mobile
### FASE 3: Configuración del Servidor
### FASE 4: Pruebas
### FASE 5: Limpieza (opcional post-prueba)

---

## FASE 1: Preparación

### 1.1 Backup del proyecto actual

```bash
# En la raíz del proyecto
cp -r mobile mobile_backup_expo
```

### 1.2 Documentar estado actual

- [x] `mobile/package.json` actual
- [x] `mobile/app.json` actual
- [x] `mobile/Dockerfile.builder` (lo eliminamos)
- [x] `mobile/Dockerfile.ota` (lo eliminamos)

### 1.3 Credenciales y configuración a preserve

- `app.json` (nombre, slug, icons)
- `package.json` (dependencies)
- `src/services/api.ts` (URL del API)
- `.env` variables

---

## FASE 2: Cambios en el Proyecto Mobile

### 2.1 Modificar `package.json`

**ANTES:**
```json
{
  "name": "hub-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  }
}
```

**DESPUÉS:**
```json
{
  "name": "hub-mobile",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "start:web": "expo start --web",
    "build:web": "expo export --platform web",
    "web": "npx serve dist"
  }
}
```

### 2.2 Modificar `app.json`

**ANTES:**
```json
{
  "expo": {
    "name": "Hub Mobile",
    "slug": "hub-mobile",
    "ios": {
      "bundleIdentifier": "com.hub.mobile"
    },
    "android": {
      "package": "com.hub.mobile"
    }
  }
}
```

**DESPUÉS:**
```json
{
  "expo": {
    "name": "Hub Mobile",
    "slug": "hub-mobile",
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    }
  }
}
```

### 2.3 Instalar dependencias web

```bash
cd mobile
npm install --save-dev serve
```

### 2.4 Ajustar `src/services/api.ts` (si es necesario)

Verificar que las llamadas al API usen la URL correcta para web. El API ya está en `http://api:3001` dentro de Docker.

### 2.5 Build del PWA

```bash
cd mobile
npx expo export --platform web
```

Esto genera una carpeta `dist/` con todos los archivos estáticos.

---

## FASE 3: Configuración del Servidor

### Opción A: Usar `ota-server` existente (RECOMENDADA)

El archivo `ota-server` ya usa nginx y sirve archivos estáticos en puerto 3002.

#### 3.1 Crear carpeta para el PWA

```bash
mkdir -p ota-server/usr/share/nginx/html/hub-mobile
```

#### 3.2 Copiar archivos buildeados

```bash
cp -r mobile/dist/* ota-server/usr/share/nginx/html/hub-mobile/
```

#### 3.3 Configurar nginx para PWA

**ANTES** (`ota-server/nginx.conf`):
```nginx
server {
    listen 3002;
    root /usr/share/nginx/html;
    # ... config actual
}
```

**DESPUÉS:**
```nginx
server {
    listen 3002;
    root /usr/share/nginx/html;
    index index.html;

    # Servir archivos del PWA mobile
    location /hub-mobile/ {
        alias /usr/share/nginx/html/hub-mobile/;
        try_files $uri $uri/ /hub-mobile/index.html;
    }

    # SPA fallback (importante para Expo Router)
    location /hub-mobile {
        try_files $uri $uri/ /hub-mobile/index.html;
    }

    # CORS headers para PWA
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
}
```

#### 3.4 Regenerar imagen docker

```bash
docker compose build ota-server
docker compose up -d ota-server
```

### Opción B: Servicio nginx separado

Si prefieres no modificar `ota-server`:

#### 3.1 Crear nuevo Dockerfile

```dockerfile
FROM nginx:alpine
COPY mobile/dist /usr/share/nginx/html
COPY nginx-pwa.conf /etc/nginx/conf.d/default.conf
EXPOSE 3003
CMD ["nginx", "-g", "daemon off;"]
```

#### 3.2 Agregar al docker-compose.yml

```yaml
pwa-mobile:
  build:
    context: .
    dockerfile: Dockerfile.pwa
  ports:
    - "3003:80"
  profiles:
    - pwa
```

---

## FASE 4: Pruebas

### 4.1 Pruebas Locales (sin Docker)

```bash
# En terminal 1: iniciar API y DB
docker compose up postgres api

# En terminal 2: servir PWA
cd mobile
npx serve dist -l 3003

# Abrir navegador en http://localhost:3003
```

### 4.2 Pruebas con Docker completo

```bash
# Regenerar imágenes
docker compose build ota-server

# Subir todo
docker compose up -d

# Probar PWA en http://localhost:3002/hub-mobile
```

### 4.3 Checklist de pruebas

| Feature | Probar | Estado |
|---------|--------|--------|
| Login con credenciales válidas | ❓ | |
| Login con credenciales inválidas | ❓ | |
| Mensaje de usuario bloqueado | ❓ | |
| Chat: enviar mensaje | ❓ | |
| Chat: recibir respuesta bot | ❓ | |
| Reportar incidente | ❓ | |
| Subir imagen en reporte | ❓ | |
| Ver historial de incidentes | ❓ | |
| Ver detalle de incidente | ❓ | |
| Calificar incidente (1-5 estrellas) | ❓ | |
| Modo oscuro | ❓ | |
| Modo claro | ❓ | |
| Instalar PWA en Android (Agregar a pantalla inicio) | ❓ | |
| Notificaciones en Android | ❓ | |
| Offline (sin conexión) | ❓ | |
| Logout | ❓ | |

### 4.4 Responsive (opcional)

Probar en diferentes tamaños de pantalla:
- [ ] iPhone SE
- [ ] iPhone 14
- [ ] iPad
- [ ] Desktop

---

## FASE 5: Limpieza (post-prueba exitosa)

### 5.1 Archivos a eliminar

```bash
rm mobile/Dockerfile.builder
rm mobile/Dockerfile.ota
```

### 5.2 Eliminar profiles del docker-compose.yml

Buscar y eliminar estas líneas del `docker-compose.yml`:

```yaml
ota-builder:
  build: ./mobile (Dockerfile.ota)
  profiles: [build-only]

mobile-builder:
  build: . (mobile/Dockerfile.builder)
  profiles: [build-only]
```

### 5.3 Backup de seguridad

```bash
# Guardar backup limpio
cp -r mobile_backup_expo mobile_expo_backup_final
rm -rf mobile_backup_expo
```

---

## Cómo Hacer Rollback (si algo sale mal)

### Opción 1: Restaurar backup

```bash
# Si falló todo, restaurar el backup
rm -rf mobile
cp -r mobile_backup_expo mobile
docker compose build api web
docker compose up -d
```

### Opción 2: Solo volver atrás el PWA

```bash
# Mantener el PWA creado pero no usarlo
# Cambiar configuración para seguir usando Expo
cp mobile_backup_expo/Dockerfile.builder mobile/
cp mobile_backup_expo/Dockerfile.ota mobile/
docker compose build ota-server
docker compose up -d
```

---

## Preguntas Frecuentes

### ¿Pierdo las notificaciones push?

**Android**: No, las notificaciones web (Push API) funcionan en Android Chrome.

**iOS**: Sí, Safari no soporta Web Push. Los usuarios de iOS no recibirán notificaciones push en el PWA.

### ¿Puedo seguir usando la cámara?

Sí, pero con `<input type="file" accept="image/*" capture="environment">` en vez de `expo-camera`. El selector de archivos permite tomar foto también.

### ¿Los usuarios necesitan instalar algo?

En Android Chrome: aparece un banner "Agregar a pantalla de inicio". En iOS: Settings > "Agregar a pantalla de inicio".

### ¿El PWA funciona offline?

Sí, con Service Worker puedes cachear las páginas y datos. Expo tiene soporte para esto.

---

## Tiempo Estimado

| Fase | Tiempo |
|------|--------|
| Preparación | 5 min |
| Cambios en proyecto | 15 min |
| Configurar servidor | 10 min |
| Build y deploy | 10 min |
| **Total** | **~40 min** |

---

## Comandos Resumen

```bash
# 1. BACKUP
cp -r mobile mobile_backup_expo

# 2. MODIFICAR package.json y app.json
# (editar archivos manualmente)

# 3. INSTALAR deps
cd mobile && npm install --save-dev serve

# 4. BUILD PWA
npx expo export --platform web

# 5. COPIAR a nginx
mkdir -p ota-server/usr/share/nginx/html/hub-mobile
cp -r mobile/dist/* ota-server/usr/share/nginx/html/hub-mobile/

# 6. REBUILD nginx
docker compose build ota-server
docker compose up -d ota-server

# 7. PROBAR
# Abrir http://localhost:3002/hub-mobile

# 8. SI TODO OK - LIMPIAR
rm mobile/Dockerfile.builder mobile/Dockerfile.ota
# (editar docker-compose.yml para quitar profiles)
```

---

## Alternativa: Mantener Ambos (Expo + PWA)

Si no quieres decidir ahora, puedes mantener los 2:

```bash
# Seguir compilando APK cuando quieras
docker compose --profile build-only run mobile-builder

# Y también tener PWA disponible
docker compose --profile pwa run pwa-mobile
```

Así decides después cuál usar.

---

*Documento creado: 2026-07-07*
*Versión del plan: 1.0*
