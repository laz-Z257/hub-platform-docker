# PENDIENTES - HUB Platform

**Última actualización:** 2026-07-14

---

## 🚨 IMPORTANTE - Cambios Recientes

### Secrets regenerateos

Los secrets en producción deben actualizarse:

```bash
# En el servidor, copia .env.local a .env
cp .env.local .env

# O actualiza manualmente estos valores:
POSTGRES_PASSWORD=y1949Kk2q9tmw5oMfv52aWyyiFyld3dV
JWT_SECRET=fae0ac75da8188f4c75a3ef1b2c3361fbbb1c4918db42a134a58455106768edf
JWT_REFRESH_SECRET=d399e56e58888de185e3315d5cfbbf48e69f7dd915b21d6b77ac627c38dae957

# Reiniciar servicios
docker compose restart
```

---

## ✅ CORREGIDOS Recientemente (2026-07-14)

| Fecha | Corrección |
|-------|------------|
| 2026-07-14 | Validación rating 1-5 |
| 2026-07-14 | Health check separado (/health y /health/db) |
| 2026-07-14 | Error handler mejorado (Zod/auth diferenciados) |
| 2026-07-14 | Docker SHA digest (postgres) |
| 2026-07-14 | .env.example con valores placeholder |
| 2026-07-14 | Rol asesor verificado correcto |
| 2026-07-14 | Auth middleware async/await |
| 2026-07-14 | Rate limiting login (3/min) |

---

## ⏳ PENDIENTES

### 🔴 CRÍTICO (1)

| # | Descripción | Solución |
|---|-------------|----------|
| 1 | Actualizar secrets en servidor | Copiar .env.local a .env y reiniciar |

### 🟠 ALTOS (6)

| # | Descripción | Solución | Complejidad |
|---|-------------|----------|:-----------:|
| 2 | Resource limits Docker | `deploy.resources.limits` en compose | 10 min |
| 3 | node:22-alpine SIN SHA | Agregar @sha256 | 5 min |
| 4 | nginx:alpine SIN SHA | Agregar @sha256 | 5 min |
| 5 | users.email sin UNIQUE | ALTER TABLE | 5 min |
| 6 | Contenedores como root | USER directive en Dockerfiles | 10 min |
| 7 | PostgreSQL sin shm_size | Agregar en compose | 5 min |

### 🟡 MEDIOS (9)

| # | Descripción | Solución | Complejidad |
|---|-------------|----------|:-----------:|
| 8 | Índice en users.estado | ALTER TABLE | 5 min |
| 9 | Índice en incidents.agente | ALTER TABLE | 5 min |
| 10 | Índice en incidents.cerrado_por | ALTER TABLE | 5 min |
| 11 | CHECK constraint ratings.puntuacion | ALTER TABLE | 5 min |
| 12 | Validación teléfono numérico | Zod schema | 5 min |
| 13 | Agente vacío en updateIncident | Validación Zod | 5 min |
| 14 | Límite en search puntos-venta | Zod schema | 5 min |
| 15 | Email acepta vacío "" | Zod schema | 5 min |
| 16 | Migrate/seed en cada startup | Separar scripts | 15 min |

---

## 📋 RESUMEN

| Prioridad | Pendientes | Fácil (<10min) |
|-----------|:----------:|:---------------:|
| 🔴 CRÍTICO | 1 | 1 |
| 🟠 ALTO | 6 | 5 |
| 🟡 MEDIA | 9 | 8 |
| **TOTAL** | **16** | **14** |

---

## 🎯 ACCIONES INMEDIATAS (Al llegar al servidor)

1. Copiar `.env.local` a `.env` en el servidor
2. Ejecutar `docker compose restart`
3. Verificar que todo funciona

---

## 📝 NOTAS

- `.env` y `.env.local` están en `.gitignore` (no se suben)
- Solo `.env.example` se sube al repo (con valores placeholder)
- Los nuevos secrets fueron generados con `openssl rand -hex 32`

---

*Documento: 2026-07-14*
