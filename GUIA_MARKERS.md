# 🗺️ Guía de Prueba - Marcadores del Mapa

## ¿Qué cambió?

He refactorizado el componente `mapa-fichas` para mejorar la robustez de carga de marcadores. Los cambios incluyen:

✅ **Mejor logging** - Ahora hay logs detallados en cada paso
✅ **Validación mejorada** - Se validan las coordenadas en más lugares
✅ **Debugging en consola** - Acceso a datos vía `window.fichasDebug`
✅ **Mejor manejo de promesas** - Espera explícita a que el mapa cargue

---

## 🚀 Cómo Probar

### Paso 1: Recarga Completa

```
Presiona: Ctrl + Shift + Delete
Borra todos los datos de este sitio
Luego presiona: Ctrl + F5 para recargar sin cache
```

### Paso 2: Abre la Consola del Navegador

```
Presiona: F12
Haz clic en la pestaña "Console"
Asegúrate de no haber errores rojos
```

### Paso 3: Observa los Logs

Deberías ver mensajes como estos en orden:

```
🔧 ngAfterViewInit() ejecutado
🗺️ Inicializando mapa...
✅ Mapa cargado correctamente
⏱️ Ejecutando cargarFichas() después de 500ms...
📥 cargarFichas() - Iniciando carga desde API...
✅ Fichas obtenidas del API: [...]
📊 Total fichas: 25
🧭 Fichas con coordenadas válidas: 20
✅ Fichas procesadas: 25
🔍 aplicarFiltros() - Iniciando filtrado...
📍 Mapa listo, actualizando marcadores...
🎨 Estilo del mapa cargado, llamando actualizarMarcadores()
🗺️ actualizarMarcadores() llamado
✏️ Creando marcador para ficha ID-001: { latitud: 23.6345, longitud: -102.5528 }
✏️ Creando marcador para ficha ID-002: { latitud: 24.1235, longitud: -101.1234 }
✅ Resultado: { marcadoresCreados: 20, fichasSinCoordenadas: 5, totalProcesadas: 25 }
🎯 Ajustando zoom a marcadores
```

---

## 🔍 Debugging en Consola

Si necesitas verificar el estado, ejecuta en la consola:

```javascript
// Ver objeto de debug
fichasDebug;

// Ver todas las fichas cargadas
fichasDebug.todasLasFichas;

// Ver fichas filtradas (que aparecen en el panel)
fichasDebug.fichasVisible;

// Ver marcadores del mapa
fichasDebug.markers;

// Ver si el mapa está listo
fichasDebug.mapLoaded;
fichasDebug.mapReady;

// Ver una ficha en particular (reemplaza 0 con el índice)
fichasDebug.fichasVisible[0];

// Ver la primera ficha con sus coordenadas
console.table(fichasDebug.fichasVisible[0]);
```

---

## ✅ Si los Marcadores Aparecen

¡Excelente! El problema está resuelto. Los markers ahora:

- ✅ Se cargan correctamente
- ✅ Se actualizen con los filtros
- ✅ Muestran popup al hacer clic
- ✅ Zooman automáticamente a todos los markers

Puedes probar:

1. **Cambiar las fechas** - Los markers deben actualizarse
2. **Filtrar por Estado** - Los markers deben filtrarse
3. **Hacer zoom** - Zoom automático a los markers
4. **Hacer clic en un marker** - Debe mostrar popup

---

## ❌ Si los Marcadores NO Aparecen

### Caso 1: Veo logs pero "📍 Procesando X fichas..." no aparece

**Problema:** El API no está retornando fichas

**Solución:**

1. Abre DevTools → Network
2. Busca la llamada a `/api/fichas`
3. Verifica que retorne status 200
4. Revisa la respuesta JSON - ¿tiene datos?

```json
// Debe tener estructura como esta:
[
  {
    "id": "ID-001",
    "folio": "2024-001",
    "latitud": "23.6345",      // ← Strings numéricos
    "longitud": "-102.5528",   // ← Strings numéricos
    ...
  }
]
```

### Caso 2: Veo "📍 Procesando X fichas..." pero no "✏️ Creando marcador"

**Problema:** Las coordenadas no se están convirtiendo correctamente

En consola, verifica:

```javascript
// ¿Las coordenadas son strings?
fichasDebug.todasLasFichas[0].latitud;
fichasDebug.todasLasFichas[0].longitud;

// ¿Son números después del parseFloat?
typeof fichasDebug.fichasVisible[0].latitud;
typeof fichasDebug.fichasVisible[0].longitud;
```

**Solución:** Las coordenadas deben ser números (`typeof === 'number'`), no strings

### Caso 3: Veo "✏️ Creando marcador" pero los marcadores no aparecen en el mapa

**Problema:** El mapa existe pero los marcadores no se ven

**Cosas a probar:**

1. ¿El mapa está visible? (debe ocupar 2/3 del ancho)
2. Prueba zoom in/out (rueda del mouse) - ¿aparecen?
3. Prueba pan (drag) - ¿los markers están fuera?
4. Abre DevTools → Elements y busca `<canvas>` del mapa

**Solución:** Puede ser problema de z-index del mapa

---

## 📊 Información sobre Coordenadas

El mapa espera:

- **Formato:** `[longitud, latitud]` (nota el ORDEN INVERTIDO)
- **Tipo:** Números, no strings
- **Rango válido:**
  - Longitud: -180 a 180
  - Latitud: -90 a 90

**Ejemplo correcto:**

```typescript
marker.setLngLat([-102.5528, 23.6345]); // ✅ [lng, lat]
```

**Ejemplo incorrecto:**

```typescript
marker.setLngLat([23.6345, -102.5528]); // ❌ [lat, lng] - INVERTIDO
```

---

## 🔧 Métodos Clave Ejecutados

### 1️⃣ `ngAfterViewInit()` → Inicializa el mapa

```typescript
initMap(); // Crea mapa MapBox
setTimeout(() => cargarFichas(), 500); // Espera a que cargue
```

### 2️⃣ `cargarFichas()` → Obtiene datos del API

```typescript
obtenerTodasLasFichas()  // GET /api/fichas
parseFloat() coordenadas  // Convierte strings a números
aplicarFiltros()  // Aplica filtros
```

### 3️⃣ `aplicarFiltros()` → Filtra fichas

```typescript
Filter por fecha, estado, sector, condición
actualizarMarcadores()  // Agrega markers al mapa
```

### 4️⃣ `actualizarMarcadores()` → Dibuja en el mapa

```typescript
marker.setLngLat([lng, lat]); // Posición
marker.setPopup(); // Contenido popup
marker.addTo(map); // Agrega al mapa
ajustarZoomAMarcadores(); // Zoom automático
```

---

## 📝 Notas Importantes

1. **Token MapBox:** Está hardcodeado en el componente (línea 22)
   - Si el token expiró, la app no funcionará
   - Token actual: `pk.eyJ1IjoianVhbmN6ZXJvbmciLCJhIjoiY21lbTRuY3pwMHAzdjJub294eWM3ZDNxeiJ9.GR7kio2VVQvxV55zolMCKQ`

2. **API Endpoint:** `https://localhost:5001/api/fichas`
   - Asegúrate que el backend está corriendo
   - Verifica HTTPS (no HTTP)

3. **Delay de 500ms:** Necesario para que MapBox cargue el estilo antes de agregar markers

4. **Logs Extensos:** Creados solo para debugging, puedes comentarlos luego

---

## 🎯 Próximos Pasos

Una vez que los marcadores funcionen:

1. **Agregar búsqueda por texto**
2. **Editar fichas desde el panel**
3. **Exportar a PDF/Excel**
4. **Performance: Agrupar markers si hay muchos**
5. **Mover token a environment.ts**

---

## ⚠️ Troubleshooting Rápido

| Síntoma                           | Causa                                            | Solución                                            |
| --------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| No veo mapa                       | Token inválido                                   | Verifica token MapBox                               |
| Mapa pero sin markers             | API sin datos                                    | Verifica `/api/fichas` retorna datos                |
| Markers en lugar incorrecto       | [lat,lng] invertido                              | Verifica que sea [lng,lat]                          |
| Marcadores desaparecen al filtrar | aplicarFiltros() no llama actualizarMarcadores() | Verifica condición mapReady                         |
| Popup no muestra                  | HTML incorrecto                                  | Verifica setPopup() tiene HTML válido               |
| Zoom no ajusta                    | Coordenadas inválidas                            | Verifica ficha.latitud y ficha.longitud son números |

---

## 📞 Contactar Soporte

Si después de seguir estos pasos aún tienes problemas:

1. Comparte los logs de la consola (F12)
2. Verifica la respuesta del API en Network tab
3. Revisa si hay errores JavaScript (línea roja en consola)
