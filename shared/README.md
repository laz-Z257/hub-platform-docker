# Shared

Tipos y utilidades compartidas entre `web/`, `mobile/` y `backend/`.

## Estructura

```
shared/
├── types/
│   ├── auth.ts       # AuthUser, LoginInput, RegisterInput, AuthResponse
│   ├── user.ts       # ApiUser
│   ├── incident.ts   # Incident, IncidentComment, CreateIncidentInput, etc.
│   └── api.ts        # PaginatedResponse<T>
└── index.ts          # Barrel export
```

## Uso

Desde cualquier subproyecto:

```ts
import type { AuthUser } from "../../shared/types/auth";
import type { Incident } from "../../shared/types/incident";
import type { PaginatedResponse } from "../../shared/types/api";
```
