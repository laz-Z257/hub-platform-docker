# Roadmap de Mejoras

Documento de recomendaciones para continuar evolucionando HUB AI Assistant después de la primera entrega.

## Estado Actual

El proyecto ya cuenta con:

- Backend REST con Express, TypeScript, PostgreSQL y Drizzle ORM.
- Dashboard administrativo en Next.js y React.
- Aplicación móvil como PWA instalable.
- Autenticación con cookies HTTP-only, JWT, CSRF y roles.
- Gestión de tickets, comentarios, técnicos, usuarios y calificaciones.
- Chatbot, métricas, exportación a Excel y notificaciones push.
- Docker Compose para PostgreSQL, API, web y PWA.
- Tests unitarios pasando en backend, web y mobile.
- Guía de despliegue para servidor Docker.

## Prioridad Alta

### 1. Pruebas End-to-End

Validar los flujos completos desde la interfaz, no solo funciones aisladas.

Flujos recomendados:

- Login de administrador y usuario.
- Creación de un ticket.
- Asignación a un técnico.
- Cambio de estado y resolución.
- Comentarios y calificación.
- Chatbot y consulta del historial.
- Bloqueo y desbloqueo de usuarios.
- Exportación de tickets.

Herramienta sugerida: Playwright.

Se considera terminada cuando los flujos principales se ejecutan automáticamente contra un entorno de prueba y generan evidencias claras cuando fallan.

### 2. Integración Continua

Agregar GitHub Actions para ejecutar automáticamente:

- Tests del backend.
- Tests del dashboard.
- Tests de mobile.
- Verificación de TypeScript.
- Lint.
- Builds de backend, web y PWA.
- Validación de `docker compose config`.

Se considera terminada cuando ningún pull request puede aprobarse si fallan tests, lint o build.

### 3. Backups Automáticos

Configurar backups periódicos de PostgreSQL.

Recomendaciones:

- Backup diario.
- Retención mínima de 7 a 30 días.
- Copia fuera del servidor principal.
- Prueba mensual de restauración.
- Documentar el procedimiento de recuperación.

Se considera terminada cuando existe un backup verificable y se ha probado restaurar la base de datos.

### 4. Monitoreo y Alertas

Incorporar observabilidad para detectar errores antes de que los usuarios los reporten.

Recomendaciones:

- Sentry para errores frontend y backend.
- Alertas cuando la API no responda.
- Alertas cuando PostgreSQL no esté saludable.
- Métricas de latencia y errores HTTP.
- Revisión periódica de logs.

Se considera terminada cuando un error controlado genera un evento visible y una alerta.

### 5. Revisión de Seguridad de Producción

Revisar antes de publicar el sistema:

- No exponer directamente el puerto `3001` a Internet.
- Permitir únicamente tráfico HTTPS mediante Nginx.
- Validar tipo y tamaño de archivos subidos.
- Confirmar que los uploads no permitan ejecutar código.
- Mantener secretos únicamente en variables de entorno.
- Rotar secretos si algún `.env` fue compartido.
- Revisar permisos de los volúmenes Docker.
- Mantener dependencias actualizadas.

Se considera terminada cuando se documenta una revisión de seguridad y no existen secretos en Git.

## Prioridad Media

### 6. Mejorar el Chatbot

Evolucionar el chatbot actual con:

- Más intenciones y respuestas.
- Contexto del ticket actual.
- Respuestas basadas en preguntas frecuentes administrables.
- Derivación a un asesor.
- Integración opcional con un modelo de IA.
- Registro de preguntas sin respuesta para mejorar el sistema.

### 7. Ampliar Analytics

Agregar indicadores para mejorar la gestión:

- Tiempo promedio de resolución.
- Tickets por técnico.
- Tickets por punto de venta.
- Cumplimiento de tiempos objetivo.
- Tendencias por día, semana y mes.
- Porcentaje de tickets reabiertos.
- Exportación de reportes filtrados.

### 8. Notificaciones

Ampliar las notificaciones actuales:

- Aviso al asignar un ticket.
- Aviso al cambiar el estado.
- Aviso al agregar un comentario.
- Aviso al resolver un ticket.
- Notificaciones por correo opcionales.
- Preferencias de notificación por usuario.

### 9. Auditoría de Cambios

Crear un historial de acciones administrativas:

- Usuario que realizó la acción.
- Fecha y hora.
- Acción ejecutada.
- Registro afectado.
- Valores anteriores y nuevos cuando aplique.
- Dirección IP o identificador de solicitud cuando sea necesario.

Acciones prioritarias: cambios de estado, asignaciones, bloqueos, resets de contraseña y cambios de configuración.

### 10. Accesibilidad y Experiencia de Usuario

Mejorar la experiencia en web y mobile:

- Navegación completa con teclado.
- Etiquetas para lectores de pantalla.
- Contraste WCAG adecuado.
- Estados de carga claros.
- Mensajes de error comprensibles.
- Confirmaciones antes de acciones destructivas.
- Validación consistente en todos los formularios.

## Prioridad Futura

### 11. Aplicación Nativa

Si se necesita distribución móvil tradicional:

- Generar APK de pruebas con Expo EAS.
- Generar AAB de producción.
- Configurar firma y credenciales de Android.
- Publicar en Google Play si corresponde.
- Mantener la PWA como alternativa web.

Los builds nativos son opcionales y no forman parte del flujo principal de Docker.

### 12. Funcionamiento Offline Avanzado

Ampliar la PWA para permitir:

- Crear reportes sin conexión.
- Guardar reportes en una cola local.
- Sincronizar automáticamente al recuperar conexión.
- Mostrar conflictos de sincronización.
- Informar claramente cuándo los datos aún no fueron enviados.

### 13. Soporte Multiempresa

Si el producto se ofrecerá a varias empresas:

- Separar los datos por organización.
- Asociar usuarios y tickets a una organización.
- Configurar branding por empresa.
- Definir administradores por organización.
- Aplicar aislamiento estricto en todas las consultas.

### 14. Internacionalización

Preparar traducciones para:

- Español.
- Inglés.
- Mensajes del backend.
- Etiquetas del dashboard.
- Mensajes de validación.
- Chatbot y preguntas frecuentes.

### 15. Documentación Operativa

Agregar documentación para usuarios y administradores:

- Manual de usuario final.
- Manual de administrador.
- Manual de soporte técnico.
- Capturas de pantalla.
- Procedimiento de recuperación ante fallos.
- Procedimiento de actualización sin pérdida de datos.
- Preguntas frecuentes.

## Orden Recomendado

1. Pruebas end-to-end.
2. Integración continua.
3. Backups y restauración.
4. Monitoreo y alertas.
5. Revisión de seguridad.
6. Auditoría de cambios.
7. Notificaciones ampliadas.
8. Analytics avanzado.
9. Mejoras de accesibilidad.
10. Funcionalidades futuras según necesidad del negocio.

## Criterio General de Calidad

Una mejora debe incluir:

- Código implementado.
- Pruebas automatizadas cuando sea posible.
- Actualización de la documentación.
- Verificación local.
- Revisión de seguridad si afecta autenticación, datos o infraestructura.
- Instrucciones de despliegue si modifica Docker o variables de entorno.
