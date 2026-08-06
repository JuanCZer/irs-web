# Seguridad del backend

Esta API aplica una línea base defensiva basada en OWASP ASVS 5.0 y en las
guías de seguridad de ASP.NET Core. Estos controles reducen el riesgo, pero no
reemplazan una revisión de arquitectura, pruebas de penetración ni la seguridad
de la infraestructura donde se despliega.

## Configuración obligatoria

Los secretos ya no se guardan en `appsettings.json`. Para desarrollo local,
configúralos con Secret Manager desde la carpeta `backend`:

```powershell
dotnet user-secrets set "Jwt:Key" "UNA_LLAVE_ALEATORIA_DE_32_BYTES_O_MAS"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5433;Database=irs;Username=USUARIO_LOCAL;Password=CONTRASENA_LOCAL;SSL Mode=Disable"
```

La llave JWT debe generarse con un generador criptográfico; el texto anterior
es solamente un marcador. En producción usa el almacén de secretos del proveedor
o variables protegidas:

```text
Jwt__Key
ConnectionStrings__DefaultConnection
AllowedHosts
Security__AllowedOrigins__0
```

`AllowedHosts` debe contener los hosts exactos y cada origen de producción debe
usar HTTPS. La conexión a PostgreSQL debe validar el certificado del servidor
(`SSL Mode=VerifyFull`) cuando la base de datos no esté en la misma red privada.

La contraseña de base de datos que estuvo versionada debe rotarse si fue usada
fuera de una máquina local. El historial de Git también conserva versiones
anteriores, por lo que eliminar el valor del archivo no equivale a rotarlo.

## Contrato antifalsificación

Las solicitudes `POST`, `PUT`, `PATCH` y `DELETE` bajo `/api` deben incluir:

```http
X-IRS-Request: 1
```

El cliente Angular ya lo agrega de forma centralizada. El control se combina
con una lista CORS de orígenes exactos, cookie `HttpOnly`/`Secure`, `SameSite=Lax`
por defecto y validación de `Origin`. Desarrollo usa `SameSite=None` porque el
frontend HTTP y la API HTTPS tienen esquemas distintos; producción debe usar
`Lax`/`Strict` y un solo sitio siempre que la arquitectura lo permita. Si se
incorpora otro cliente web, debe respetar este contrato. Los clientes no
navegador también deben enviar el encabezado.

## Controles implementados

- autenticación obligatoria por defecto y autorización administrativa explícita;
- JWT firmado con HS256, llave mínima de 256 bits, audiencia, emisor, expiración
  y sesión revocable validados;
- limitación por usuario/IP y una política más estricta para el login;
- protección CSRF y de conexiones SignalR desde orígenes no permitidos;
- hub sin métodos de difusión invocables por clientes;
- encabezados de seguridad, HSTS en producción y caché deshabilitada para API;
- errores genéricos con identificador de seguimiento, sin excepciones ni
  cadenas de conexión en la respuesta;
- límites de cuerpo, encabezados, profundidad JSON, colecciones, frecuencia y
  tamaño/tipo real de las evidencias PNG;
- contraseñas nuevas de 15 a 64 caracteres, reautenticación para cambiarlas,
  BCrypt con factor 12 y actualización gradual de hashes antiguos;
- sanitización y minimización de la bitácora: no se registran valores de query
  ni caracteres de control; la persistencia automática usa una cola limitada
  para que una caída de la base de datos no bloquee las respuestas de la API;
- endpoints detallados de salud restringidos a administradores;
- secretos fuera del repositorio y dependencias de .NET 8 actualizadas a su
  parche de seguridad vigente.

## Pendientes de infraestructura

- configurar correctamente proxies conocidos antes de confiar en
  `X-Forwarded-For`; nunca aceptar encabezados reenviados de cualquier origen;
- usar un limitador distribuido (por ejemplo Redis) si se ejecutan varias
  instancias; el limitador integrado es por proceso;
- proteger el acceso con MFA, especialmente para administradores;
- desplegar PostgreSQL en red privada con una cuenta de privilegios mínimos,
  copias cifradas y rotación de credenciales;
- ejecutar SAST, DAST y pruebas de penetración autenticadas antes de exponer la
  aplicación a Internet, y repetirlas en cada cambio relevante.
