# Guía para publicar IRS en producción

Última revisión: 23 de julio de 2026.

Esta guía reúne los pasos para publicar el frontend Angular, la API ASP.NET Core, PostgreSQL, las sesiones JWT y la bitácora de auditoría.

## Estado actual

- Las tablas `public.sesion_usuario` y `public.auditoria_evento` ya fueron creadas en la base de datos usada actualmente.
- Si producción utiliza otra base de datos o un contenedor PostgreSQL nuevo, los scripts se deben ejecutar también allí. Una base nueva no recibe automáticamente las tablas ni los datos de la base local.
- El JWT funciona localmente con la configuración de desarrollo.
- El proyecto todavía necesita algunos cambios de configuración antes de poder publicarse. Están enumerados en la siguiente sección.

## Bloqueadores que deben resolverse antes de publicar

No desplegar el proyecto públicamente hasta completar estos puntos:

1. **Eliminar las URLs de localhost del frontend.** Los servicios Angular actualmente utilizan `https://localhost:5001`. En producción, `localhost` sería la computadora de cada visitante.
2. **Centralizar la URL de la API.** La opción recomendada es que Angular use rutas relativas como `/api` y que Nginx o Traefik envíe esas solicitudes al contenedor de la API.
3. **Configurar CORS para el dominio real.** `Program.cs` actualmente contiene únicamente orígenes locales. Si se usan dominios separados, debe permitirse solamente el dominio exacto del frontend.
4. **Sacar la conexión PostgreSQL de `appsettings.json`.** Configurarla mediante `ConnectionStrings__DefaultConnection` y no guardar la contraseña de producción en Git.
5. **Sacar la llave JWT de `appsettings.json`.** Configurarla mediante `Jwt__Key`.
6. **Configurar encabezados reenviados.** Si Nginx, Traefik, Cloudflare o un balanceador termina HTTPS, ASP.NET Core debe procesar de forma segura `X-Forwarded-For` y `X-Forwarded-Proto` para reconocer la IP y el esquema originales.
7. **Proteger los endpoints detallados de salud.** No publicar respuestas con cadenas de conexión, excepciones o `stackTrace`.
8. **Crear los archivos de despliegue.** El repositorio todavía no contiene `Dockerfile`, `compose.yaml` ni configuración de Nginx/Traefik de producción.
9. **Probar una compilación de producción completa** de Angular y .NET antes de subir la versión.

## Arquitectura recomendada

La alternativa más sencilla y segura para este proyecto es usar un solo dominio:

```text
Internet
   |
   | HTTPS 443
   v
Nginx o Traefik
   |-- /              -> Angular estático
   |-- /api/*         -> API ASP.NET Core:8080
   |-- /hubs/*        -> SignalR ASP.NET Core:8080
   |
   +-------------------> PostgreSQL:5432 (red privada, nunca público)
```

Ejemplo público:

```text
https://irs.midominio.com/          Angular
https://irs.midominio.com/api/...   API mediante proxy
https://irs.midominio.com/hubs/...  SignalR mediante proxy
```

Ventajas:

- Angular puede utilizar `/api` sin tener una dirección distinta por ambiente.
- Se simplifica CORS.
- La cookie JWT permanece en el mismo origen.
- Solo los puertos 80 y 443 quedan expuestos públicamente.
- PostgreSQL y el puerto interno de la API no se publican.

También es posible separar `app.midominio.com` y `api.midominio.com`, pero requiere configurar la URL del API durante la compilación de Angular, CORS exacto, cookies y SignalR para ambos dominios.

## Matriz de opciones

| Opción | Angular | ASP.NET Core | PostgreSQL | Recomendación |
|---|---|---|---|---|
| VPS con Docker y dominio | Nginx/Traefik | Contenedor .NET 8 | Contenedor con volumen o servicio administrado | **Recomendada** |
| Hostinger VPS con Docker | Nginx/Traefik | Contenedor .NET 8 | Contenedor o base externa | **Recomendada dentro de Hostinger** |
| VPS sin Docker | Nginx | Servicio `systemd` | Instalado en VPS o externo | Viable, requiere más mantenimiento manual |
| Hosting web compartido de Hostinger | Archivos estáticos | No ejecutar aquí | Externo | Solo sirve si la API vive en otro VPS/servicio |
| Windows Server con IIS | IIS | ASP.NET Core Hosting Bundle | Externo o instalado | Viable si ya se administra Windows Server |
| Plataforma administrada | Hosting estático/CDN | Servicio o contenedor administrado | PostgreSQL administrado | Viable, normalmente más costosa |

---

# Opción A: VPS con Docker y dominio propio

Esta ruta funciona con Hostinger, DigitalOcean, Hetzner, AWS, Azure, Google Cloud u otro proveedor que entregue un VPS Linux con IP pública.

## A.1. Preparar el proyecto

Antes de contratar o configurar el servidor:

1. Cambiar el frontend para consumir `/api` y `/hubs` mediante rutas relativas, o implementar correctamente `environment.prod.ts` con la URL pública.
2. Agregar la sustitución de ambientes de Angular en `angular.json` si se eligen URLs distintas por ambiente.
3. Configurar los orígenes CORS desde una variable de entorno del backend.
4. Agregar `UseForwardedHeaders` al backend y confiar únicamente en el proxy interno conocido.
5. Ocultar la información detallada de los endpoints de salud en producción.
6. Crear un `Dockerfile` multi-stage para Angular:
   - Etapa Node para ejecutar `npm ci` y `npm run build`.
   - Etapa Nginx para servir `dist/irs-web/browser`.
   - Regla `try_files $uri $uri/ /index.html` para que funcionen las rutas Angular al recargar.
7. Crear un `Dockerfile` multi-stage para la API:
   - SDK de .NET 8 para publicar.
   - Runtime ASP.NET 8 para ejecutar.
   - Escuchar internamente en `http://+:8080`.
8. Crear `compose.yaml` con los servicios de frontend/proxy, API y PostgreSQL, o apuntar la API a una base administrada.
9. Crear `.dockerignore` para excluir `.git`, `node_modules`, `dist`, `bin`, `obj` y secretos.

Angular requiere que el servidor redirija las rutas inexistentes a `index.html`; de lo contrario, recargar `/auditoria`, `/perfil` u otra ruta devolverá 404.

## A.2. Preparar los secretos

Generar una llave JWT de 64 bytes:

```bash
openssl rand -base64 64
```

En PowerShell:

```powershell
[Convert]::ToBase64String(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(64)
)
```

Crear en el servidor un `.env` que no esté dentro de Git y limitar sus permisos:

```text
ASPNETCORE_ENVIRONMENT=Production
IRS_JWT_KEY=PEGAR_LLAVE_JWT
IRS_DB_PASSWORD=PEGAR_PASSWORD_POSTGRESQL
IRS_DOMAIN=irs.midominio.com
```

```bash
chmod 600 .env
```

El contenedor de la API debe recibir, como mínimo:

```text
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
Jwt__Key=${IRS_JWT_KEY}
Jwt__Issuer=IRS.API
Jwt__Audience=IRS.Web
Jwt__HorasExpiracion=8
ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=irs;Username=postgres;Password=${IRS_DB_PASSWORD}
```

No imprimir estas variables en los logs. Docker Compose también ofrece secretos montados como archivos, pero el backend debe adaptarse para leerlos antes de utilizar esa modalidad.

## A.3. Base de datos

Si PostgreSQL vive en Docker:

- Crear un volumen persistente para `/var/lib/postgresql/data`.
- No publicar `5432` hacia Internet.
- Definir una contraseña distinta a la de desarrollo.
- Respaldar la base local e importarla si contiene información que debe pasar a producción.
- Verificar que las tablas `sesion_usuario` y `auditoria_evento` existan después de restaurar.

Si producción utiliza una base PostgreSQL administrada:

- Permitir conexiones únicamente desde la IP o red del backend.
- Exigir TLS si el proveedor lo soporta.
- Configurar `ConnectionStrings__DefaultConnection` con el host real.

Ejemplo de respaldo:

```bash
pg_dump -Fc -h HOST_ORIGEN -U postgres -d irs -f irs.backup
```

Ejemplo de restauración:

```bash
pg_restore -h HOST_PRODUCCION -U postgres -d irs --clean --if-exists irs.backup
```

Probar primero la restauración sobre una base vacía de prueba.

## A.4. Dominio y DNS

1. Obtener la IP pública del VPS.
2. Crear un registro `A` para `@` apuntando a la IP del VPS.
3. Crear un registro `A` para `www` o para el subdominio elegido, por ejemplo `irs`.
4. Eliminar registros anteriores que entren en conflicto.
5. Esperar la propagación DNS, que puede tardar hasta 24 horas.

Ejemplo para un subdominio:

```text
Tipo: A
Nombre: irs
Destino: IP_PUBLICA_DEL_VPS
```

## A.5. Firewall

Permitir solamente:

- `22/tcp` para SSH, preferentemente restringido a IPs administrativas.
- `80/tcp` para validación y redirección HTTP.
- `443/tcp` para HTTPS.

No publicar directamente:

- PostgreSQL `5432`.
- API `5000`, `5001` o `8080`.
- Puertos internos de Docker.

## A.6. HTTPS y proxy inverso

Elegir una opción:

- Traefik con Let's Encrypt.
- Nginx Proxy Manager.
- Nginx y Certbot.
- Caddy con certificados automáticos.

El proxy debe:

- Redirigir HTTP a HTTPS.
- Servir Angular.
- Enviar `/api` y `/hubs` a la API.
- Soportar WebSocket para SignalR.
- Enviar `Host`, `X-Forwarded-For` y `X-Forwarded-Proto`.
- Renovar automáticamente el certificado.

## A.7. Publicar

En el VPS:

```bash
git clone URL_DEL_REPOSITORIO irs-web
cd irs-web
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=200 api
```

Para actualizar:

```bash
git pull
docker compose build
docker compose up -d
docker compose ps
```

Nunca ejecutar `docker compose down -v` en producción salvo que se pretenda borrar los volúmenes y se tenga un respaldo verificado.

---

# Opción B: Hostinger VPS con Docker

Hostinger ofrece una plantilla VPS basada en Ubuntu 24.04 con Docker Engine y Docker Compose instalados. También dispone de Docker Manager para desplegar Compose manualmente o desde una URL.

## B.1. Contratar y preparar el VPS

1. Contratar un plan **VPS**, no solamente hosting web compartido.
2. En hPanel abrir `VPS` y seleccionar el servidor.
3. Instalar la plantilla de Ubuntu 24.04 con Docker.
4. Configurar una llave SSH y evitar trabajar permanentemente como `root`.
5. Comprobar:

```bash
docker --version
docker compose version
```

## B.2. Subir el proyecto

Elegir una modalidad:

- Conectar por SSH, clonar el repositorio y ejecutar `docker compose up -d`.
- En hPanel abrir `Docker Manager → Compose` y pegar el Compose manualmente.
- Usar `Compose from URL` si el archivo está disponible en un repositorio accesible.

No colocar secretos dentro de una URL pública de Compose. Configurarlos directamente en el servidor.

## B.3. Apuntar el dominio

En hPanel:

1. Abrir `Domains → Domain portfolio → Manage → DNS / Nameservers`.
2. Crear un registro `A` para `@` hacia la IP del VPS.
3. Crear un registro `A` para `www` o `irs` hacia la misma IP.
4. Esperar la propagación.

Si el dominio fue comprado con otro proveedor, crear los registros A en el panel de ese proveedor; no es obligatorio transferirlo a Hostinger.

## B.4. Certificado SSL

Opciones disponibles en un VPS Hostinger:

- Instalar Traefik desde el catálogo Docker de Hostinger para solicitar y renovar certificados Let's Encrypt.
- Utilizar Certbot con Nginx.
- Utilizar un panel VPS compatible que gestione certificados.

El dominio debe apuntar al VPS antes de solicitar el certificado. Los certificados no se emiten directamente para una dirección IP.

## B.5. Firewall de Hostinger

En `VPS → Security → Firewall` crear reglas para:

- SSH 22 desde IP administrativa.
- HTTP 80 desde cualquier origen.
- HTTPS 443 desde cualquier origen.

Bloquear el resto, especialmente PostgreSQL y los puertos internos de la API.

## B.6. Operación diaria

Desde Docker Manager o SSH se puede:

- Consultar logs.
- Reiniciar contenedores.
- Actualizar el proyecto Compose.
- Supervisar consumo de CPU, memoria y disco.
- Confirmar que todos los servicios tengan política de reinicio.

La ruta B utiliza los mismos requisitos de código, secretos, base de datos, proxy y respaldos descritos en la opción A.

---

# Opción C: Hostinger VPS sin Docker

Esta alternativa instala los componentes directamente en Ubuntu.

## C.1. Instalar dependencias

En el VPS:

- Instalar el runtime de ASP.NET Core 8.
- Instalar Nginx.
- Instalar PostgreSQL o contratar una base externa.
- Instalar Certbot.

No es obligatorio instalar Node.js en producción si Angular se compila localmente o mediante CI/CD.

## C.2. Compilar antes de subir

Frontend:

```powershell
npm ci
npm run build
```

Subir el contenido de `dist/irs-web/browser` al directorio estático del servidor, por ejemplo:

```text
/var/www/irs-web
```

Backend:

```powershell
cd backend
dotnet publish IRS.API.csproj -c Release -o publish
```

Subir `backend/publish` a:

```text
/opt/irs-api
```

## C.3. Crear un servicio systemd

Crear un archivo de variables protegido, por ejemplo `/etc/irs-api.env`:

```text
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://127.0.0.1:8080
Jwt__Key=PEGAR_LLAVE_JWT
ConnectionStrings__DefaultConnection=PEGAR_CONEXION_POSTGRESQL
```

Aplicar permisos:

```bash
sudo chmod 600 /etc/irs-api.env
```

Crear `/etc/systemd/system/irs-api.service`:

```ini
[Unit]
Description=IRS API
After=network.target

[Service]
WorkingDirectory=/opt/irs-api
ExecStart=/usr/bin/dotnet /opt/irs-api/IRS.API.dll
EnvironmentFile=/etc/irs-api.env
Restart=always
RestartSec=5
User=www-data

[Install]
WantedBy=multi-user.target
```

Activar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now irs-api
sudo systemctl status irs-api
```

## C.4. Configurar Nginx

Nginx debe servir `/var/www/irs-web`, usar fallback a `index.html`, enviar `/api` y `/hubs` a `http://127.0.0.1:8080`, y reenviar los encabezados del proxy.

Después:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx
sudo certbot renew --dry-run
```

Hostinger documenta ASP.NET Core sobre VPS Linux; el despliegue directo requiere mantener manualmente runtime, Nginx, servicio, firewall y actualizaciones.

---

# Opción D: Hosting web compartido de Hostinger más API externa

El hosting web compartido puede servir los archivos estáticos de Angular, pero no es la opción adecuada para ejecutar esta API ASP.NET Core completa. La documentación oficial de Hostinger dirige las aplicaciones ASP.NET Core hacia sus planes VPS.

Esta opción divide el sistema:

```text
app.midominio.com -> Angular en hosting web Hostinger
api.midominio.com -> ASP.NET Core en VPS o plataforma externa
PostgreSQL        -> Servicio administrado o VPS privado
```

## D.1. Publicar Angular

1. Configurar `environment.prod.ts` con `https://api.midominio.com`.
2. Ejecutar `npm ci` y `npm run build`.
3. Subir el contenido de `dist/irs-web/browser` a `public_html`.
4. Configurar el fallback del router Angular.

Si el hosting usa Apache, normalmente se necesita una regla equivalente a:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## D.2. Publicar la API en otro servicio

La API debe estar en un VPS, contenedor o plataforma que soporte .NET 8. Debe tener:

- Dominio `api.midominio.com`.
- HTTPS válido.
- Sesiones y auditoría en PostgreSQL.
- `Jwt__Key` y conexión de base de datos como secretos.
- CORS limitado a `https://app.midominio.com`.
- Cookies con credenciales habilitadas en el frontend.

Esta modalidad funciona, pero es más compleja que servir frontend y API desde el mismo dominio.

---

# Opción E: Windows Server con IIS

Usar esta opción únicamente si se dispone de un Windows Server administrado.

1. Instalar IIS.
2. Instalar el **ASP.NET Core Hosting Bundle de .NET 8**.
3. Ejecutar `dotnet publish -c Release` para la API.
4. Crear un sitio o aplicación IIS para la API.
5. Configurar `Jwt__Key` y `ConnectionStrings__DefaultConnection` como variables del servidor o del proceso, no dentro del repositorio.
6. Crear un sitio para los archivos compilados de Angular.
7. Instalar URL Rewrite y redirigir rutas Angular a `index.html`.
8. Configurar el certificado HTTPS y bindings del dominio.
9. No publicar PostgreSQL a Internet.
10. Reciclar el Application Pool después de cambiar variables.

---

# Opción F: Plataforma administrada

También se puede separar el sistema en servicios administrados:

- Angular en un hosting estático/CDN.
- API como aplicación o contenedor .NET 8.
- PostgreSQL administrado.
- DNS y TLS administrados por el proveedor.

Los pasos indispensables siguen siendo los mismos:

- Eliminar localhost.
- Configurar URL pública y CORS.
- Configurar `Jwt__Key` y conexión como secretos.
- Crear o restaurar las tablas de producción.
- Mantener HTTPS en frontend y API.
- Confirmar compatibilidad con WebSocket para SignalR.
- Configurar respaldos y retención de auditoría.

Antes de contratar, confirmar que el proveedor permita una API .NET 8 persistente, WebSocket, variables secretas y conexión PostgreSQL.

---

# Configuración JWT de producción

La propiedad `Jwt:Key` es la llave privada con la que la API firma los tokens. No es una contraseña de usuario y nunca se envía al frontend.

Reglas:

- Usar una llave aleatoria exclusiva para producción.
- Configurarla como `Jwt__Key`.
- No guardarla en Git, Dockerfile, imagen Docker ni archivos públicos.
- Mantener el mismo valor entre reinicios y en todas las instancias de la API.
- Guardarla en el administrador de secretos del proveedor o en un archivo protegido.

Los valores no secretos pueden permanecer en `appsettings.json`:

```json
"Jwt": {
  "Issuer": "IRS.API",
  "Audience": "IRS.Web",
  "HorasExpiracion": 8,
  "CookieName": "irs_access_token"
}
```

La variable `Jwt__Key` tiene prioridad sobre `Jwt:Key` por las reglas de configuración de .NET.

## Rotar la llave

Cambiar `Jwt__Key` invalida inmediatamente todos los JWT existentes.

Para rotarla:

1. Programar una ventana de mantenimiento.
2. Cambiar la llave en todas las instancias.
3. Reiniciar todas las instancias.
4. Revocar o limpiar las sesiones activas si corresponde.
5. Pedir a los usuarios que inicien sesión nuevamente.

---

# Respaldos y mantenimiento

Configurar como mínimo:

- Respaldo diario de PostgreSQL.
- Copia externa al VPS.
- Prueba periódica de restauración.
- Monitoreo del espacio en disco.
- Rotación de logs de contenedores, Nginx y API.
- Política de retención o archivado para `auditoria_evento`, porque crecerá continuamente.
- Actualizaciones de seguridad del sistema operativo, Docker, Nginx y .NET.
- Alertas de caída y certificado próximo a expirar.

No considerar un respaldo como válido hasta haber probado su restauración.

---

# Lista final de publicación

## Código

- [ ] Angular ya no contiene `localhost` en servicios de producción.
- [ ] La API usa rutas relativas o `environment.prod.ts` correctamente.
- [ ] CORS contiene únicamente los dominios reales.
- [ ] ASP.NET Core procesa encabezados del proxy de confianza.
- [ ] Los endpoints de salud no exponen secretos ni excepciones.
- [ ] Angular compila en modo producción.
- [ ] .NET publica en modo Release.

## Secretos

- [ ] Generé una llave JWT exclusiva de producción.
- [ ] Configuré `Jwt__Key` fuera del repositorio.
- [ ] Configuré `ConnectionStrings__DefaultConnection` fuera del repositorio.
- [ ] Cambié la contraseña PostgreSQL de desarrollo.
- [ ] Ningún `.env` o secreto está versionado.

## Infraestructura

- [ ] El dominio apunta a la IP o plataforma correcta.
- [ ] HTTPS funciona y se renueva automáticamente.
- [ ] Solo están abiertos los puertos necesarios.
- [ ] PostgreSQL no está expuesto públicamente.
- [ ] El proxy soporta `/api`, `/hubs` y WebSocket.
- [ ] Los contenedores o servicios reinician automáticamente.

## Base de datos

- [x] Las tablas de sesiones y auditoría existen en la base usada actualmente.
- [ ] Confirmé que existen también en la base definitiva de producción.
- [ ] Restauré los datos requeridos.
- [ ] Configuré y probé respaldos.

## Pruebas finales

- [ ] Inicio de sesión válido e inválido.
- [ ] Cierre de sesión y revocación.
- [ ] Cambio de contraseña.
- [ ] Acceso de administrador a `/auditoria`.
- [ ] Bloqueo de `/auditoria` para usuarios normales.
- [ ] Creación y consulta de fichas.
- [ ] Despacho y SignalR.
- [ ] Registro de IP, usuario, resultado y fecha en auditoría.
- [ ] Recarga directa de rutas Angular sin error 404.
- [ ] Prueba desde una red externa y un navegador sin caché.

---

# Fuentes oficiales consultadas

- [Hostinger: ASP.NET Core requiere un plan VPS](https://support.hostinger.com/en/articles/1583610-is-asp-and-asp-net-supported-at-hostinger)
- [Hostinger: plantilla VPS con Docker y Docker Compose](https://www.hostinger.com/support/8306612-how-to-use-the-docker-vps-template-at-hostinger/)
- [Hostinger: desplegar Compose con Docker Manager](https://www.hostinger.com/support/12040815-how-to-deploy-your-first-container-with-hostinger-docker-manager/)
- [Hostinger: apuntar un dominio a un VPS](https://www.hostinger.com/support/1583227-how-to-point-a-domain-to-your-vps-at-hostinger/)
- [Hostinger: instalar SSL en un VPS](https://www.hostinger.com/support/6360129-how-to-install-ssl-on-vps-at-hostinger/)
- [Hostinger: firewall administrado para VPS](https://www.hostinger.com/support/8172641-how-to-use-a-managed-vps-firewall-at-hostinger/)
- [Hostinger: publicar ASP.NET Core en un VPS](https://www.hostinger.com/support/8184984-how-to-launch-an-asp-net-application-at-hostinger/)
- [Angular: despliegue y fallback a index.html](https://angular.dev/tools/cli/deployment)
- [Microsoft: ASP.NET Core detrás de proxy y encabezados reenviados](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer)
- [Docker: administración de secretos con Compose](https://docs.docker.com/compose/how-tos/use-secrets/)
- [Certbot: HTTPS con Nginx](https://certbot.eff.org/instructions?os=ubuntufocal&ws=nginx)
