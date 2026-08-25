# 📝 Nota: Sistema de Calificaciones (Eliminado - 2026-08-21)

## Contexto
Se eliminó completamente el sistema de calificaciones (ratings/estrellas) por decisión de negocio. El código fue removido de forma limpia sin breaking changes en el resto del sistema.

---

## Qué se eliminó

### Backend
- Módulo completo: `backend/src/modules/ratings/` (controller, routes, schema, tests)
- Tabla `ratings` del schema DB (`backend/src/db/schema.ts`)
- Referencias en dashboard controller (`backend/src/modules/dashboard/dashboard.controller.ts`)
- Rutas en `backend/src/index.ts`

### Frontend Web
- Página: `web/src/app/dashboard/ratings/`
- Componentes: `RecentRatingsTable.tsx`, `RatingSummaryCards.tsx`, `RatingCharts.tsx`
- StarRating: `web/src/components/user/StarRating.tsx`
- Lógica en chat: `web/src/app/user/(main)/chat/page.tsx`
- Link en Sidebar: "Calificaciones"

### Frontend Mobile (PWA)
- Componente: `mobile/src/components/StarRating.tsx`
- Lógica en chat: `mobile/src/screens/ChatScreen.tsx`

### Shared
- Tipos: `shared/types/rating.ts`

---

## Cómo restaurar (versión mejorada) — Guía rápida

### 1. Schema DB (nueva migración)
```sql
-- Tabla ratings con mejoras
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puntuacion SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Nuevos campos sugeridos:
  response_time_hours INTERVAL,        -- Tiempo hasta primera respuesta
  resolution_time_hours INTERVAL,      -- Tiempo total de resolución
  channel VARCHAR(20),                 -- 'web' | 'mobile' | 'bot'
  nps_category VARCHAR(10) GENERATED ALWAYS AS (
    CASE WHEN puntuacion >= 4 THEN 'promotor'
         WHEN puntuacion >= 3 THEN 'pasivo'
         ELSE 'detractor' END
  ) STORED
);
CREATE INDEX ratings_incident_id_idx ON ratings(incident_id);
CREATE INDEX ratings_user_id_idx ON ratings(user_id);
CREATE INDEX ratings_created_at_idx ON ratings(created_at);
```

### 2. Backend - Módulo nuevo (`backend/src/modules/ratings/`)
```
ratings/
├── ratings.controller.ts      # createRating, getRating, getStats, getMyRatings
├── ratings.routes.ts          # POST /:id, GET /my-ratings, GET /stats (admin)
├── ratings.schema.ts          # Zod schemas
├── ratings.controller.test.ts
└── ratings.schema.test.ts
```

**Mejoras sugeridas en controller:**
- `createRating`: Validar que el ticket esté `resuelto` + pertenezca al usuario (o admin)
- `getStats`: Agregación SQL (no cargar todo en memoria) + percentiles P50/P90
- `getMyRatings`: Para que el usuario vea su historial de calificaciones
- Endpoint público `GET /stats` para widget público (sin auth)

### 3. Dashboard Controller
```typescript
// En getSummary() agregar de vuelta:
const [ratingStats] = await db
  .select({
    promedio: sql<number>`COALESCE(AVG(${ratings.puntuacion}), 0)`,
    total: sql<number>`COUNT(*)`,
    nps: sql<number>`...`,  -- calculado en SQL
  })
  .from(ratings);
```

### 4. Frontend Web
- **Página dashboard/ratings**: Nueva con gráficos Recharts (distribución, NPS, timeline, PV)
- **Chat usuario**: Mostrar modal StarRating solo en notificación "Ticket resuelto" (usar `ticketId` del metadata)
- **Export Excel tickets**: Agregar columnas `Puntuación`, `Comentario`, `NPS` (opcional, solo si hay rating)

### 5. Frontend Mobile
- **ChatScreen**: Igual que web - modal StarRating en notificación de resuelto
- **Historial**: Mostrar estrellas junto a tickets resueltos

### 6. Tipos compartidos (`shared/types/rating.ts`)
```typescript
export interface Rating {
  id: string;
  incident_id: string;
  user_id: string;
  puntuacion: number;          // 1-5
  comentario: string | null;
  created_at: string;
  response_time_hours?: number;
  resolution_time_hours?: number;
  channel?: 'web' | 'mobile' | 'bot';
  nps_category: 'promotor' | 'pasivo' | 'detractor';
}

export interface RatingStats {
  promedio: number;
  total: number;
  nps: number;                 // %promotores - %detractores
  distribucion: Record<number, number>;
  timeline: { fecha: string; promedio: number; total: number }[];
  promedioPv: { punto_venta: string; promedio: number; total: number }[];
}
```

---

## Puntos clave para versión mejorada

| Mejora | Por qué |
|--------|---------|
| **NPS automático** | Métrica estándar de industria, calculada en BD |
| **Tiempos de respuesta/resolución** | Correlacionar satisfacción con SLA |
| **Canal de origen** | Saber si web/mobile/bot afecta la puntuación |
| **Agregación 100% SQL** | Rendimiento: no cargar miles de filas en Node |
| **Widget público** | `/api/ratings/stats` sin auth para embed en web corporativa |
| **Webhook opcional** | Enviar a Slack/Teams/Email cuando puntuación ≤ 2 |

---

## Migración inversa (rollback)
Si necesitas volver atrás YA:
```bash
git checkout HEAD -- backend/src/modules/ratings backend/src/db/schema.ts backend/src/index.ts
git checkout HEAD -- web/src/app/dashboard/ratings web/src/components/RecentRatingsTable.tsx web/src/components/RatingSummaryCards.tsx web/src/components/RatingCharts.tsx web/src/components/user/StarRating.tsx web/src/app/user/\(main\)/chat/page.tsx web/src/components/Sidebar.tsx
git checkout HEAD -- mobile/src/components/StarRating.tsx mobile/src/screens/ChatScreen.tsx
git checkout HEAD -- shared/types/rating.ts
# Luego: cd backend && npm run db:generate && npm run db:migrate
```

---

## Estado actual (post-eliminación)
- ✅ Backend: build + tests (163/163) pasan
- ✅ Web: build + tests (47/47) + lint 0 warnings
- ✅ Mobile: tests (14/14) pasan
- ✅ Docker: web, mobile, api healthy
- ⚠️ **Pendiente**: Migración DB para dropear tabla `ratings` (ejecutar cuando confirmes)