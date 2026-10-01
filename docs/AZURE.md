# Conectar la base de Azure

El servidor de Azure Database for PostgreSQL Flexible Server ya debe existir y permitir la IP pública de esta computadora en Redes. El backend sigue ejecutándose localmente mientras su base se mueve a Azure.

## 1. Crear la base

Dentro del recurso PostgreSQL de Azure, abre Bases de datos / Databases y crea una base llamada `entrenarme`. Si esa opción no está disponible en tu vista del portal, puedes crearla desde un cliente PostgreSQL conectado a la base administrativa `postgres`:

```sql
CREATE DATABASE entrenarme;
```

El servidor y la base son cosas distintas: crear el recurso de Azure no crea automáticamente las tablas de esta aplicación.

## 2. Configurar el backend

Copia `.env.example` a `.env` en la raíz del proyecto. El archivo `.env` está excluido de Git. Mantén el resto de campos y configura:

```dotenv
NODE_ENV=development
APP_ORIGIN=http://127.0.0.1:5173
DATABASE_URL=
PGHOST=TU_SERVIDOR.postgres.database.azure.com
PGPORT=5432
PGDATABASE=entrenarme
PGUSER=TU_USUARIO_ADMINISTRADOR
PGPASSWORD="TU_CONTRASEÑA"
DATABASE_SSL=true
SEED_SAMPLE_BANK=false
```

La contraseña se escribe en el archivo local, no en el chat ni en una captura. Conserva las comillas: caracteres como `#` necesitan estar dentro de una cadena entrecomillada. Si contiene comillas dobles, usa comillas simples o un valor representable según el formato `.env` de Node. Estos campos evitan tener que codificar caracteres reservados de una URL.

`DATABASE_URL` tiene prioridad si no está vacío. No combines sus parámetros `sslmode`, `sslcert`, `sslkey` o `sslrootcert` con `DATABASE_SSL=true`; pueden sustituir la configuración TLS de node-postgres. Con los campos separados, `DATABASE_SSL=true` usa cifrado y verifica el certificado del servidor mediante las autoridades de confianza de Node.

## 3. Comprobar y crear las tablas

Desde la carpeta del proyecto:

```sh
npm run db:check
npm run db:migrate
npm run db:check
```

La comprobación informa la base actual, número de tablas públicas y si TLS está activo, sin imprimir contraseñas. La primera conexión puede mostrar cero tablas. Las migraciones crean la estructura y pueden repetirse sin borrar datos. Para Azure, la comprobación debe mostrar PostgreSQL y TLS activo.

## 4. Cargar preguntas

Para probar los flujos con las cinco preguntas que acompañan el proyecto:

```sh
npm run db:seed
```

Este comando solo carga el banco de prueba si no existen preguntas. Para el banco revisado:

```sh
npm run bank:import -- /ruta/absoluta/banco.json
```

Consulta el formato del banco en BACKEND.md. Usa `SEED_SAMPLE_BANK=false` para que el arranque normal no agregue muestras.

## 5. Ejecutar la web

Detén cualquier proceso anterior y ejecuta:

```sh
npm run dev
```

Abre http://127.0.0.1:5173 y crea una cuenta. La web y la API se ejecutan en tu computadora, pero usuarios, sesiones, preguntas y avance se guardan en Azure. Al cambiar de Wi-Fi puede cambiar tu IP pública; actualiza la regla de firewall cuando ocurra.

Estas migraciones crean la estructura; **no copian las cuentas, sesiones ni resultados existentes en la base PGlite local**. La base local se conserva sin cambios. Si necesitas esos datos, realiza una transferencia específica antes de empezar a usar cuentas en Azure, en vez de mezclar dos historiales. Los enlaces de acceso y recuperación de la base local no deben trasladarse a una publicación nueva.

## 6. Publicar también el backend

Para servir frontend y API juntos en el App Service existente, sigue [DEPLOY-AZURE.md](DEPLOY-AZURE.md). `npm run deploy:prepare:full` genera el ZIP completo sin secretos. La guía de Azure + Render queda como alternativa para separar el frontend después.

En el hosting Node/Docker define estos mismos campos de base como variables secretas del servicio. Ajusta `NODE_ENV=production`, `APP_ORIGIN=https://TU_DOMINIO`, `HOST=0.0.0.0` y el puerto que indique el servicio. Configura SMTP aparte. Si el servicio sale por otras IP, permite sus IP de salida en el firewall de PostgreSQL o configura una conexión privada entre servicios. No necesitas abrir la base a todas las IP para desplegar.

## Problemas habituales

- `ENOTFOUND`: verifica el nombre completo del servidor.
- Tiempo de espera: verifica que el servidor esté listo y que el firewall incluya la IP pública actual de quien ejecuta el backend.
- Error de autenticación: revisa usuario y contraseña del administrador del servidor PostgreSQL, no las credenciales de la cuenta de Azure.
- Base inexistente: crea `entrenarme` o corrige `PGDATABASE`.
- Certificado TLS: revisa las autoridades de confianza de Node y la guía de Azure; conserva la verificación de certificado.

Referencias: [TLS en Azure](https://learn.microsoft.com/en-us/azure/postgresql/security/security-tls-how-to-connect), [conexiones SSL de node-postgres](https://node-postgres.com/features/ssl).
