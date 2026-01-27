# Vista Mapa de Fichas Informativas

## Descripción General

Se ha creado una nueva vista interactiva que combina un mapa de MapBox con un panel de resumen de fichas. Esta vista permite visualizar y filtrar fichas informativas del mes actual, mostrando su ubicación geográfica en un mapa.

## Ruta de Acceso

```
/mapa-fichas
```

## Estructura del Componente

### Archivo: `mapa-fichas.component.ts`

El componente implementa la siguiente funcionalidad:

#### Propiedades Principales

- `todasLasFichas`: Array de todas las fichas disponibles
- `fichasFiltradasMes`: Fichas filtradas al mes actual
- `fichasVisible`: Fichas después de aplicar todos los filtros
- `map`: Instancia del mapa de MapBox
- `markers`: Array de marcadores del mapa

#### Filtros Disponibles

1. **Estado**: Todos los 32 estados de México
2. **Sector**: Sector 1, Sector 2, Sector 3, Sector 4
3. **Prioridad**: Baja, Media, Alta, Crítica
4. **Condición**: Finalizado, En proceso, Pendiente, Cancelado

#### Métodos Principales

- `cargarFichas()`: Carga fichas desde localStorage o API
- `filtrarFichasDelMes()`: Filtra fichas del mes actual automáticamente
- `aplicarFiltros()`: Aplica todos los filtros activos
- `actualizarMarcadores()`: Actualiza marcadores en el mapa
- `seleccionarFicha()`: Centra el mapa en una ficha y abre su popup
- `limpiarFiltros()`: Resetea todos los filtros

### Archivo: `mapa-fichas.component.html`

Estructura HTML con dos secciones principales:

#### Sección del Mapa (2/3 de la pantalla)

- Contenedor del mapa MapBox
- Marcadores con código de color según prioridad:
  - **Rojo**: Crítica
  - **Naranja**: Alta
  - **Amarillo**: Media
  - **Verde**: Baja
- Popups interactivos con información de la ficha

#### Sección de Fichas (1/3 de la pantalla)

- **Encabezado**: Título y contador de fichas
- **Filtros**: Dropdowns para filtrar por estado, sector, prioridad y condición
- **Lista de Fichas**: Tarjetas scrolleables con información resumida

### Archivo: `mapa-fichas.component.less`

Estilos LESS con características:

- Layout Flexbox 2:1 (mapa:fichas)
- Diseño responsive que se adapta a pantallas pequeñas
- Tarjetas con hover effects interactivos
- Indicadores de prioridad con colores codificados
- ScrollBars personalizados
- Gradientes en el encabezado
- Sombras y transiciones suaves

## Características de las Fichas

### Información Mostrada en Tarjetas

- **Asunto**: Título principal de la ficha
- **Prioridad**: Badge con color indicador
- **Lugar**: Ubicación del evento
- **Estado**: Estado de la República Mexicana
- **Sector**: Sector del evento
- **Fecha**: Fecha del suceso
- **Asistentes**: Número de asistentes (si aplica)
- **Condición**: Estado del evento
- **Coordenadas**: Latitud y longitud (formato 4 decimales)

### Interactividad

- **Click en Tarjeta**: Centra el mapa en la ubicación de la ficha
- **Click en Marcador**: Muestra popup con información completa
- **Hover en Tarjeta**: Efecto visual de elevación y cambio de borde
- **Filtros Dinámicos**: Actualización en tiempo real del mapa y lista

## Filtrado Automático

### Por Mes

Las fichas se filtran automáticamente por el mes actual. Solo se muestran fichas cuya `fechaSuceso` coincida con el mes y año actual.

### Por Criterios Personalizados

Después del filtrado de mes, se pueden aplicar filtros adicionales:

- Los filtros se aplican de forma **AND** (todas las condiciones deben cumplirse)
- Al cambiar cualquier filtro, se actualiza automáticamente la vista
- Botón "Limpiar" resetea todos los filtros personalizados

## Mapeo de Fichas en el Mapa

### Lógica de Marcadores

1. Cada ficha con coordenadas (latitud y longitud válidas) genera un marcador
2. Los marcadores se colorean según la prioridad de la ficha
3. Al hacer click en un marcador, se muestra un popup con:
   - Asunto
   - Lugar y Estado
   - Prioridad
   - Fecha

### Zoom Automático

- Si hay marcadores, el mapa se ajusta automáticamente para mostrar todos
- Se aplica padding de 50px para mejor visualización

## Datos de Prueba

Si no hay fichas guardadas en localStorage, el componente genera automáticamente 10 fichas de prueba con:

- Estados aleatorios de México
- Coordenadas aleatorias dentro del territorio mexicano
- Prioridades y sectores variados
- Fechas del mes actual

## Cómo Integrar con el Backend

### Reemplazar Datos de Prueba

Actualmente, el componente carga fichas desde `localStorage.getItem('fichas_informativas')`. Para integrar con un servicio backend:

```typescript
// En lugar de cargarFichas():
private cargarFichas(): void {
  this.fichasService.obtenerFichasDelMes().subscribe(fichas => {
    this.todasLasFichas = fichas;
    this.filtrarFichasDelMes();
  });
}
```

### Estructura de Dato Esperada

```typescript
interface FichaInformativa {
  id?: number;
  estado: string;
  lugar: string;
  latitud: number | null;
  longitud: number | null;
  sector: string;
  fechaSuceso: string; // formato: YYYY-MM-DD
  prioridad: string;
  asunto: string;
  numeroAsistentes?: number;
  condicionEvento?: string;
  // ... otros campos opcionales
}
```

## Responsive Design

### Pantalla Grande (>1024px)

- Layout 2:1 horizontal (mapa a la izquierda, fichas a la derecha)

### Pantalla Mediana (768px - 1024px)

- Layout 1:1 vertical (mapa arriba, fichas abajo)

### Pantalla Pequeña (<768px)

- Ajustes de tamaño de fuente y espaciado

## Token de MapBox

El token está configurado en:

```typescript
private readonly MAPBOX_TOKEN =
  'pk.eyJ1IjoianVhbmN6ZXJvbmciLCJhIjoiY21lbTRuY3pwMHAzdjJub294eWM3ZDNxeiJ9.GR7kio2VVQvxV55zolMCKQ';
```

**Nota**: En producción, se recomienda almacenar este token en variables de entorno.

## Actualizaciones Futuras Sugeridas

1. Integración con servicio `FichasService` del backend
2. Agregar filtros adicionales (municipio, delegación)
3. Permitir editar fichas desde el panel derecho
4. Exportar fichas filtradas a PDF o Excel
5. Agregar leyenda del mapa con explicación de colores
6. Implementar búsqueda de texto en asunto/lugar
7. Agregar clusteres de marcadores para mejor rendimiento con muchas fichas

## Localización de Archivos

```
src/app/pages/mapa-fichas/
├── mapa-fichas.component.ts
├── mapa-fichas.component.html
└── mapa-fichas.component.less
```

## Rutas Configuradas

En `app.routes.ts`:

```typescript
{
  path: 'mapa-fichas',
  loadComponent: () =>
    import('./pages/mapa-fichas/mapa-fichas.component').then(
      (m) => m.MapaFichasComponent
    ),
}
```
