# Debugging Marcadores del Mapa

## Problema Reportado

Los marcadores no andan funcionando después de cambios recientes.

## Checklist de Verificación

### 1. Verificar en la Consola del Navegador (F12)

Cuando cargues la página de mapa-fichas, deberías ver estos logs en orden:

```
✅ Mapa cargado correctamente
📍 Procesando X fichas...
✏️ Creando marcador para ficha...
✅ Resultado: { marcadoresCreados: X, fichasSinCoordenadas: Y, totalProcesadas: Z }
🎯 Ajustando zoom a marcadores
```

### 2. Si NO ves los logs del mapa

- [ ] Verifica que el mapa está visible en la página (debe ocupar 2/3 de ancho)
- [ ] Abre F12 → Consola y busca errores rojos
- [ ] Verifica que el token de MapBox sea válido: `pk.eyJ1IjoianVhbmN6ZXJvbmciLCJhIjoiY21lbTRuY3pwMHAzdjJub294eWM3ZDNxeiJ9.GR7kio2VVQvxV55zolMCKQ`

### 3. Si ves "📍 Procesando X fichas..." pero NO ves "✏️ Creando marcador"

- [ ] Las fichas pueden no tener coordenadas válidas
- [ ] Busca en consola: `⚠️ Ficha sin coordenadas válidas:`
- [ ] Verifica que el API está retornando `latitud` y `longitud` como strings
- [ ] Ejemplo esperado: `latitud: "23.6345", longitud: "-102.5528"`

### 4. Si ves "✏️ Creando marcador" pero los marcadores NO aparecen

- [ ] Verifica que NO hay errores en la consola (🔴 rojo)
- [ ] El problema podría ser el estilo MapBox (layer z-index)
- [ ] Intenta zoom in/out (scroll del mouse) para ver si aparecen
- [ ] Intenta hacer pan (drag) del mapa para ver si están fuera del viewport

### 5. Verificar Coordenadas en las Fichas

En consola, ejecuta:

```javascript
// Si estás en Angular, accede al componente así:
// Copia esta línea en la consola después de verificar que hay datos
console.table(window.fichasDebug?.fichasVisible || []);
```

### 6. Componentes Clave a Revisar

#### Archivo: `src/app/pages/mapa-fichas/mapa-fichas.component.ts`

- [ ] `ngAfterViewInit()` - Debe inicializar mapa primero, luego cargar fichas
- [ ] `initMap()` - Debe tener listener en 'load' event
- [ ] `cargarFichas()` - Debe convertir coordenadas string → number
- [ ] `actualizarMarcadores()` - Debe verificar que map.isStyleLoaded()

#### Archivo: `src/app/services/fichas.service.ts`

- [ ] Verifica que `FichasTodosDTO` incluya `latitud?: string` y `longitud?: string`
- [ ] El API retorna coordenadas con nombres exactos (case-sensitive)

## Pasos para Restaurar Funcionalidad

### Paso 1: Limpia el cache del navegador

```
Ctrl+Shift+Delete → Borrar datos de sitios web
```

### Paso 2: Recarga la página

```
Ctrl+F5 (reload sin cache)
```

### Paso 3: Abre la consola y observa los logs

```
F12 → Pestaña "Console"
```

### Paso 4: Si no funciona, verifica estos puntos

**En `actualizarMarcadores()`:**

- ✅ Map está inicializado (`this.map` existe)
- ✅ Estilo está cargado (`this.map.isStyleLoaded()` es true)
- ✅ Hay fichas con coordenadas (`this.fichasVisible.length > 0`)
- ✅ Coordenadas son números (no strings) (`typeof ficha.latitud === 'number'`)

**En `cargarFichas()`:**

- ✅ API retorna fichas con `latitud` y `longitud`
- ✅ Los valores se convierten correctamente con `parseFloat()`
- ✅ `aplicarFiltros()` se llama después de procesar fichas

## Logs Esperados por Estado

### ✅ Estado Correcto (Marcadores Aparecen)

```
🗺️ Inicializando mapa...
✅ Mapa cargado correctamente
Fichas obtenidas del API: [...]
Fichas procesadas: [...]
✅ Fichas filtradas: 25
✏️ Creando marcador para ficha ID-001: { latitud: 23.6345, longitud: -102.5528 }
✏️ Creando marcador para ficha ID-002: { latitud: 24.7234, longitud: -101.2332 }
...
✅ Resultado: { marcadoresCreados: 25, fichasSinCoordenadas: 0, totalProcesadas: 25 }
🎯 Ajustando zoom a marcadores
```

### ❌ Estado Error (Marcadores NO Aparecen)

```
🗺️ Inicializando mapa...
✅ Mapa cargado correctamente
Fichas obtenidas del API: [...]
Fichas procesadas: [...]
✅ Fichas filtradas: 25
⚠️ Ficha sin coordenadas válidas: { id: "ID-001", latitud: "23.6345", longitud: "-102.5528", tipoLat: "string", tipoLng: "string" }
⚠️ No hay marcadores para mostrar
```

### 🔴 Error Fatal

```
❌ Mapa no inicializado
```

O

```
⚠️ Mapa aún no ha cargado el estilo, reintentando...
```

## Soluciones Rápidas

### Si las coordenadas vienen como strings

Asegúrate en `cargarFichas()` que se usan parseFloat:

```typescript
const latitudParsed = ficha.latitud ? parseFloat(ficha.latitud) : null;
const longitudParsed = ficha.longitud ? parseFloat(ficha.longitud) : null;
```

### Si el mapa no está listo

Verifica que `ngAfterViewInit()` ejecuta:

```typescript
setTimeout(() => {
  this.cargarFichas();
}, 500);
```

### Si los filtros no actualizan marcadores

Asegúrate que `aplicarFiltros()` llama a `actualizarMarcadores()`:

```typescript
if (this.mapReady && this.map && this.map.isStyleLoaded()) {
  this.actualizarMarcadores();
}
```

## API Esperado

El endpoint `/api/fichas` debe retornar estructuras como:

```json
[
  {
    "id": "ID-001",
    "folio": "2024-001",
    "latitud": "23.6345",
    "longitud": "-102.5528",
    "lugar": "Centro",
    "estado": "Aguascalientes",
    "sector": "Sector 1",
    "fechaSuceso": "2024-01-15",
    ...
  }
]
```

**Puntos clave:**

- `latitud` y `longitud` deben ser strings numéricos (ej: "23.6345")
- El componente los convierte a number con `parseFloat()`
- MapBox espera formato [longitude, latitude] (nota el orden invertido)
