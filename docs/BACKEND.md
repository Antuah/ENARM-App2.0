# Backend de Entrenarme

## Arquitectura

La web consume `/api` en su mismo dominio. En desarrollo Vite pasa esas solicitudes a Fastify en el puerto 3001; en producción Fastify sirve `dist/` y la API. La navegación usa fragmentos `#/ruta`, por lo que una recarga no necesita reglas de reescritura de rutas.

La base tiene usuarios, sesiones de acceso, enlaces de recuperación, preguntas, entrenamientos, snapshots de preguntas, marcadores, misiones, consumo diario y días de estudio. Las migraciones se aplican automáticamente al iniciar y también mediante `npm run db:migrate`. El acceso SQL utiliza parámetros. Los cambios de tokens y progreso se hacen en transacciones y adquieren un bloqueo por usuario; solo puede existir un entrenamiento activo por cuenta.

## Desarrollo con PostgreSQL normal

PGlite es el valor predeterminado cuando `DATABASE_URL` está vacío. Es para un proceso local; para producción o varias instancias usa PostgreSQL. Detén la aplicación antes de abrir esa misma base con el CLI. Un archivo de bloqueo impide abrirla en dos procesos. Si el proceso se cerró abruptamente, verifica que esté detenido antes de eliminar `server/data/.pglite.lock` y volver a iniciar.

Para iniciar PostgreSQL con Compose, copia `.env.example` a `.env` y agrega un `POSTGRES_PASSWORD` elegido para tu entorno. Si contiene caracteres reservados, codifícalos al construir una URL. El ejemplo de Compose interpola esa contraseña en la URL; usa una contraseña hexadecimal generada para ese ejemplo o construye tú `DATABASE_URL`.

```sh
docker compose up -d db
```

Define `DATABASE_URL=postgresql://entrenarme:TU_PASSWORD@127.0.0.1:5433/entrenarme` y reinicia `npm run dev`. Compose limita el puerto a la máquina local. Los datos de PostgreSQL se guardan en el volumen `postgres_data`.

PGlite y PostgreSQL usan el mismo esquema, pero son bases separadas. Cambiar la URL no copia la información local. Para migrar información existente se necesita exportarla/importarla; no hay conversión automática.

## Banco de preguntas

No existe una ruta pública para administrar preguntas. La importación requiere acceso al servidor y su base:

```sh
npm run bank:import -- /ruta/absoluta/banco.json
```

El archivo debe ser un arreglo. Ejemplo estructural, sin contenido clínico:

```json
[
  {
    "id": 1001,
    "area": "Medicina Interna",
    "topic": "Tema revisado",
    "text": "Enunciado revisado de la pregunta",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "answer": 0,
    "explanation": "Explicación revisada y referencias editoriales.",
    "active": true,
    "sample": false
  }
]
```

`answer` es un índice de 0 a 3. `id` es opcional: sin él se crea una pregunta; con él se inserta o actualiza esa identidad. Áreas permitidas: Medicina Interna, Pediatría, Ginecología y Obstetricia, Cirugía. Se valida todo el archivo antes de escribir y la importación es transaccional. Para retirar preguntas usa `active:false`; conserva la identidad para el historial. El CLI acepta hasta 50 000 preguntas por archivo.

Los entrenamientos guardan un snapshot completo de cada pregunta. Una edición posterior del banco no cambia las respuestas ni la calificación de actividades previas. Para cargar las cinco muestras manualmente en una base vacía: `npm run db:seed`. No sobrescribe un banco existente.

## Autenticación

Las contraseñas de 10 a 128 caracteres se convierten a hashes scrypt con sal aleatoria individual (N=32768, r=8, p=1). No se guardan contraseñas en texto ni en el navegador. Las cookies contienen tokens aleatorios; la base almacena su hash SHA-256. La sesión dura un día, o 30 días con «Recordarme». Sin esa opción la cookie también termina al cerrar el navegador, sujeto a su comportamiento de restauración de sesiones.

Producción usa una cookie `__Host-entrenarme`, Secure, HttpOnly y SameSite=Lax, con path `/` y sin Domain. Las mutaciones autenticadas requieren `X-CSRF-Token`; el navegador obtiene el token al iniciar/restaurar sesión y lo mantiene en memoria. Se validan el origen y `Sec-Fetch-Site`. No se habilita CORS: web y API deben compartir origen.

Login/registro/reset tienen límites de intentos; el olvido de contraseña también. Los límites son por IP y **en memoria de cada instancia**. Si se escala a varios servidores, hace falta un almacén compartido para esos límites. `TRUST_PROXY=true` solo debe utilizarse cuando el servidor está detrás de un proxy controlado y no es accesible directamente desde Internet. Las sesiones y los datos sí se comparten mediante PostgreSQL.

Recuperación genera un token de un solo uso, guarda solo su hash, y dura 30 minutos. La respuesta no confirma si el correo existe. La actualización de contraseña revoca todas las sesiones de esa cuenta. Cerrar sesión revoca el token actual. Logs de errores no incluyen el contenido de formularios ni enlaces de recuperación.

## Correo

Configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` y `MAIL_FROM`. Con puerto 587 y `SMTP_SECURE=false` se exige STARTTLS; puerto 465 normalmente usa `SMTP_SECURE=true`. Usa un remitente autorizado por tu proveedor.

Sin SMTP en desarrollo, se escriben correos de prueba en `server/data/outbox/` con permisos restringidos. Abre el enlace del archivo en la web local. Sin SMTP en producción, la recuperación está deshabilitada y la API responde 503. No hay proveedor de correo contratado ni credenciales incluidas.

## Producción

Variables mínimas:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=3001
APP_ORIGIN=https://tu-dominio.example
DATABASE_URL=postgresql://usuario:password@host:5432/base
DATABASE_SSL=true
SEED_SAMPLE_BANK=false
TRUST_PROXY=false
```

Usa `DATABASE_SSL` según tu proveedor: true exige certificado válido; la conexión dentro de la red de Compose utiliza false. Configura SMTP aparte. Ejecuta `npm ci`, `npm run build` y `npm start`. Fastify aplica migraciones al arrancar; la cuenta de base necesita permisos para ello. El endpoint de salud es `GET /api/health` y comprueba conectividad a la base. Configura un proxy HTTPS, el dominio y backups de PostgreSQL antes de operar con usuarios.

Docker: `docker build -t entrenarme-web .`. La imagen compila la web, elimina dependencias de desarrollo y ejecuta Node como usuario no root. No contiene `.env` ni datos locales. Si usas el servicio `app` de Compose, define un `APP_ORIGIN` HTTPS y coloca un proxy HTTPS frente al puerto local 3001:

```sh
docker compose --profile web up -d --build
```

El contenedor usa la base `db` y comienza sin preguntas. Importa un banco revisado con el CLI dentro del contenedor o desde una máquina autorizada que use la misma `DATABASE_URL`.

GitHub Actions ahora verifica la aplicación; se retiró la publicación automática en Pages porque no ejecuta el backend. No se eligió ni publicó un proveedor de hosting.

## Reglas de entrenamiento

- Solicitudes: 1–100 preguntas; sin suficientes coincidencias se utiliza la cantidad disponible. No se duplican reactivos dentro de una actividad.
- Repaso e inteligente: preguntas con errores o sin responder en su último quiz calificado. Una respuesta correcta posterior las retira de la cola. Inteligente usa tarjetas y no cambia el promedio.
- Flashcards: preguntas marcadas activas. Se revela la respuesta antes de autoevaluar; todas las tarjetas deben tener valoración para finalizar.
- Un quiz puede terminar con al menos una respuesta; el resto cuenta como errores. Una misión requiere todas las respuestas. Una actividad abandonada no cuenta para historial calificado ni estadísticas.
- Tokens: 10 diarios según `America/Mexico_City`, primero se gastan diarios y luego bonus. Se cobra al crear la actividad según tamaño real, incluso si se abandona. Misiones gratis. Bonus máximo 30.
- Misiones: siete pasos en orden; recompensa una sola vez por paso, +1 en días 1–6 y +6 en día 7. Se pueden repetir sin acumular recompensa.
- Promedio actual: últimas 280 preguntas calificadas. General y áreas: todos los quizzes finalizados. No incluyen tarjetas. La racha incluye quizzes o tarjetas completados y tolera el día actual aún pendiente si se practicó ayer.
- Historial de la interfaz: últimas 100 actividades; resultados anteriores siguen disponibles por su ID para el propietario. El banco activo determina el denominador de cobertura.

## Alcance pendiente

La base web funcional no incluye cobros, administración editorial visual, verificación de correo, notificaciones automáticas ni sonidos. Premium no se puede activar desde registro o edición de perfil. Se requiere un banco clínico revisado y la configuración de servicios de despliegue/correo. No se realizó un despliegue externo.
