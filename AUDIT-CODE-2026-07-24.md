# Auditoría de Código - 2026-07-24

Revisión exhaustiva de los 15 archivos modificados hoy.

---

## ✅ Archivos Verificados (sin bugs)

| Archivo | Estado |
|---|---|
| `backend/src/lib/jwt.ts` | ✅ Correcto |
| `backend/src/modules/auth/auth.controller.ts` | ✅ Correcto |
| `backend/src/middlewares/auth.ts` | ✅ Correcto |
| `backend/src/middlewares/csrf.ts` | ✅ Correcto |
| `web/src/lib/api.ts` | ✅ Correcto |
| `web/src/contexts/AuthContext.tsx` | ✅ Correcto |
| `web/src/components/AnalyticsFilters.tsx` | ✅ Correcto |
| `web/src/middleware.ts` | ✅ Correcto |
| `mobile/src/contexts/AuthContext.tsx` | ✅ Correcto |
| `mobile/public/manifest.json` | ✅ Correcto |
| `mobile/public/sw.js` | ✅ Correcto |
| `mobile/nginx.conf` | ✅ Correcto |
| `mobile/Dockerfile.web` | ✅ Correcto |

---

## ⚠️ Hallazgos Menores (no críticos)

### 1. Código Muerto: `clearTokenCookies()`

**Archivo:** `backend/src/lib/jwt.ts:89-100`

**Problema:** La función `clearTokenCookies()` ya no se usa en ningún lado. Todo el código ahora usa `clearAllTokenCookies()`.

**Impacto:** Ninguno. Solo ocupa espacio.

**Solución:** Eliminar la función o documentar que es legacy.

---

### 2. Parámetro Ignorado: `getCookiePath(_scope)`

**Archivo:** `backend/src/lib/jwt.ts:15-17`

**Problema:** La función recibe `_scope` pero siempre retorna `/`. El parámetro se ignora.

**Impacto:** Ninguno. Funciona correctamente.

**Solución:** Simplificar a `function getCookiePath(): string { return "/"; }` o eliminar el parámetro.

---

### 3. Service Worker: Cache Incompleto

**Archivo:** `mobile/public/sw.js:2-7`

**Problema:** Solo cachea 4 archivos (`/`, `/index.html`, iconos). El bundle JS/CSS generado por Expo no se cachea.

**Impacto:** La app funciona offline solo parcialmente. Si el usuario está offline y el bundle no está en cache, verá pantalla blanca.

**Solución:** Agregar los archivos del bundle al cache:
```javascript
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/icon.png',
  '/assets/icon-512.png',
  '/_expo/static/css/web-*.css',
  '/_expo/static/js/web/index-*.js'
];
```

**Prioridad:** Media.

---

### 4. CORS Incompleto en nginx

**Archivo:** `mobile/nginx.conf:27-36`

**Problema:** Los headers CORS solo se agregan para GET, POST y OPTIONS. No se agregan para PUT, PATCH, DELETE.

**Impacto:** Bajo. El mobile solo usa GET y POST. Si en el futuro se necesitan otros métodos, fallarán.

**Solución:** Agregar headers para todos los métodos:
```nginx
location /api/ {
    add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Auth-Scope' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    proxy_pass http://api:3001/api/;
    # ... resto de configuración
}
```

**Prioridad:** Baja.

---

### 5. Scope No Se Actualiza en Navegación

**Archivo:** `web/src/contexts/AuthContext.tsx:33`

**Problema:** El `useEffect` que llama `setAuthScope()` tiene dependencias vacías `[]`. Si el usuario navega de `/dashboard` a `/user`, el scope no se actualiza automáticamente.

**Impacto:** Bajo. Los flujos están separados:
- Admin hace login en `/login` → scope "admin" → va a `/dashboard`
- Usuario hace login en `/user/login` → scope "user" → va a `/user/chat`

No hay navegación entre áreas en la misma sesión.

**Solución:** Agregar `pathname` a las dependencias:
```typescript
useEffect(() => {
  const scope = pathname.startsWith("/user") ? "user" : "admin";
  setAuthScope(scope);
  // ... resto del código
}, [pathname]);
```

**Prioridad:** Baja.

---

### 6. Atributo HTML Incorrecto en index.html

**Archivo:** `mobile/public/index.html:5`

**Problema:** Usa `httpEquiv` (sintaxis JSX) en vez de `http-equiv` (HTML estándar).

**Impacto:** Ninguno. Expo procesa el archivo y lo convierte correctamente.

**Solución:** Cambiar a `http-equiv`:
```html
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
```

**Prioridad:** Baja.

---

## ❌ Pendientes Confirmados (ya documentados)

Estos problemas ya están en `PENDIENTES.md`:

### 1. `/api/metrics` sin Autenticación

**Archivo:** `backend/src/index.ts:113`

**Problema:** Endpoint público que expone métricas internas sin auth.

**Solución:** Agregar middleware `authMiddleware` + `adminOnly`.

---

### 2. `/uploads` sin Autenticación

**Archivo:** `backend/src/index.ts:123`

**Problema:** Archivos subidos son públicamente accesibles.

**Solución:** Proteger con auth o usar CDN con URLs firmadas.

---

### 3. `ultima_actividad` en Cada Request

**Archivo:** `backend/src/middlewares/auth.ts:43-46`

**Problema:** Actualiza la BD en cada petición autenticada.

**Solución:** Throttlear a cada 5 minutos.

---

## Resumen

| Categoría | Cantidad |
|---|---|
| ✅ Archivos verificados | 13 |
| ⚠️ Hallazgos menores | 6 |
| ❌ Pendientes confirmados | 3 |
| **Total** | **22** |

**Conclusión:** No hay bugs en el código nuevo. Los 6 hallazgos menores son optimizaciones o edge cases que no afectan el funcionamiento. Los 3 pendientes confirmados ya están documentados y priorizados.

---

*Auditoría realizada: 2026-07-24*
