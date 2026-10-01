# Demo: backend en Azure y frontend estático en Render

> Alternativa histórica. La arquitectura elegida ahora sirve frontend y API juntos en el App Service existente; sigue [DEPLOY-AZURE.md](DEPLOY-AZURE.md) para esa publicación.

Arquitectura: navegador → frontend Render → `/api/*` reenviado a Azure App Service → PostgreSQL de Azure. La web conserva llamadas relativas a `/api` y cookies HttpOnly, Secure, SameSite=Lax. El navegador ve un solo origen, aunque los servidores estén separados. No configures el frontend para llamar directamente al dominio de Azure ni cambies las cookies a SameSite=None.

## 1. Crear Azure App Service

En el portal crea una **Aplicación web**, sin base adicional:

- Grupo: `entrENARMe`.
- Nombre sugerido: `entrenarme-api`; debe estar disponible.
- Publicar: Código. Runtime: Node 24 LTS. Sistema: Linux.
- Región: East US 2, igual que PostgreSQL.
- Plan separado: `entrenarme-plan`, Basic B1, una instancia. Confirma el costo mostrado por tu suscripción antes de crear.
- No crear otra base, Application Insights, Defender de pago ni conexión a un repositorio durante este paso.

Copia el **dominio predeterminado real** de Información general. Los recursos nuevos pueden incluir un sufijo y región; no supongas que es simplemente `entrenarme-api.azurewebsites.net`.

Recurso creado para esta demo el 30 de septiembre de 2026: `entrenarme-api` en `entrenarme-plan` Basic B1, East US 2. Host: `entrenarme-api-haghf3bbfwgda8g9.eastus2-01.azurewebsites.net`. El portal mostró USD 12.41/mes estimados para el plan, adicional a PostgreSQL. El `render.yaml` de la raíz ya contiene este destino.

El backend ya está publicado y su [endpoint de salud](https://entrenarme-api-haghf3bbfwgda8g9.eastus2-01.azurewebsites.net/api/health) respondió correctamente. Registro, login, persistencia de quiz y logout se comprobaron sobre esa API pública. La publicación del frontend en Render sigue pendiente del inicio de sesión del propietario; todavía no se verificó su proxy externo. El origen permitido temporal es el dominio Azure y se cambiará al dominio real de Render al publicarlo.

## 2. Preparar Render

Crea un Static Site desde el repositorio con el código actualizado:

- Build command: `npm ci && npm run build`.
- Publish directory: `dist`.
- Variable pública: `NODE_VERSION=24`.
- En Redirects/Rewrites, primera regla: Source `/api/*`, Destination `https://HOST_REAL_AZURE/api/*`, Action **Rewrite**.
- Segunda regla: Source `/*`, Destination `/index.html`, Action Rewrite.
- Para `/api/*`, encabezado `Cache-Control: no-store`.

No uses Redirect para la API. El proxy debe preservar método, cuerpo, Origin, Cookie y Set-Cookie. No pongas credenciales PostgreSQL ni SMTP en Render. Copia la URL HTTPS real de Render; el nombre elegido no garantiza una URL concreta.

Puedes copiar `deployment/render.yaml.example` a `render.yaml` en la raíz, sustituir el hostname Azure y usar un Blueprint. Es una plantilla, no una configuración desplegable sin completar.

## 3. Configurar el backend en Azure

En App Service → Variables de entorno → Configuración de la aplicación, configura:

| Nombre                         | Valor                                                    |
| ------------------------------ | -------------------------------------------------------- |
| NODE_ENV                       | production                                               |
| HOST                           | 0.0.0.0                                                  |
| APP_ORIGIN                     | URL HTTPS real del frontend Render, sin ruta             |
| SERVE_FRONTEND                 | false                                                    |
| PGHOST                         | entrenarme-db.postgres.database.azure.com                |
| PGPORT                         | 5432                                                     |
| PGDATABASE                     | entrenarme                                               |
| PGUSER                         | enarmadmin                                               |
| PGPASSWORD                     | Contraseña ingresada directamente en Azure, nunca en Git |
| DATABASE_SSL                   | true                                                     |
| SEED_SAMPLE_BANK               | false                                                    |
| TRUST_PROXY                    | true                                                     |
| SCM_DO_BUILD_DURING_DEPLOYMENT | true                                                     |

Elimina `DATABASE_URL` si existe con otro destino. Deja que Azure suministre `PORT`. En Configuración general: comando de inicio `npm start`, **Always On activado**, HTTPS Only activado. Conserva TLS y la verificación del certificado. SMTP se configura aparte para recuperación por correo; sin él, esa función no está disponible en producción.

En PostgreSQL → Redes, permite las **IP de salida posibles** del App Service (Información general → Propiedades), cada dirección como inicio y fin de una regla. No selecciones todas las IP ni todos los servicios de Azure. Actualiza las reglas si cambia el plan. La integración privada es una alternativa posterior; B1 aquí usa salida pública.

## 4. Publicar el paquete

Desde esta carpeta:

```sh
npm run deploy:prepare
```

Genera `.deploy/entrenarme-api.zip` usando una lista explícita de archivos. Incluye servidor, migraciones, catálogo, manifiesto npm y lockfile. Excluye `.env`, base local, pruebas, node_modules y frontend. El manifiesto empaquetado inicia solo la API y no solicita una compilación Vite. Oryx instala las dependencias Linux; no se deben subir los node_modules de macOS.

Con Azure CLI autenticado, o desde Cloud Shell tras subir ese ZIP:

```sh
az webapp deploy --resource-group entrENARMe --name entrenarme-api --src-path .deploy/entrenarme-api.zip --type zip
```

En Cloud Shell ajusta `--src-path` al archivo que hayas subido. Usa el nombre real si elegiste otro. No subas `.env`. La API aplica migraciones pendientes al arrancar sin borrar datos; reutiliza la base y el banco ya cargados.

## 5. Verificación de la publicación

1. `https://HOST_REAL_AZURE/api/health` debe responder `{"status":"ok"}`: comprueba la conexión a PostgreSQL.
2. La misma ruta en Render debe responder JSON, con `Cache-Control: no-store`, sin redirección al dominio Azure.
3. En Render registra una cuenta, recarga, inicia un quiz, guarda respuestas y recarga de nuevo. Deben conservarse sesión y avance.
4. Repite en Safari móvil. Comprueba que la cookie `__Host-entrenarme` se establece en el dominio Render con Secure y HttpOnly.
5. Logout debe eliminar el acceso. Nunca caches rutas de la API, incluso cuando responden 401 o 403.

Las pruebas locales cubren la API detrás de un proxy con el origen permitido y cookies de producción. **El proxy real de Render, el firewall y las URLs publicadas requieren estas comprobaciones después de desplegar.** Si el proxy altera o elimina encabezados de autenticación, corrige el proxy; como alternativa inmediata, sirve frontend y API juntos en Azure con `SERVE_FRONTEND=true` y una publicación que incluya `dist`.

Referencias oficiales: [Node en App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs), [ZIP y Oryx](https://learn.microsoft.com/en-us/azure/app-service/deploy-zip), [configuración Node](https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs), [rewrites de Render](https://render.com/docs/redirects-rewrites), [static sites](https://render.com/docs/static-sites), [headers](https://render.com/docs/static-site-headers).
