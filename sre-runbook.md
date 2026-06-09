# SRE Runbook — Mitigaciones inmediatas y comandos

Este runbook incluye pasos operativos que el equipo de SRE puede ejecutar sin modificar el código fuente para mitigar riesgos detectados en la auditoría.

## Objetivos inmediatos
- Reducir exposición de endpoints sensibles
- Mitigar riesgo de robo de tokens por XSS
- Evitar exfiltración de datos y cuentas fantasma

## Pasos operativos (prioridad alta)

1) Rotación de secrets

- Si el archivo `backend/docker-compose.yml` fue compartido o subido a un repositorio público, rotar inmediatamente:
  - contraseña de PostgreSQL
  - `JWT_SECRET`

Ejemplo (depende del proveedor):

```bash
# En servidor/secret manager: generar nuevos valores y actualizar la configuración de despliegue
# Ejemplo local (no recomendado para prod):
export NEW_PG_PASS="$(openssl rand -hex 16)"
export NEW_JWT_SECRET="$(openssl rand -hex 32)"
# Actualizar en el servicio de despliegue (Railway/Render/GCP/etc) usando su UI o API
```

2) Aislar entornos (IP allowlist / VPN)

- Limitar acceso a staging/production al equipo mediante VPN o allowlist de IPs mientras se realizan fixes.

3) Reglas WAF básicas

- Bloquear tráfico con patrones sospechosos hacia endpoints de comentarios y stats. Ejemplo de regla (Cloudflare WAF): bloquear requests con `POST` a `/api/incidents/` con payload anómalo.

4) Ejecutar auditoría de dependencias

```bash
cd backend
npm ci
npm audit --production
cd ../web
npm ci
npm audit --production
cd ../mobile
npm ci
npm audit --production
```

Revisar resultados y priorizar actualizaciones de dependencias con vulnerabilidades críticas.

5) Habilitar CSP

- En el servidor proxy (Nginx) o proveedor CDN, definir un header CSP restrictivo. Ejemplo mínimo:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';
```

6) Monitoreo y alertas

- Configurar alertas para:
  - Picos inusuales de `POST /api/incidents/:id/comments`
  - Múltiples fallos de login desde misma IP
  - Acceso a `/api/incidents/stats` desde cuentas no-admin

7) Backups y snapshots

- Realizar backup completo antes de cualquier cambio mayor en producción.

## Comandos rápidos para auditoría de logs (ejemplos)

```bash
# Buscar accesos a endpoints de comentarios en logs
grep -R "/api/incidents/" /var/log/* | grep comments

# Buscar requests a /api/incidents/stats
grep -R "/api/incidents/stats" /var/log/*
```

## Notas finales
- Estos pasos mitigan riesgo inmediato. Para resolver definitivamente se deben aplicar cambios en código (ver `audit-report.md`).
