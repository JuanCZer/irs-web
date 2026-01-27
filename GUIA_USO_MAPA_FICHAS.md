# Guía de Uso - Vista Mapa de Fichas

## Acceso a la Vista

Para acceder a la nueva vista de mapa de fichas:

1. Inicia sesión en la aplicación
2. En el menú lateral, dirígete a la opción de fichas
3. Selecciona "Ver en Mapa" o accede directamente a: `http://localhost:4200/mapa-fichas`

## Interfaz Principal

La pantalla se divide en dos secciones:

### Lado Izquierdo: Mapa (66% del ancho)

- Mapa interactivo de MapBox mostrando todas las fichas filtradas
- Marcadores de colores representan diferentes niveles de prioridad
- **Rojo** = Crítica | **Naranja** = Alta | **Amarillo** = Media | **Verde** = Baja

### Lado Derecho: Panel de Fichas (33% del ancho)

- Encabezado: Muestra el total de fichas disponibles
- Filtros: Dropdown para refinar la búsqueda
- Lista de Fichas: Tarjetas con resumen de cada ficha

## Cómo Usar los Filtros

### 1. Filtrar por Estado

- Click en el dropdown "Estado"
- Selecciona un estado de la lista (ej: Chiapas, Veracruz, etc.)
- La lista se actualiza automáticamente

### 2. Filtrar por Sector

- Click en el dropdown "Sector"
- Elige entre Sector 1, 2, 3 o 4
- El mapa muestra solo fichas del sector seleccionado

### 3. Filtrar por Prioridad

- Usa el dropdown "Prioridad"
- Opciones: Baja, Media, Alta, Crítica
- Los marcadores en el mapa se filtran inmediatamente

### 4. Filtrar por Condición

- Dropdown "Condición"
- Opciones: Finalizado, En proceso, Pendiente, Cancelado

### 5. Combinar Filtros

- Puedes aplicar múltiples filtros a la vez
- Todos deben cumplirse simultáneamente (lógica AND)
- Ejemplo: Ver fichas de "Chiapas" con prioridad "Alta"

### Limpiar Filtros

- Click en el botón **"Limpiar"** para resetear todos los filtros
- Vuelve a mostrar todas las fichas del mes actual

## Interacción con Fichas

### Hacer Click en una Tarjeta

1. Selecciona cualquier tarjeta en el panel derecho
2. El mapa se centra automáticamente en la ubicación de la ficha
3. Se abre un popup con detalles completos de la ficha

### Interactuar con el Mapa

1. Haz click en cualquier marcador del mapa
2. Se abre un popup mostrando:
   - Asunto de la ficha
   - Lugar y Estado
   - Nivel de Prioridad
   - Fecha del suceso

### Navegar el Mapa

- **Zoom**: Rueda del ratón o controles en la esquina superior derecha
- **Desplazamiento**: Click y arrastra con el ratón
- **Rotar**: Click derecho y arrastra (en algunos navegadores)

## Información Mostrada en Tarjetas

Cada tarjeta de ficha contiene:

| Campo           | Descripción                                  |
| --------------- | -------------------------------------------- |
| **Asunto**      | Título principal de la ficha (en negrita)    |
| **Prioridad**   | Badge con nivel: Crítica, Alta, Media o Baja |
| **Lugar**       | Ubicación específica del evento              |
| **Estado**      | Estado de la República Mexicana              |
| **Sector**      | Sector asignado                              |
| **Fecha**       | Fecha en formato YYYY-MM-DD                  |
| **Asistentes**  | Número de personas (si se registró)          |
| **Condición**   | Estado actual: Finalizado, En proceso, etc.  |
| **Coordenadas** | Latitud y Longitud (4 decimales)             |

## Período de Visualización

- **Las fichas mostradas son solo del mes actual**
- Si es enero 2026, verás fichas de enero 2026
- Si cambias de mes en tu sistema, se actualizarán automáticamente

## Tips y Trucos

### Ubicar Fichas Rápidamente

1. Si buscas fichas de un estado específico, filtra por "Estado"
2. Las fichas con mayor prioridad aparecerán con marcadores rojos

### Analizar Distribución Geográfica

1. No apliques filtros para ver la distribución completa
2. Los marcadores muestran dónde ocurrieron los eventos
3. Acerca/aleja el zoom para detalles

### Imprimir o Compartir

1. Captura de pantalla de la vista actual
2. Puedes documentar la distribución de fichas del mes

## Limitaciones Actuales

- Solo muestra fichas del mes actual
- Requiere que las fichas tengan coordenadas (latitud/longitud)
- Máximo 2000 fichas sin agrupamiento (se puede optimizar)

## Solución de Problemas

### El mapa no carga

- Verifica conexión a Internet
- El token de MapBox puede estar vencido
- Abre la consola (F12) para ver errores

### Las fichas no aparecen en el mapa

- Asegúrate que las fichas tengan latitud y longitud registradas
- Verifica que la fecha sea del mes actual
- Revisa que los filtros no estén muy restrictivos

### El panel de fichas está vacío

- Intenta limpiar los filtros
- Verifica que haya fichas guardadas en la base de datos
- El mes actual podría no tener fichas

## Próximas Mejoras Planeadas

- [ ] Buscar fichas por nombre/asunto
- [ ] Exportar fichas a PDF
- [ ] Editar fichas desde la vista
- [ ] Agregar clusters para mejor rendimiento
- [ ] Más opciones de filtrado
