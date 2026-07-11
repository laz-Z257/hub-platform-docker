# PWA Deploy - Quick Reference

## ⚠️ REGLA CRÍTICA
URL DEBE terminar en `/api`

```
✅ CORRECTO:  https://tu-dominio.com/api
❌ INCORRECTO: https://tu-dominio.com
```

**Sin `/api` → error 405 Method Not Allowed**

---

## Deploy (3 pasos)

```bash
# 1. Levantar servicios
docker compose up -d postgres api web ota-server

# 2. Deploy PWA
./deploy-pwa.sh

# 3. Tunnel
./cloudflared tunnel --url http://localhost:3002
```

---

## Si cambia el tunnel

Cada vez que cloudflared genera URL nueva:

```bash
# 1. Copiar nueva URL del tunnel

# 2. Actualizar mobile/.env
echo "EXPO_PUBLIC_API_URL=https://NUEVA-URL.trycloudflare.com/api" > mobile/.env

# 3. Redeploy
./deploy-pwa.sh
```

---

## Icono para instalación (512x512)

El icono de 512x512 ya está configurado en:
- `mobile/assets/icon-512.png`
- `mobile/assets/icon.png` (copia del 512)
- `mobile/assets/favicon.png` (copia del 512)

Si se rompe o necesitas regenerar:
```bash
python3 << 'EOF'
from PIL import Image
logo = Image.open('mobile/assets/logo.png')
size = 512
new_img = Image.new('RGBA', (size, size), (245, 246, 250, 255))
logo_ratio = logo.width / logo.height
if logo_ratio > 1:
    new_width = int(size * 0.8)
    new_height = int(new_width / logo_ratio)
else:
    new_height = int(size * 0.8)
    new_width = int(new_height * logo_ratio)
x = (size - new_width) // 2
y = (size - new_height) // 2
logo_resized = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
new_img.paste(logo_resized, (x, y), logo_resized)
new_img.save('mobile/assets/icon-512.png')
new_img.save('mobile/assets/icon.png')
new_img.save('mobile/assets/favicon.png')
EOF
```

---

## Archivos que se generan

```
mobile/dist/
├── index.html         (con manifest + meta tags)
├── manifest.json      (para PWA)
├── favicon.ico
├── assets/
│   └── icon-512.png   (512x512)
└── _expo/static/...   (JS/CSS bundle)
```

---

## Debug

```bash
# Ver estado servicios
docker compose ps

# Ver logs
docker compose logs ota-server

# Verificar URL embebida
docker compose exec ota-server grep -o "https://[a-z0-9-]*\.trycloudflare\.com/api" /usr/share/nginx/html/_expo/static/js/web/index-*.js | head -1

# Verificar API responde
curl http://localhost:3002/api/health

# Verificar manifest
curl http://localhost:3002/manifest.json

# Verificar icono
curl -I http://localhost:3002/assets/icon-512.png
```

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 405 Method Not Allowed | URL sin `/api` | Agregar `/api` al final |
| Sin conexión a internet | API no responde | Verificar nginx + API |
| Icono borroso | Icono pequeño | Regenerar 512x512 |
| Cache old | PWA cacheada | Desinstalar y reinstallar |

---

## URLs

| Servicio | URL |
|----------|-----|
| PWA (tunnel actual) | https://jvc-palace-partnerships-opponents.trycloudflare.com |
| Dashboard Web | http://localhost:3000 |
| API | http://localhost:3001/api |

---

## Credenciales

| Campo | Valor |
|-------|-------|
| Documento | `123456789` |
| Contraseña | `admin123` |
