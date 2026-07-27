# Shared Types

Tipos TypeScript compartidos entre backend, web y mobile.

## Uso

```typescript
import { AuthUser, Incident, PaginatedResponse } from "@hub/shared";
```

## Tipos Exportados (18)

### auth.ts (4 tipos)

| Tipo | Descripción |
|------|-------------|
| `AuthUser` | Usuario autenticado (id, documento, nombre, rol) |
| `LoginInput` | Input para login (documento, contrasena) |
| `RegisterInput` | Input para registro (documento, nombre, contrasena) |
| `AuthResponse` | Respuesta de auth (token, user) |

### user.ts (1 tipo)

| Tipo | Descripción |
|------|-------------|
| `ApiUser` | Usuario completo con estado, ultima_actividad, bloqueado_por |

### incident.ts (6 tipos)

| Tipo | Descripción |
|------|-------------|
| `IncidentUrgency` | "baja" \| "media" \| "alta" |
| `IncidentStatus` | "pendiente" \| "en_proceso" \| "resuelto" |
| `Incident` | Incidente completo con comentarios opcionales |
| `IncidentComment` | Comentario de incidente (autor, texto, fecha) |
| `CreateIncidentInput` | Input para crear incidente |
| `UpdateIncidentInput` | Input para actualizar incidente (estado, agente) |

### api.ts (4 tipos)

| Tipo | Descripción |
|------|-------------|
| `PaginatedResponse<T>` | Respuesta paginada genérica |
| `KpiResponse` | KPIs del dashboard |
| `CompanySettings` | Configuración de empresa |
| `DashboardSummary` | Resumen completo del dashboard |

### rating.ts (5 tipos)

| Tipo | Descripción |
|------|-------------|
| `Rating` | Calificación básica (puntuación, comentario) |
| `RatingWithDetails` | Calificación con datos del usuario y ticket |
| `PromedioPv` | Promedio de calificación por punto de venta |
| `CreateRatingInput` | Input para crear calificación |
| `RatingStats` | Estadísticas completas de calificaciones |
