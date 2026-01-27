# Sistema de Despacho - Validación de Fichas

## Descripción General

El módulo de Despacho permite a los usuarios con rol específico validar fichas concluidas y aplicar medidas de seguridad correspondientes.

## Estructura de Base de Datos

### Tabla: `cat_medida_seguridad`

Catálogo de medidas de seguridad disponibles.

| Campo         | Tipo         | Descripción                      |
| ------------- | ------------ | -------------------------------- |
| id_cat_medida | SERIAL       | ID único de la medida            |
| medida        | VARCHAR(255) | Nombre de la medida de seguridad |
| estatus       | INTEGER      | Estado (1=Activo, 0=Inactivo)    |

### Tabla: `fichas_despacho`

Registro de fichas validadas con medidas aplicadas.

| Campo             | Tipo      | Descripción                               |
| ----------------- | --------- | ----------------------------------------- |
| id_ficha_despacho | SERIAL    | ID único del registro                     |
| id_ficha          | INTEGER   | FK a ficha_informativa                    |
| id_cat_medida     | INTEGER   | FK a cat_medida_seguridad                 |
| comentario        | TEXT      | Comentarios sobre la medida aplicada      |
| evidencia         | TEXT      | Ruta o referencia a archivos de evidencia |
| fecha_validacion  | TIMESTAMP | Fecha y hora de validación                |
| id_usuario        | INTEGER   | FK a usuarios (quien validó)              |

## Instalación

1. **Ejecutar script SQL:**

   ```bash
   psql -U postgres -d irs_db -f backend/Scripts/01_crear_tablas_despacho.sql
   ```

2. **Compilar backend:**

   ```bash
   cd backend
   dotnet build
   dotnet run
   ```

3. **Iniciar frontend:**
   ```bash
   cd ..
   npm start
   ```

## API Endpoints

### 1. Obtener Medidas de Seguridad

```http
GET /api/catalogos/medidas-seguridad
```

**Response:**

```json
[
  {
    "idCatMedida": 1,
    "medida": "Monitoreo Policial: Despliegue de Dron",
    "estatus": 1
  }
]
```

### 2. Validar Ficha con Medidas

```http
POST /api/despacho/validar
```

**Request Body:**

```json
{
  "idFicha": 123,
  "idsMedidasSeguridad": [1, 2, 5],
  "comentario": "Medidas aplicadas según protocolo de seguridad",
  "evidencia": "ruta/imagen.jpg",
  "idUsuario": 10
}
```

**Response:**

```json
[
  {
    "idFichaDespacho": 1,
    "idFicha": 123,
    "idCatMedida": 1,
    "medidaSeguridad": "Monitoreo Policial: Despliegue de Dron",
    "comentario": "Medidas aplicadas según protocolo de seguridad",
    "evidencia": "ruta/imagen.jpg",
    "fechaValidacion": "2025-11-24T10:30:00Z",
    "idUsuario": 10,
    "nombreUsuario": "Juan Pérez"
  }
]
```

### 3. Obtener Fichas Validadas por Ficha

```http
GET /api/despacho/ficha/{idFicha}
```

**Response:**

```json
[
  {
    "idFichaDespacho": 1,
    "idFicha": 123,
    "idCatMedida": 1,
    "medidaSeguridad": "Patrullaje de Zona",
    "comentario": "Patrullaje iniciado",
    "fechaValidacion": "2025-11-24T10:30:00Z"
  }
]
```

## Funcionalidades Frontend

### Componente: `DespachoComponent`

**Características:**

- ✅ Listado de fichas concluidas
- ✅ Botón "Ver" para visualizar detalles completos de la ficha
- ✅ Botón "Medidas" para aplicar medidas de seguridad
- ✅ Botón "Validar" para confirmar validación con medidas
- ✅ Modal de selección de medidas con checkboxes
- ✅ Modal de visualización de detalles de ficha
- ✅ Paginación estándar
- ✅ Carga dinámica de medidas desde catálogo

**Servicios Utilizados:**

- `FichasService` - Obtener fichas concluidas
- `DespachoService` - Validar fichas con medidas
- `CatalogosService` - Obtener catálogo de medidas
- `AuthService` - Obtener usuario actual para registro

## Flujo de Uso

1. **Acceso al módulo:** Usuario con rol 6 accede a `/despacho`

2. **Visualización de fichas:** Se cargan automáticamente fichas con estado "Concluido"

3. **Ver detalles:**

   - Click en icono 👁️ junto al folio
   - Se abre modal con información completa de la ficha

4. **Aplicar medidas:**

   - Click en botón "Medidas" o "Validar"
   - Seleccionar una o más medidas de seguridad
   - Agregar comentario (opcional)
   - Click en "Aplicar Medidas"

5. **Confirmación:** Sistema registra la validación con:
   - Medidas seleccionadas
   - Comentario
   - Usuario que validó
   - Fecha/hora de validación

## Notas Técnicas

- Cada medida seleccionada genera un registro independiente en `fichas_despacho`
- Permite múltiples validaciones de la misma ficha
- El campo `evidencia` está preparado para almacenar rutas de archivos (futuro)
- Las medidas se obtienen del catálogo, permitiendo agregar nuevas sin cambiar código

## Próximas Mejoras

- [ ] Upload de imágenes/documentos como evidencia
- [ ] Historial de validaciones por ficha
- [ ] Exportar reporte de medidas aplicadas
- [ ] Notificaciones cuando se aplican medidas
- [ ] Dashboard de estadísticas de medidas más usadas
