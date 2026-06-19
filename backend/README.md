# Backend API

API REST del hub-platform. Express + TypeScript + Drizzle ORM + PostgreSQL.

## Stack

- Express 4
- Drizzle ORM + pg
- Zod (validación)
- JWT (jsonwebtoken)
- bcryptjs
- Helmet + CORS + rate-limit

## Scripts

```bash
npm run dev           # Desarrollo con tsx watch
npm run build         # Compilar TypeScript
npm start             # Producción
npm run db:generate   # Generar migración Drizzle
npm run db:migrate    # Ejecutar migraciones
npm run db:seed       # Poblar DB con datos iniciales
```

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/login | ❌ | Login |
| POST | /api/auth/register | ❌ | Registro |
| GET | /api/auth/me | ✅ | Perfil actual |
| POST | /api/auth/refresh | ❌ | Renovar token |
| POST | /api/auth/logout | ❌ | Cerrar sesión |
| GET | /api/incidents | ✅ | Listar incidentes |
| POST | /api/incidents | ✅ | Crear incidente |
| GET | /api/incidents/stats | ✅ | Estadísticas |
| GET | /api/incidents/export | ✅ | Exportar Excel |
| GET | /api/users | ✅ | Listar usuarios |
| POST | /api/users | ✅ | Crear usuario |
| GET | /api/puntos-venta | ✅ | Listar puntos de venta |
| GET | /api/ratings | ✅ | Estadísticas de calificaciones |
