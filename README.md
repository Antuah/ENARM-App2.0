# Entrenarme · aplicación web

Aplicación para practicar el ENARM, con diseño pensado primero para móvil y adaptable a computadora. Ahora incluye backend, cuentas y persistencia real. El flujo y las mascotas del mockup se conservaron; el progreso dejó de depender de datos simulados del navegador.

## Tecnologías

- **React 19 + Vite 6**: interfaz, navegación y compilación de la web.
- **Node.js 24 + Fastify 5**: API HTTP y servidor del frontend compilado.
- **PostgreSQL + `pg`**: base de datos para producción, consultas parametrizadas, migraciones SQL y transacciones.
- **PGlite**: PostgreSQL embebido para desarrollo, sin instalar un servicio de base de datos. Guarda información en `server/data/postgres/`.
- **Zod**: validación de las solicitudes y del banco de preguntas.
- **scrypt de Node.js**: hashes de contraseñas con sal individual. Sesiones opacas en cookies HttpOnly, protección CSRF, validación del origen y límites de solicitudes con plugins de Fastify.
- **Nodemailer**: recuperación de contraseña por SMTP. En desarrollo, sin SMTP, genera correos de prueba en una carpeta local.
- **Docker / Compose**: empaquetado de la aplicación y PostgreSQL. **GitHub Actions**: pruebas y compilación, sin publicación automática en Pages.

## Ejecutar localmente

Necesitas Node.js **24 o posterior** y npm.

```sh
npm install
npm run dev
```

Abre [http://127.0.0.1:5173](http://127.0.0.1:5173). Este comando inicia la web y la API juntas. Puedes crear una cuenta y entrenar: la base local conserva tus datos al reiniciar. No necesitas una cuenta externa ni configurar servicios para probarla.

Opcionalmente copia `.env.example` a `.env` para personalizar los puertos, conectar PostgreSQL o SMTP. Usa la dirección `127.0.0.1`, igual que `APP_ORIGIN`, para que las solicitudes de la web coincidan con el origen permitido.

Para probar el frontend compilado servido por Fastify, define en `.env` `SERVE_FRONTEND=true` y `APP_ORIGIN=http://127.0.0.1:3001`, luego ejecuta:

```sh
npm run build
npm start
```

Abre [http://127.0.0.1:3001](http://127.0.0.1:3001). `npm run preview` sirve únicamente archivos estáticos y no reemplaza al backend.

## Funciones conectadas

- Registro, login, sesión persistente, cierre de sesión y recuperación de contraseña con enlaces de 30 minutos y un solo uso.
- Perfil y preferencias guardados por cuenta.
- Quiz rápido, personalizado por áreas/temas, repaso de errores y tarjetas de preguntas marcadas.
- Respuestas y posición guardadas automáticamente; posibilidad de retomar una actividad pendiente.
- Calificación en el servidor. Las respuestas correctas se entregan al finalizar un quiz o revelar una tarjeta.
- Historial, revisión de resultados, promedio reciente, gráfica por periodo, análisis por área y racha reales.
- ENARMapa con siete misiones, desbloqueo en orden y recompensas de Tokens+ una sola vez.
- Balance de 10 tokens diarios, renovado según la fecha de Ciudad de México. Un token por cada cinco preguntas/tarjetas, redondeando hacia arriba. Las misiones no consumen tokens.
- Importación del banco mediante archivo JSON y comando administrativo local.

Cada cuenta tiene su propio avance. El perfil ficticio que estaba en `localStorage` no se convierte automáticamente en una cuenta real. Los días sin práctica aparecen sin datos en la gráfica.

## Banco, correo y publicación

En desarrollo se incluyen **cinco preguntas de prueba**, conservadas del mockup. La cantidad elegida en un quiz es el máximo solicitado; si hay menos preguntas disponibles, se usan las disponibles y se cobra según la cantidad real. El banco necesita contenido revisado antes de usarse para preparación real. Producción empieza sin esas preguntas, salvo que se habilite explícitamente la carga de ejemplos.

El envío de correo real necesita credenciales SMTP y un remitente configurado. En desarrollo, los enlaces de recuperación se encuentran en `server/data/outbox/*.json`; no se devuelven por la API. Premium y pagos todavía no están habilitados. Las preferencias de sonido y recordatorios se conservan, pero sus servicios aún no se ejecutan.

La aplicación completa necesita hosting que ejecute Node.js y una base PostgreSQL, con HTTPS. **GitHub Pages no ejecuta esta API**. Fastify puede servir web y API juntas, o solo la API con `SERVE_FRONTEND=false`. La base de Azure ya está conectada; publicar los servidores es un paso separado. La guía de [Azure App Service + Render](docs/DEPLOY-AZURE-RENDER.md) prepara esa separación mediante un proxy para conservar las sesiones del navegador.

La configuración de producción, los comandos del banco y las decisiones de seguridad están en [docs/BACKEND.md](docs/BACKEND.md). El contrato HTTP está en [docs/API.md](docs/API.md). Para conectar el servidor ya creado en Azure, sigue [docs/AZURE.md](docs/AZURE.md).

## Verificación

```sh
npm run build
npm test
```

Las pruebas usan una base aislada en memoria y cubren autenticación, acceso entre cuentas, CSRF, calificación, persistencia de actividades, concurrencia, tokens, tarjetas, misiones, recuperación y snapshots del banco. Para ejecutarlas contra PostgreSQL normal, usa `TEST_DATABASE_URL` apuntando **solo a una base desechable**, pues las pruebas escriben cuentas y preguntas de prueba.

Consulta [QA.md](QA.md) para los resultados verificados durante esta implementación.

## Estructura

- `src/App.jsx`, `src/styles.css`: pantallas y diseño responsive.
- `src/api.js`: comunicación con el backend; el token CSRF permanece en memoria.
- `src/catalog.js`: metadatos visuales compartidos, sin respuestas del banco.
- `server/auth.js`, `server/training.js`, `server/state.js`: cuentas, entrenamientos y consultas de progreso.
- `server/migrations/`: esquema versionado de PostgreSQL.
- `server/test/`: pruebas de integración de la API.
- `public/assets/`: cuatro mascotas preparadas a partir de las imágenes adjuntas; los originales no se modificaron.

Referencias del diseño y flujo: [Entrenarme en Netlify](https://entrenarme.netlify.app/) y [prototipo de Figma](https://www.figma.com/proto/jsXAwqhTzrlInapYCFsOLv/Entrenarme_web?node-id=2-2&scaling=scale-down-width&page-id=0%3A1&starting-point-node-id=194%3A289).
