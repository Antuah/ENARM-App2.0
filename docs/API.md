# API HTTP

Prefijo `/api`; JSON. Los errores tienen `{ "error": { "code": "...", "message": "..." } }`; la validación puede añadir `fields`. No hay tokens de acceso en localStorage. Envía cookies de la misma aplicación. Las rutas marcadas privadas requieren sesión; las mutaciones privadas también `X-CSRF-Token`, obtenido de registro/login/me. Origen admitido: `APP_ORIGIN`.

| Método y ruta                                     | Acceso  | Entrada y resultado                                                                                                         |
| ------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| GET `/health`                                     | Público | `{status:"ok"}` si responde la base                                                                                         |
| POST `/auth/register`                             | Público | `name`, `lastname?`, `email`, `password`, `specialty?`, `target?`; crea cuenta Básico, cookie y `{profile,csrfToken}` (201) |
| POST `/auth/login`                                | Público | `email`, `password`, `remember?`; cookie y `{profile,csrfToken}`                                                            |
| GET `/auth/me`                                    | Privado | `{profile,csrfToken}`; nunca devuelve hash de contraseña                                                                    |
| POST `/auth/logout`                               | Privado | Revoca sesión y borra cookie                                                                                                |
| POST `/auth/forgot-password`                      | Público | `email`; confirmación genérica, entrega enlace por correo                                                                   |
| POST `/auth/reset-password`                       | Público | `token`, `password`; cambia contraseña y revoca sesiones                                                                    |
| PATCH `/profile`                                  | Privado | Campos opcionales `name`, `lastname`, `specialty`, `target`, `preferences:{reminders,sound}`; devuelve `{profile}`          |
| GET `/bootstrap`                                  | Privado | Perfil, preferencias, marcadores, preguntas marcadas, progreso, historial, sesión activa, recursos, estadísticas y catálogo |
| GET `/catalog`                                    | Privado | Total, temas y áreas disponibles; indica si contiene muestras                                                               |
| GET `/stats?period=week`                          | Privado | Totales, promedios, áreas, racha y gráfica; `period` admite `week` o `month` (28 días)                                      |
| GET `/plans`                                      | Público | Básico disponible, Premium pendiente, `billingEnabled:false`                                                                |
| POST `/sessions`                                  | Privado | `{mode,count?,areas?,topics?,mission?}`; actividad creada (201)                                                             |
| GET `/sessions/:id`                               | Privado | Solo propietario; datos y preguntas del entrenamiento                                                                       |
| PATCH `/sessions/:id`                             | Privado | `{current?,answers?:{"idPregunta":0}}`; posición base cero y respuestas índices 0–3                                         |
| POST `/sessions/:id/questions/:questionId/reveal` | Privado | Solo tarjetas activas; entrega respuesta y explicación de la tarjeta                                                        |
| POST `/sessions/:id/review`                       | Privado | `{questionId,rating}`; `Difícil`, `Regular` o `Fácil`, después de revelar                                                   |
| POST `/sessions/:id/finish`                       | Privado | Califica/finaliza, registra progreso y devuelve resultado con explicaciones; repetir no duplica efectos                     |
| POST `/sessions/:id/abandon`                      | Privado | Cierra sin calificar; no devuelve tokens                                                                                    |
| PUT `/bookmarks/:questionId`                      | Privado | `{marked:true/false}`; operación idempotente                                                                                |

Modos: `rapido`, `repaso`, `inteligente`, `personalizado`, `flashcards`. `count` entero 1–100, predeterminado 20. `areas` y `topics` filtran el banco. Personalizado requiere al menos un área. `mission` es null o día 0–6; el servidor define el modo y área del día y verifica el desbloqueo, sin confiar en lo enviado por el navegador.

Una actividad incluye `id`, `status`, `mode`, `title`, `mission`, `current`, `requestedCount`, `tokenCost`, `questions`, `answers`, `ratings`, `ratedIds`, `started`, `finished`, `total`, `correct`, `score`, `isCards`, `date`. En quizzes activos `questions` no contiene `answer` ni `explanation`. Los resultados están asociados al propietario por ID y conservan el snapshot del banco al iniciar.

Códigos relevantes: 400 validación; 401 sesión ausente/expirada; 402 tokens insuficientes; 403 origen/CSRF/misión bloqueada; 404 recurso inexistente o de otro usuario; 409 correo duplicado, actividad activa o cambio no permitido; 422 banco vacío/finalización incompleta; 429 límite de solicitudes; 503 correo no disponible en producción. Rutas desconocidas devuelven 404 JSON.
