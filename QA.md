# Verificación · backend y web

Revisión realizada el 29 de septiembre de 2026.

## Pruebas automáticas

- Compilación de producción de React/Vite: correcta.
- 12 pruebas de integración de la API: todas correctas con PGlite y con PostgreSQL 17 en un contenedor local desechable.
- Registro, normalización de correo, contraseña incorrecta, cookies HttpOnly, sesión y límites de intentos.
- Validación de entrada, rechazo de cambios de plan, protección CSRF y origen.
- Separación entre cuentas: lectura, cambios y finalización de una actividad ajena rechazados.
- Preguntas sin claves de respuesta durante quizzes; calificación en el servidor y explicaciones después de finalizar.
- Respuestas y posición persistidas; errores de una actualización revierten la transacción.
- Inicio concurrente: una sola actividad y un solo descuento; renovación del balance diario; actividades abandonadas sin efecto en estadísticas.
- Marcadores idempotentes, revelado antes de autoevaluar, rechazo de doble valoración diferente y flashcards sin modificar el promedio.
- Repaso de errores según último intento, filtros por área/tema y límite de preguntas.
- Orden de misiones, cantidad controlada por servidor, recompensas idempotentes y costo cero de misiones.
- Recuperación con enlaces de un solo uso, expiración, respuesta genérica y revocación de sesiones.
- Importación validada antes de escribir; snapshots de preguntas anteriores conservados después de editar el banco; migraciones repetibles.
- Base local en disco: impide dos aperturas y conserva cuenta, cookie, posición, respuesta y recursos al cerrar y volver a iniciar el servidor.
- Servidor de archivos compilados, API y endpoint de salud en el mismo origen.
- Revisión de dependencias de producción: cero vulnerabilidades reportadas al ejecutar `npm audit --omit=dev`.

## Verificación manual en navegador

Cuenta ficticia creada solo para desarrollo local. Se comprobó:

1. Registro de tres pasos, Premium deshabilitado y cuenta con progreso inicial cero.
2. Quiz rápido: cinco preguntas disponibles, un token consumido; una respuesta y marcador guardados; recarga conservó posición y respuesta.
3. Finalización con una respuesta correcta de cinco: resultado 20 %, historial y promedio 2.0/10 coherentes. Las preguntas sin responder cuentan como errores.
4. Estadísticas semanales y de cuatro semanas, áreas y racha calculadas; la tarjeta completada no cambió el promedio del quiz.
5. Perfil editado y conservado al recargar.
6. Colección marcada → flashcard → revelado → valoración Fácil → resultado guardado.
7. Contraseña incorrecta rechazada; login correcto recuperó el perfil y el avance anterior.
8. Logout confirmado; recarga mantuvo la pantalla de acceso sin sesión.
9. Layout revisado a 390 × 844 y 1440 × 900, sin desbordamiento horizontal en las pantallas comprobadas. Se restableció el tamaño normal del navegador.

## Empaquetado

La imagen Docker se construyó correctamente. Ejecutada con `NODE_ENV=production`, origen HTTPS configurado y PostgreSQL 17: `/api/health` y `/` devolvieron 200; registro devolvió 201 y cookie con prefijo `__Host-`, Secure y HttpOnly. No se publicó un dominio ni se configuró un proxy externo.

Los contenedores y la base desechable usados para verificar PostgreSQL se retiraron al terminar. El servidor local de desarrollo quedó disponible para revisar la aplicación.

## Servicios aún no conectados

SMTP real no se probó con un proveedor: los tests inyectan un buzón de prueba y desarrollo admite correo en carpeta local. No hay pagos, verificación de correo, notificaciones automáticas ni sonidos activos. El banco incluido es de prueba y requiere sustitución por contenido revisado. Las credenciales, el dominio HTTPS y el hosting de producción quedan por configurar.

## Conexión real con Azure · 30 de septiembre de 2026

- Conexión a Azure Database for PostgreSQL verificada con TLS y validación del certificado.
- Migraciones aplicadas a la base `entrenarme`: 11 tablas públicas, incluidas las migraciones.
- Cinco preguntas de prueba cargadas. La base remota comenzó sin cuentas; el historial local no se trasladó.
- Backend local iniciado usando la configuración de Azure: `/api/health` respondió 200 en el puerto 3001 y mediante el proxy de Vite en 5173.
- Frontend respondió 200 y acceso sin sesión a `/api/auth/me` respondió 401.
- `.env` está excluido de Git. No se registraron ni incluyeron contraseñas en esta documentación.
- Esta verificación conecta la base en la nube con el backend local; no constituye un despliegue del servidor web en Azure.

## Preparación de Azure App Service + Render · 30 de septiembre de 2026

- Compilación del frontend correcta y 14 pruebas de API aprobadas.
- Producción permite ejecutar solo la API con `SERVE_FRONTEND=false`, sin requerir `dist`.
- Prueba de sesiones de producción detrás de un proxy: cookies Secure/HttpOnly/SameSite=Lax, persistencia autenticada y rechazo de origen no permitido.
- ZIP de API generado desde una lista explícita de archivos, con 20 entradas; sin `.env`, bases locales, pruebas ni node_modules de macOS.
- API extraída del ZIP verificada localmente contra PostgreSQL de Azure: health 200 y frontend deshabilitado (404 en `/`).
- El reenviado de Render y las URLs públicas aún requieren verificación una vez que los servicios estén desplegados.
