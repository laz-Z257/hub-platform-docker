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
| `LoginInput` | Input para login (documento, contrasena, scope?) |
| `RegisterInput` | Input para registro (documento, nombre, contrasena) |
| `AuthResponse` | Respuesta de auth (token, user) |

### user.ts (1 tipo)

| Tipo | Descripción |
|------|-------------|
| `ApiUser` | Usuario completo con estado, ultima_actividad, bloqueado_por, bloqueado_por_documento? |

### incident.ts (6 tipos)

| Tipo | Descripción |
|------|-------------|
| `IncidentUrgency` | `"baja"` \| `"media"` \| `"alta"` |
| `IncidentStatus` | `"pendiente"` \| `"en_proceso"` \| `"resuelto"` |
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
| `CreateRatingInput` | Input para crear calificación (puntuación 1-5, comentario?) |
| `RatingStats` | Estadísticas completas de calificaciones |

## Estructura

```
shared/
├── index.ts          # Exporta todos los tipos
├── package.json      # @hub/shared
├── tsconfig.json     # Configuración TypeScript
└── types/
    ├── index.ts      # Re-exporta todos los módulos
    ├── auth.ts       # Tipos de autenticación
    ├── user.ts       # Tipos de usuario
    ├── incident.ts   # Tipos de incidentes
    ├── api.ts        # Tipos de API responses
    └── rating.ts     # Tipos de calificaciones
```

## Notas

- Este paquete no se compila por separado, se importa directamente desde los otros módulos
- Backend, web y mobile lo referencian como `"@hub/shared": "file:../shared"`
- Los tipos se usan para asegurar consistencia entre frontend y backend