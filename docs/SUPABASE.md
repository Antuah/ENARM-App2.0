# Frontend Azure con API ENARM en Supabase

La web React se aloja en el App Service `entrenarme-api`. El navegador consume Supabase Auth y las Edge Functions de `https://oksifebzxhciydqryisi.supabase.co`. El dominio `.supabase.com` indicado inicialmente no resuelve. Azure sirve archivos y un endpoint de salud del frontend; no ejecuta la lógica del backend anterior ni abre conexiones PostgreSQL.

## Configuración pública

`VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` permiten sustituir el destino al compilar. Los valores por defecto corresponden a la guía ENARMAPI entregada. La llave `sb_publishable_` identifica la aplicación y es pública. Nunca utilizar una llave secreta o `service_role` en el frontend.

`SUPABASE_URL` configura el destino permitido en la política CSP del servidor Azure; debe coincidir con `VITE_SUPABASE_URL` si cambia el destino. La publicación actual utiliza el valor por defecto.

## Autenticación

Se utiliza `@supabase/supabase-js` con PKCE y renovación de sesión. Por defecto la sesión se conserva en sessionStorage; «Recordarme» selecciona localStorage para conservarla entre visitas. Son credenciales accesibles a JavaScript, distintas de las cookies HttpOnly del backend anterior. El servidor aplica una CSP que limita scripts al propio origen y conexiones al destino Supabase. No se registran tokens ni contraseñas.

El registro utiliza Supabase Auth. Si el servicio devuelve sesión se completa el perfil y se consulta el estado de la aplicación; si requiere confirmar correo, se muestra el aviso correspondiente. Las respuestas `user_not_provisioned` y `user_inactive` se muestran sin inventar un perfil o habilitar permisos localmente. El responsable del servicio controla esa configuración.

El propietario de Supabase debe permitir estas URLs de retorno:

- `https://entrenarme-api-haghf3bbfwgda8g9.eastus2-01.azurewebsites.net/`
- `https://entrenarme-api-haghf3bbfwgda8g9.eastus2-01.azurewebsites.net/?auth=recovery`

Los enlaces PKCE deben abrirse en el mismo navegador donde se solicitaron. No hay acceso administrativo a Supabase ni al repositorio externo. La integración consume únicamente Auth y las funciones documentadas.

## Correspondencia funcional

- Las preguntas de sesión se identifican mediante `sessionQuestionId`; las marcas usan `globalKey`.
- El servidor decide la pregunta actual y `nextAction`. El frontend confirma una respuesta por solicitud y no permite editar respuestas ya enviadas ni saltar arbitrariamente.
- Repaso Inteligente requiere responder y valorar; Flashcards requiere revelar y valorar. Solo se muestra feedback cuando corresponde.
- Pausa, reanudación y finalización utilizan `quiz-finish` con una acción explícita. Tras una mutación se vuelve a consultar `quiz-state`. Una desconexión no causa un reenvío automático de la mutación.
- Personalizado carga especialidades, temas y etiquetas por áreas, con un máximo de cinco filtros finos combinados. Flashcards admite 10–50 reactivos y el resto 10–100.
- Historial usa paginación del servicio; las marcas devuelven referencias, sin inventar contenido que la API no proporciona.
- ENARMapa usa las misiones, estados, fechas y alternativas devueltas por el servidor. Los descansos requieren consultar el progreso antes de completar.
- Los promedios ponderados se muestran en escala 0–100 y separados del porcentaje de acierto. No se inventan rachas diarias, saldo de tokens ni año objetivo: no existen en el contrato recibido.
- El perfil permite nombre visible y especialidad objetivo. La membresía efectiva procede de la API. La web no procesa pagos.

## Ejecutar y publicar

`npm run dev` inicia solo el frontend Vite. `npm run build` compila y `npm start` sirve la web con `server/web.js`, sin PostgreSQL. `npm run deploy:prepare:full` genera `.deploy/entrenarme-app.zip` sin .env, credenciales, datos ni pruebas.

En Cloud Shell, tras subir el ZIP:

```sh
az webapp deploy --resource-group entrENARMe --name entrenarme-api --src-path entrenarme-app.zip --type zip --output none
```

Conservar Node 24, `HOST=0.0.0.0`, Always On, HTTPS y `SCM_DO_BUILD_DURING_DEPLOYMENT=true`; el inicio sigue siendo `npm start`. `/api/health` indica `service: frontend` y `backend: supabase`: su éxito no garantiza el estado de la API externa.

El backend y la base anteriores permanecen conservados para una eventual migración o reversión. No se transfieren automáticamente usuarios, contraseñas, historial ni avance. No se eliminaron recursos Azure. Para ejecutar el código anterior localmente existen `npm run dev:legacy` y `npm run start:legacy`.

## Verificación

Las pruebas automatizadas usan respuestas de contrato, no son una auditoría del backend externo. Cubren autenticación, serialización, estados de preguntas, recuperación, paginación, métricas y renderizado de componentes. Las pruebas reales con registro, permisos y preguntas deben quedar registradas en QA.md con sus limitaciones.
