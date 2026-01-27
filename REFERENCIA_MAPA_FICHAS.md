# Referencia Rápida - Mapa de Fichas

## Componente: `MapaFichasComponent`

### Ubicación

`src/app/pages/mapa-fichas/`

### Ruta

```
/mapa-fichas
```

### Imports

```typescript
import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import mapboxgl from "mapbox-gl";
```

## Propiedades Públicas

| Propiedad            | Tipo                 | Descripción                      |
| -------------------- | -------------------- | -------------------------------- |
| `todasLasFichas`     | `FichaInformativa[]` | Todas las fichas cargadas        |
| `fichasFiltradasMes` | `FichaInformativa[]` | Fichas del mes actual            |
| `fichasVisible`      | `FichaInformativa[]` | Fichas después de filtros        |
| `filtroEstado`       | `string`             | Filtro de estado seleccionado    |
| `filtroSector`       | `string`             | Filtro de sector seleccionado    |
| `filtroPrioridad`    | `string`             | Filtro de prioridad seleccionado |
| `filtroCondicion`    | `string`             | Filtro de condición seleccionado |

## Métodos Públicos

### `aplicarFiltros(): void`

Aplica todos los filtros activos y actualiza el mapa.

```typescript
this.aplicarFiltros();
```

### `limpiarFiltros(): void`

Resetea todos los filtros a sus valores por defecto.

```typescript
this.limpiarFiltros();
```

### `seleccionarFicha(ficha: FichaInformativa): void`

Centra el mapa en una ficha específica y abre su popup.

```typescript
this.seleccionarFicha(misFichas[0]);
```

## Interface FichaInformativa

```typescript
interface FichaInformativa {
  id?: number;
  estado: string; // (obligatorio) Estado de México
  lugar: string; // (obligatorio) Ubicación del evento
  latitud: number | null; // Coordenada geográfica
  longitud: number | null; // Coordenada geográfica
  direccion?: string; // Dirección completa
  sector: string; // (obligatorio) Sector del evento
  subsector?: string; // Subsector opcional
  horaInicioSuceso?: string; // Hora inicio (HH:MM)
  horaFinSuceso?: string; // Hora fin (HH:MM)
  fechaSuceso: string; // (obligatorio) Fecha (YYYY-MM-DD)
  numeroAsistentes?: number | null; // Cantidad de asistentes
  prioridad: string; // (obligatorio) Baja/Media/Alta/Crítica
  condicionEvento?: string; // Finalizado/En proceso/Pendiente/Cancelado
  informacion?: string; // Tipo de información
  asunto: string; // (obligatorio) Título/asunto
  hechos?: string; // Descripción de hechos
  acuerdos?: string; // Acuerdos alcanzados
  informo?: string; // Quién informó
  fechaRecepcion?: string; // Fecha de recepción
  horaRecepcion?: string; // Hora de recepción
}
```

## Colores de Prioridad en Mapa

| Prioridad | Color        | Hex       |
| --------- | ------------ | --------- |
| Crítica   | Rojo         | `#ff0000` |
| Alta      | Naranja      | `#ff9900` |
| Media     | Amarillo     | `#ffcc00` |
| Baja      | Verde        | `#00cc00` |
| Default   | Azul Púrpura | `#667eea` |

## Datos de Prueba

Si no hay fichas en localStorage, el componente genera 10 fichas automáticamente:

- Ubicaciones aleatorias en México
- Prioridades variadas
- Sectores variados
- Fechas del mes actual

## LocalStorage

### Clave para guardar fichas

```typescript
localStorage.getItem("fichas_informativas");
localStorage.setItem("fichas_informativas", JSON.stringify(fichas));
```

## MapBox Token

```typescript
private readonly MAPBOX_TOKEN =
  'pk.eyJ1IjoianVhbmN6ZXJvbmciLCJhIjoiY21lbTRuY3pwMHAzdjJub294eWM3ZDNxeiJ9.GR7kio2VVQvxV55zolMCKQ';
```

⚠️ **Nota**: Usar variables de entorno en producción

## Eventos del Mapa

### Click en Marcador

Abre popup con información de la ficha:

```
- Asunto
- Lugar - Estado
- Prioridad
- Fecha
```

### Click en Tarjeta de Ficha

Centra mapa en coordenadas y abre popup

## Estilos CSS/LESS

### Clases principales

- `.mapa-fichas-container` - Contenedor principal
- `.mapa-section` - Sección del mapa (2/3)
- `.fichas-section` - Sección de fichas (1/3)
- `.ficha-card` - Tarjeta individual de ficha
- `.filtro-select` - Dropdown de filtro

### Variables de colores (en código)

```less
// Encabezado
@gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Prioridades
@prioridad-critica: #c41e3a;
@prioridad-alta: #d97706;
@prioridad-media: #ca8a04;
@prioridad-baja: #15803d;
```

## Responsive Breakpoints

| Ancho          | Comportamiento           |
| -------------- | ------------------------ |
| > 1024px       | Layout horizontal (2:1)  |
| 768px - 1024px | Layout vertical (1:1)    |
| < 768px        | Layout vertical ajustado |

## Métodos Privados Clave

| Método                     | Descripción                                   |
| -------------------------- | --------------------------------------------- |
| `cargarFichas()`           | Carga fichas desde localStorage               |
| `establecerMesActual()`    | Obtiene mes y año actual                      |
| `filtrarFichasDelMes()`    | Filtra por mes actual                         |
| `initMap()`                | Inicializa MapBox                             |
| `actualizarMarcadores()`   | Actualiza marcadores en mapa                  |
| `ajustarZoomAMarcadores()` | Ajusta zoom para mostrar todos los marcadores |
| `generarFichasPrueba()`    | Genera fichas de demostración                 |

## Ciclo de Vida

```
Constructor
    ↓
ngOnInit → establecerMesActual() → cargarFichas()
    ↓
ngAfterViewInit → initMap()
    ↓
User Interaction (filtros, clicks)
    ↓
aplicarFiltros() → actualizarMarcadores()
    ↓
ngOnDestroy → map.remove()
```

## Ejemplo de Uso en Componente Padre

```typescript
// Navegar a la vista
this.router.navigate(["/mapa-fichas"]);

// O cargar componente dinámicamente
const componentRef = this.componentLoader.loadComponent(MapaFichasComponent);
```

## Integración con Backend (Ejemplo)

```typescript
// Reemplazar cargarFichas() con:
private cargarFichas(): void {
  this.fichasService.obtenerFichasDelMes(
    new Date().getMonth() + 1,
    new Date().getFullYear()
  ).subscribe({
    next: (fichas) => {
      this.todasLasFichas = fichas;
      this.filtrarFichasDelMes();
    },
    error: (err) => console.error('Error cargando fichas', err)
  });
}
```

## Validaciones

- Fichas mostradas solo con `latitud` y `longitud` válidas
- Filtrado por mes: `fechaSuceso` coincide con mes/año actual
- Filtros aplicados con lógica AND

## Performance

- Máximo ~2000 fichas sin optimización
- Para más, usar clustering de MapBox
- ScrollBar virtual puede implementarse para listas grandes

## Dependencias

- `@angular/core` - Framework
- `@angular/common` - CommonModule
- `@angular/forms` - FormsModule (ngModel)
- `mapbox-gl` - Librería de mapas

## Configuración Necesaria

En `angular.json`, asegúrate que:

```json
{
  "styles": ["node_modules/mapbox-gl/dist/mapbox-gl.css"]
}
```

**Nota**: Mapbox-gl está instalado en package.json
