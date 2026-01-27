# IRS API - Backend .NET 8

API REST para el sistema de Información de Reportes y Seguimiento (IRS).

## 🚀 Tecnologías

- .NET 8
- Entity Framework Core 8
- SQL Server
- Swagger/OpenAPI

## 📋 Prerrequisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (LocalDB, Express o completo)
- Visual Studio 2022 o Visual Studio Code

## 🔧 Configuración

### 1. Restaurar paquetes

```bash
cd backend
dotnet restore
```

### 2. Configurar la cadena de conexión

Edita `appsettings.json` con tu configuración de SQL Server:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=IRSDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### 3. Crear la base de datos

```bash
# Crear la migración inicial
dotnet ef migrations add InitialCreate

# Aplicar la migración (crear base de datos)
dotnet ef database update
```

### 4. Ejecutar la aplicación

```bash
dotnet run
```

La API estará disponible en:

- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

## 📚 Endpoints Disponibles

### Fichas Informativas

- `GET /api/fichas` - Obtener todas las fichas
- `GET /api/fichas/{id}` - Obtener ficha por ID
- `POST /api/fichas` - Crear nueva ficha
- `PUT /api/fichas/{id}` - Actualizar ficha
- `DELETE /api/fichas/{id}` - Eliminar ficha
- `GET /api/fichas/buscar?criterio={texto}` - Buscar fichas

### Borradores

- `GET /api/borradores` - Obtener todos los borradores
- `GET /api/borradores/{borradorId}` - Obtener borrador por ID
- `POST /api/borradores` - Crear nuevo borrador
- `PUT /api/borradores/{borradorId}` - Actualizar borrador
- `DELETE /api/borradores/{borradorId}` - Eliminar borrador

### Catálogos

- `GET /api/catalogos/delegaciones` - Obtener delegaciones
- `GET /api/catalogos/informantes` - Obtener informantes
- `GET /api/catalogos/sectores` - Obtener sectores
- `GET /api/catalogos/prioridades` - Obtener prioridades
- `GET /api/catalogos/tipos-evento` - Obtener tipos de evento

### Estadísticas

- `GET /api/estadisticas` - Obtener estadísticas generales

## 📦 Estructura del Proyecto

```
backend/
├── Controllers/          # Controladores API
│   ├── FichasController.cs
│   ├── BorradoresController.cs
│   ├── CatalogosController.cs
│   └── EstadisticasController.cs
├── Services/            # Lógica de negocio
│   ├── FichaService.cs
│   ├── BorradorService.cs
│   ├── CatalogoService.cs
│   └── EstadisticaService.cs
├── Models/              # Modelos de datos
│   ├── FichaInformativa.cs
│   ├── Borrador.cs
│   └── Catalogos.cs
├── DTOs/                # Data Transfer Objects
│   ├── FichaDto.cs
│   ├── BorradorDto.cs
│   └── EstadisticaDto.cs
├── Data/                # DbContext
│   └── IRSDbContext.cs
├── Program.cs           # Configuración principal
└── appsettings.json     # Configuración
```

## 🔒 CORS

La API está configurada para aceptar peticiones desde:

- `http://localhost:4200` (Angular desarrollo)

Para producción, actualiza la política CORS en `Program.cs`.

## 🗄️ Migraciones de Base de Datos

### Crear nueva migración

```bash
dotnet ef migrations add NombreMigracion
```

### Aplicar migraciones

```bash
dotnet ef database update
```

### Revertir migración

```bash
dotnet ef database update MigracionAnterior
```

### Eliminar última migración

```bash
dotnet ef migrations remove
```

## 🧪 Probar la API

### Con Swagger

1. Ejecuta `dotnet run`
2. Abre `https://localhost:5001/swagger`
3. Prueba los endpoints directamente desde la interfaz

### Con curl

```bash
# Obtener todas las fichas
curl -X GET https://localhost:5001/api/fichas

# Crear una ficha
curl -X POST https://localhost:5001/api/fichas \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Hidalgo",
    "lugar": "Plaza Principal",
    "sector": "Sector 1",
    "fechaSuceso": "2025-11-13T00:00:00",
    "prioridad": "Media",
    "condicionEvento": "En proceso"
  }'
```

## 📝 Datos de Ejemplo

La base de datos se inicializa con datos de ejemplo:

- **Sectores**: 4 sectores (Sector 1-4)
- **Prioridades**: Baja, Media, Alta, Crítica
- **Informantes**: 3 informantes de ejemplo

## 🔍 Comandos Útiles

```bash
# Compilar el proyecto
dotnet build

# Limpiar artefactos de compilación
dotnet clean

# Ver información del proyecto
dotnet list package

# Ejecutar en modo watch (auto-reload)
dotnet watch run
```

## 🐛 Troubleshooting

### Error de conexión a SQL Server

Si obtienes error de conexión, verifica:

1. SQL Server está ejecutándose
2. La cadena de conexión es correcta
3. TrustServerCertificate=True está en la cadena de conexión

### Error de migración

```bash
# Eliminar la base de datos y recrear
dotnet ef database drop
dotnet ef database update
```

## 📄 Licencia

Este proyecto es parte del sistema IRS Web.
