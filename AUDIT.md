# Auditoría — hub-platform

> **Fecha:** 2026-06-10
> **Proyectos:** Web (Next.js 15), Mobile (Expo SDK 56), Backend (Express + Drizzle)

---

## 🔴 HIGH

- [ ] **H1 — `console.log` filtrando data cruda de API**
  Archivo: `web/src/components/UserManagement.tsx:54-57`
  Tres `console.log` que exponen datos de usuarios en consola del navegador.

- [ ] **H2 — Seed imprime contraseña admin a stdout**
  Archivo: `backend/src/db/seed.ts:27`
  En Render/Docker, `console.log` queda en logs del cloud. Filtra credenciales.

- [ ] **H3 — `JWT_REFRESH_SECRET` no está en `.env.example`**
  Archivo: `backend/.env.example`
  Sin él, fallback a `JWT_SECRET`. Ambos tokens usan la misma clave.

- [ ] **H4 — Mobile no tiene refresh token**
  Archivo: `mobile/src/services/api.ts:89`
  En 401 solo limpia token y fuerza re-login. Sin renovación silenciosa.

- [ ] **H5 — Tipos de `shared/` duplicados en web y mobile**
  `AuthUser`, `ApiUser`, `Incident` definidos inline en 3 proyectos distintos.
  `shared/package.json` no se referencia como workspace dependency.

---

## 🟡 MEDIUM

- [ ] **M1 — `rejectUnauthorized: false` en SSL de PostgreSQL**
  Archivo: `backend/src/db/index.ts:7`
  Deshabilita verificación SSL. Seguro solo si la DB está en la red interna de Render.

- [ ] **M2 — Placeholders `XXXXXXXXXXXX` en Settings**
  Archivo: `web/src/app/dashboard/settings/page.tsx`
  Campos de empresa con valores dummy no funcionales.

- [ ] **M3 — Botones sin handler**
  - `Topbar.tsx`: "Añadir Usuario" sin onClick
  - `tickets/page.tsx:249`: "Abrir Nuevo Ticket" sin onClick
  - `settings/page.tsx`: "Descartar Cambios" y "Guardar Configuración" sin handlers

---

## ⚪ LOW

- [ ] **L1 — 0 tests en todo el repo**
  Sin archivos `*.test.ts`, `*.spec.ts` ni `__tests__/`.

- [ ] **L2 — `console.error` como raw catch handler**
  Archivos: `mobile/app/historial.tsx:55`, `mobile/app/incidente/[id].tsx:73`
  Pasan `console.error` directamente como handler sin mensaje.

---

## 📊 Stats

| Proyecto | Líneas | Componentes | Rutas |
|----------|--------|-------------|-------|
| Web | ~4,000 | 18 | 8 |
| Mobile | ~3,100 | 15 | 6 |
| Backend | ~1,700 | — | 20 |
| Shared | ~80 | — | — |
| **Total** | **~9,000** | **33** | **34** |
