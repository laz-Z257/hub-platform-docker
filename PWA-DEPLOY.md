# PWA Mobile - Guía de Despliegue y Mantenimiento

> Última actualización: 2026-07-09

## Estado Actual

✅ PWA funcionando en: **https://push-simulation-plc-trout.trycloudflare.com**

---

## Cambios Realizados (2026-07-09)

### 1. Fix: Preguntas frecuentes y acciones sugeridas

**Problema:** Al navegar a otra pantalla y volver al chat, se perdía el mensaje de bienvenida con las acciones sugeridas.

**Solución:** El mensaje de bienvenida solo aparece si no hay historial. Si ya existe historial, se mantienen los mensajes anteriores.

**Archivo modificado:** `mobile/src/screens/ChatScreen.tsx`

### 2. Favicon/Logo para PWA

**Problema:** El favicon era muy pequeño para verse bien al instalar la PWA.

**Solución:** Se copió `logo.png` como `favicon.png` y se creó `manifest.json` con el logo de 512x512.

**Archivos modificados:**
- `mobile/assets/favicon.png`
- `mobile/dist/manifest.json` (creado)
- `mobile/dist/index.html`

### 3. Script de Deploy Manual

**Archivo:** `deploy-pwa.sh` (ejecutable)

**Uso:**
```bash
./deploy-pwa.sh
```

**Qué hace:**
1. Exporta la PWA desde mobile
2. Copia los archivos al contenedor ota-server
3. Reinicia el servidor

### 4. GitHub Actions (para deploy automático)

**Archivo:** `.github/workflows/deploy-pwa.yml`

Se activa automáticamente cuando hay cambios en `mobile/**` en la rama main.

**Secrets requeridos en GitHub:**
- `SERVER_HOST` - IP del servidor
- `SERVER_USER` - usuario SSH
- `SERVER_SSH_KEY` - clave privada SSH
- `SERVER_PORT` - puerto SSH (default 22)
- `SERVER_DEPLOY_PATH` - ruta de despliegue
- `EXPO_PUBLIC_API_URL` - URL de la API en producción

---

## Comandos Útiles

### Levantar todos los servicios
```bash
docker compose up -d postgres api web ota-server
```

### Ver logs
```bash
docker compose logs -f
```

### Regenerar PWA localmente
```bash
cd mobile
echo "EXPO_PUBLIC_API_URL=https://tu-dominio.com/api" > .env
npx expo export --platform web --clear
cd ..
docker compose cp mobile/dist/. ota-server:/usr/share/nginx/html/hub-mobile/
docker compose restart ota-server
```

### Levantar túnel cloudflared (temporal)
```bash
./cloudflared tunnel --url http://localhost:3002
```

---

## URLs

| Servicio | URL |
|----------|-----|
| Dashboard Web | http://localhost:3000 |
| PWA Móvil | http://localhost:3002/hub-mobile |
| API Backend | http://localhost:3001/api |
| Túnel temporal | (varía cada vez) |

---

## Pendientes

1. **Servidor propio** - Necesita VPS para producción
2. **Deploy automático** - Configurar GitHub Actions cuando se tenga servidor
3. **Dominio fijo** - Configurar dominio propio en lugar de cloudflared
4. **Persistir archivos PWA** - Modificar docker-compose.yml para guardar en disco
5. **Limpiar código** - Eliminar Dockerfiles de APK (mobile-builder, ota-builder) si no se usan

---

## Credenciales de Prueba

| Campo | Valor |
|-------|-------|
| Documento | `123456789` |
| Contraseña | `admin123` |
| Rol | `admin` |

---

## Notas

- El túnel cloudflared **no es permanente**. Se corta cuando se apaga el PC.
- La PWA usa cache del navegador. Para ver cambios, hacer hard refresh o reinstalar.
- Para producción, usar VPS propio con Docker.
