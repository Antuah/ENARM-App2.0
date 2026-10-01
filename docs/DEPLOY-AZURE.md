# Demo completa en Azure

Frontend React compilado y API Fastify se sirven desde el mismo App Service. PostgreSQL permanece en Azure Database for PostgreSQL. Las llamadas `/api` y las cookies de sesión comparten el dominio de la web.

- App Service: `entrenarme-api`, grupo `entrENARMe`.
- Plan existente: `entrenarme-plan`, Linux Basic B1, Always On y HTTPS activados.
- URL: https://entrenarme-api-haghf3bbfwgda8g9.eastus2-01.azurewebsites.net
- Base: `entrenarme` en `entrenarme-db.postgres.database.azure.com`.

No requiere crear otro plan ni usar Render. Frontend y backend comparten los recursos del plan actual.

## Preparar y publicar actualizaciones

```sh
npm run deploy:prepare:full
```

El comando recompila la web y genera `.deploy/entrenarme-app.zip` con `dist`, servidor, migraciones y manifiestos npm. Excluye `.env`, datos locales, pruebas y node_modules. Azure instala las dependencias Linux con Oryx; no ejecuta otra compilación del frontend.

Sube únicamente ese ZIP a Cloud Shell. Desde la carpeta que lo contiene:

```sh
az webapp deploy --resource-group entrENARMe --name entrenarme-api --src-path entrenarme-app.zip --type zip
```

Mantén las variables privadas PostgreSQL ya configuradas y estos valores:

| Variable                       | Valor                                                                |
| ------------------------------ | -------------------------------------------------------------------- |
| NODE_ENV                       | production                                                           |
| HOST                           | 0.0.0.0                                                              |
| APP_ORIGIN                     | https://entrenarme-api-haghf3bbfwgda8g9.eastus2-01.azurewebsites.net |
| SERVE_FRONTEND                 | true                                                                 |
| DATABASE_SSL                   | true                                                                 |
| SEED_SAMPLE_BANK               | false                                                                |
| TRUST_PROXY                    | true                                                                 |
| SCM_DO_BUILD_DURING_DEPLOYMENT | true                                                                 |

Deja que Azure suministre `PORT`. Comando de inicio: `npm start`. No subas `.env` ni pongas secretos en variables `VITE_*`. Las migraciones pendientes se aplican sin borrar usuarios ni resultados existentes.

## Verificar

Abre la URL principal y comprueba que carguen JavaScript, estilos, fuentes y mascotas. `/api/health` debe devolver `{"status":"ok"}`. Registra una cuenta, inicia un quiz, guarda una respuesta y recarga: se deben conservar sesión y avance. Tras logout debe aparecer el acceso. La navegación usa rutas con `#`, que funcionan al recargar sin reglas de reescritura externas.

La demo contiene cinco preguntas de prueba. La recuperación de contraseña por correo requiere configurar SMTP. No incluye cobros ni suscripciones de pago activas.

La antigua guía [Azure + Render](DEPLOY-AZURE-RENDER.md) queda como alternativa; no es la arquitectura elegida para esta demo.
