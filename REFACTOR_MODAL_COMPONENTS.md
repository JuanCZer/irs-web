# Refactorización de Modales en Componentes Separados

## Resumen

Se extrajeron los modales inline del componente DespachoComponent a componentes separados y reutilizables siguiendo las mejores prácticas de Angular.

## Cambios Realizados

### 1. Componentes Creados

#### ModalMedidasComponent

**Ubicación:** `src/app/components/modal-medidas/`

**Archivos:**

- `modal-medidas.component.ts` - Lógica del componente
- `modal-medidas.component.html` - Template del modal
- `modal-medidas.component.less` - Estilos del modal

**Funcionalidad:**

- Muestra la información de la ficha (folio, delegación, municipio, lugar, prioridad)
- Lista de medidas de seguridad cargadas desde el catálogo
- Checkboxes para seleccionar múltiples medidas
- Textarea para comentarios adicionales
- Resumen de medidas seleccionadas
- Validación: requiere al menos una medida seleccionada

**Inputs:**

```typescript
@Input() visible: boolean
@Input() folioFicha: string
@Input() delegacion: string
@Input() municipio: string
@Input() lugar: string
@Input() prioridad: string
@Input() medidasSeguridad: CatMedidaSeguridad[]
```

**Outputs:**

```typescript
@Output() cerrar: EventEmitter<void>
@Output() aplicar: EventEmitter<AplicarMedidasEvent>

interface AplicarMedidasEvent {
  medidas: number[];      // IDs de las medidas seleccionadas
  comentario: string;     // Comentario del usuario
}
```

**Características Técnicas:**

- Usa un `medidasSeleccionadasMap` para rastrear las selecciones sin mutar el array de entrada
- Computed property `medidasSeleccionadasCount` para mostrar el contador
- Método `getMedidasSeleccionadasList()` para obtener objetos completos de medidas seleccionadas
- Limpia estado al cerrar o aplicar

---

#### ModalValidarComponent

**Ubicación:** `src/app/components/modal-validar/`

**Archivos:**

- `modal-validar.component.ts` - Lógica del componente
- `modal-validar.component.html` - Template del modal
- `modal-validar.component.less` - Estilos del modal

**Funcionalidad:**

- Muestra información de la ficha
- Drag & drop para subir archivos PNG
- Validación de tipo de archivo (solo PNG)
- Lista de archivos seleccionados con tamaño
- Botón para eliminar archivos individuales
- Conversión automática a Base64

**Inputs:**

```typescript
@Input() visible: boolean
@Input() folioFicha: string
@Input() delegacion: string
@Input() municipio: string
@Input() lugar: string
@Input() prioridad: string
```

**Outputs:**

```typescript
@Output() cerrar: EventEmitter<void>
@Output() validar: EventEmitter<ValidarEvent>

interface ValidarEvent {
  evidencias: string;     // String de imágenes Base64 separadas por |
}
```

**Características Técnicas:**

- Manejo completo de drag & drop con estados visuales (`isDragging`)
- Validación de archivos PNG
- Array interno `archivosSeleccionados` con `{ archivo: File, base64: string }`
- Método `formatFileSize()` para mostrar tamaño legible
- Conversión a Base64 automática en `handleFiles()`
- Limpia archivos al cerrar o validar

---

### 2. Modificaciones en DespachoComponent

#### Archivo TypeScript (`despacho.component.ts`)

**Imports Añadidos:**

```typescript
import { ModalMedidasComponent, AplicarMedidasEvent } from "../../components/modal-medidas/modal-medidas.component";
import { ModalValidarComponent, ValidarEvent } from "../../components/modal-validar/modal-validar.component";
```

**Declaración de Componente:**

```typescript
@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalMedidasComponent, ModalValidarComponent],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.less',
})
```

**Propiedades Eliminadas:**

- ❌ `mostrarModal: boolean`
- ❌ `modalActual: ModalType`
- ❌ `comentario: string`
- ❌ `archivosSeleccionados: File[]`
- ❌ `isDragging: boolean`
- ❌ `medidasSeguridad: MedidaSeguridad[]` (con propiedad `seleccionada`)

**Propiedades Añadidas:**

- ✅ `mostrarModalMedidas: boolean`
- ✅ `mostrarModalValidar: boolean`
- ✅ `mostrarModalVerFicha: boolean`
- ✅ `medidasSeguridad: CatMedidaSeguridad[]` (del catálogo directamente)
- ✅ `medidasSeleccionadasIds: number[]` (almacena IDs temporalmente)
- ✅ `comentarioTemporal: string`

**Métodos Eliminados:**

- ❌ `aplicarMedidas()`
- ❌ `validarFichaConEvidencia()`
- ❌ `onDragOver()`
- ❌ `onDragLeave()`
- ❌ `onDrop()`
- ❌ `onFileSelected()`
- ❌ `handleFiles()`
- ❌ `eliminarArchivo()`
- ❌ `convertirArchivosABase64()`
- ❌ `get medidasSeleccionadas()`

**Métodos Añadidos:**

- ✅ `onAplicarMedidas(event: AplicarMedidasEvent)` - Handler para evento del modal de medidas
- ✅ `onValidarFicha(event: ValidarEvent)` - Handler para evento del modal de validación

**Cambios en Métodos Existentes:**

`abrirModalMedidas()`:

```typescript
// ANTES
this.comentario = "";
this.medidasSeguridad.forEach((m) => (m.seleccionada = false));
this.modalActual = { tipo: "medidas" };
this.mostrarModal = true;

// DESPUÉS
this.medidasSeleccionadasIds = [];
this.comentarioTemporal = "";
this.mostrarModalMedidas = true;
```

`abrirModalValidar()`:

```typescript
// ANTES
this.comentario = "";
this.archivosSeleccionados = [];
this.modalActual = { tipo: "validar" };
this.mostrarModal = true;

// DESPUÉS
if (this.medidasSeleccionadasIds.length === 0) {
  alert('Primero debe seleccionar las medidas de seguridad usando el botón "Medidas"');
  return;
}
this.fichaSeleccionada = ficha;
this.mostrarModalValidar = true;
```

`cerrarModal()`:

```typescript
// ANTES
this.mostrarModal = false;
this.modalActual = { tipo: null };
this.comentario = "";
this.archivosSeleccionados = [];
this.isDragging = false;

// DESPUÉS
this.mostrarModalMedidas = false;
this.mostrarModalValidar = false;
this.mostrarModalVerFicha = false;
this.fichaSeleccionada = null;
this.fichaDetalleCompleta = null;
```

**Flujo de Trabajo:**

1. **Usuario hace clic en "Medidas"** → `abrirModalMedidas()`

   - Se abre `ModalMedidasComponent`
   - Usuario selecciona medidas y añade comentario
   - Hace clic en "Aplicar Medidas"

2. **ModalMedidasComponent emite evento `aplicar`** → `onAplicarMedidas(event)`

   - Guarda `medidasSeleccionadasIds` y `comentarioTemporal` en el componente padre
   - Muestra alerta indicando que ahora debe usar el botón "Validar"
   - Cierra el modal

3. **Usuario hace clic en "Validar"** → `abrirModalValidar()`

   - Valida que haya medidas seleccionadas
   - Se abre `ModalValidarComponent`
   - Usuario arrastra/sube archivos PNG

4. **ModalValidarComponent emite evento `validar`** → `onValidarFicha(event)`
   - Toma `medidasSeleccionadasIds` y `comentarioTemporal` guardados
   - Combina con `event.evidencias` (Base64)
   - Llama a `despachoService.validarFicha()`
   - Limpia datos temporales
   - Cierra el modal

---

#### Archivo HTML (`despacho.component.html`)

**Antes (Inline Modals):**

```html
<!-- Modal de medidas de seguridad -->
<div class="modal-overlay" *ngIf="mostrarModal && modalActual.tipo === 'medidas'">
  <div class="modal-content">
    <!-- 120+ líneas de HTML -->
  </div>
</div>

<!-- Modal de validación -->
<div class="modal-overlay" *ngIf="mostrarModal && modalActual.tipo === 'validar'">
  <div class="modal-content">
    <!-- 80+ líneas de HTML -->
  </div>
</div>
```

**Después (Component Selectors):**

```html
<!-- Modal de medidas de seguridad -->
<app-modal-medidas [visible]="mostrarModalMedidas" [folioFicha]="fichaSeleccionada?.folio || ''" [delegacion]="fichaSeleccionada?.delegacion || ''" [municipio]="fichaSeleccionada?.municipio || ''" [lugar]="fichaSeleccionada?.lugar || ''" [prioridad]="fichaSeleccionada?.prioridad || ''" [medidasSeguridad]="medidasSeguridad" (cerrar)="cerrarModal()" (aplicar)="onAplicarMedidas($event)"></app-modal-medidas>

<!-- Modal de validación -->
<app-modal-validar [visible]="mostrarModalValidar" [folioFicha]="fichaSeleccionada?.folio || ''" [delegacion]="fichaSeleccionada?.delegacion || ''" [municipio]="fichaSeleccionada?.municipio || ''" [lugar]="fichaSeleccionada?.lugar || ''" [prioridad]="fichaSeleccionada?.prioridad || ''" (cerrar)="cerrarModal()" (validar)="onValidarFicha($event)"></app-modal-validar>
```

**Reducción de Código:**

- **Antes:** ~445 líneas en despacho.component.html
- **Después:** ~270 líneas en despacho.component.html
- **Reducción:** ~175 líneas (39% menos código inline)

---

### 3. Interfaces Eliminadas

```typescript
// ❌ ELIMINADAS del DespachoComponent
interface MedidaSeguridad {
  id: number;
  nombre: string;
  seleccionada: boolean; // Ya no se necesita mutar el array
}

interface ModalType {
  tipo: "medidas" | "ver-ficha" | "validar" | null; // Reemplazado por flags booleanos
}
```

---

## Beneficios de la Refactorización

### 1. **Separación de Responsabilidades**

- Cada modal es responsable de su propia lógica y estado
- El componente padre solo orquesta el flujo de datos

### 2. **Reutilización**

- Los modales pueden ser usados en otros componentes sin duplicar código
- Fácil mantener consistencia de UI en toda la aplicación

### 3. **Mantenibilidad**

- Código más pequeño y enfocado en cada archivo
- Más fácil de entender y modificar
- Reducción de ~200 líneas en DespachoComponent

### 4. **Testabilidad**

- Cada modal puede ser probado en aislamiento
- Mocking más simple para pruebas unitarias
- Inputs/Outputs explícitos facilitan testing

### 5. **Mejor Type Safety**

- Interfaces explícitas para eventos (`AplicarMedidasEvent`, `ValidarEvent`)
- No hay mutación de arrays de entrada
- Estado interno encapsulado

### 6. **Mejor Rendimiento**

- Change Detection más granular
- Solo el modal activo se renderiza y actualiza

---

## Patrón Aplicado

### Input/Output Pattern (Smart/Dumb Components)

**Smart Component (DespachoComponent):**

- Maneja lógica de negocio
- Llama a servicios (FichasService, DespachoService, CatalogosService)
- Gestiona estado de la aplicación
- Orquesta el flujo de trabajo

**Dumb Components (Modal Components):**

- Reciben datos via `@Input`
- Emiten eventos via `@Output`
- No conocen servicios externos
- Reutilizables en diferentes contextos

```
┌─────────────────────────────────┐
│     DespachoComponent           │
│  (Smart Component)              │
│                                 │
│  - fichas[]                     │
│  - medidasSeguridad[]           │
│  - medidasSeleccionadasIds[]    │
│  - comentarioTemporal           │
│                                 │
│  + abrirModalMedidas()          │
│  + abrirModalValidar()          │
│  + onAplicarMedidas(event)      │
│  + onValidarFicha(event)        │
└────────┬───────────────┬────────┘
         │               │
         │ [inputs]      │ [inputs]
         │ (outputs)     │ (outputs)
         ▼               ▼
┌──────────────┐  ┌──────────────┐
│ModalMedidas  │  │ModalValidar  │
│ (Dumb)       │  │ (Dumb)       │
│              │  │              │
│ @Input()     │  │ @Input()     │
│ - visible    │  │ - visible    │
│ - ficha data │  │ - ficha data │
│ - medidas[]  │  │              │
│              │  │              │
│ @Output()    │  │ @Output()    │
│ - cerrar     │  │ - cerrar     │
│ - aplicar    │  │ - validar    │
└──────────────┘  └──────────────┘
```

---

## Testing Recomendado

### ModalMedidasComponent

```typescript
it("should emit aplicar event with selected medidas and comentario", () => {
  const spy = jest.spyOn(component.aplicar, "emit");
  component.medidasSeleccionadasMap = { 1: true, 3: true };
  component.comentario = "Test comment";

  component.onAplicar();

  expect(spy).toHaveBeenCalledWith({
    medidas: [1, 3],
    comentario: "Test comment",
  });
});

it("should show alert when no medidas selected", () => {
  const alertSpy = jest.spyOn(window, "alert");
  component.medidasSeleccionadasMap = {};

  component.onAplicar();

  expect(alertSpy).toHaveBeenCalledWith("Debe seleccionar al menos una medida de seguridad");
});
```

### ModalValidarComponent

```typescript
it("should validate PNG files only", () => {
  const pngFile = new File([""], "test.png", { type: "image/png" });
  const jpgFile = new File([""], "test.jpg", { type: "image/jpeg" });

  component.handleFiles([pngFile, jpgFile]);

  expect(component.archivosSeleccionados.length).toBe(1);
});

it("should convert files to Base64 and emit validar event", async () => {
  const spy = jest.spyOn(component.validar, "emit");
  component.archivosSeleccionados = [
    { archivo: mockFile, base64: "data:image/png;base64,abc" },
    { archivo: mockFile2, base64: "data:image/png;base64,def" },
  ];

  component.onValidar();

  expect(spy).toHaveBeenCalledWith({
    evidencias: "data:image/png;base64,abc|data:image/png;base64,def",
  });
});
```

---

## Próximos Pasos (Opcional)

### 1. Extraer Modal de Ver Ficha

El modal de ver detalles aún está inline. Se podría crear:

- `ModalVerFichaComponent`
- `@Input() ficha: FichasTodosDTO`
- `@Output() cerrar: EventEmitter<void>`

### 2. Crear Servicio de Modal

Para gestionar múltiples modales:

```typescript
export class ModalService {
  private modals: Map<string, Subject<any>>;

  open(modalId: string, data: any): void;
  close(modalId: string): void;
  onClose(modalId: string): Observable<any>;
}
```

### 3. Animaciones

Añadir Angular animations para transiciones suaves:

```typescript
trigger("modalAnimation", [transition(":enter", [style({ opacity: 0, transform: "translateY(-30px)" }), animate("300ms", style({ opacity: 1, transform: "translateY(0)" }))])]);
```

---

## Estructura Final de Archivos

```
src/app/
├── components/
│   ├── modal-medidas/
│   │   ├── modal-medidas.component.ts      ✅ NUEVO
│   │   ├── modal-medidas.component.html    ✅ NUEVO
│   │   └── modal-medidas.component.less    ✅ NUEVO
│   └── modal-validar/
│       ├── modal-validar.component.ts      ✅ NUEVO
│       ├── modal-validar.component.html    ✅ NUEVO
│       └── modal-validar.component.less    ✅ NUEVO
├── pages/
│   └── despacho/
│       ├── despacho.component.ts           ♻️  REFACTORIZADO
│       ├── despacho.component.html         ♻️  REFACTORIZADO (-175 líneas)
│       └── despacho.component.less         (sin cambios)
└── services/
    ├── despacho.service.ts                 (sin cambios)
    └── catalogos.service.ts                (sin cambios)
```

---

## Conclusión

La refactorización mejora significativamente la arquitectura del código siguiendo las mejores prácticas de Angular. Los modales son ahora componentes independientes, reutilizables y fáciles de mantener, mientras que el componente padre se enfoca en la orquestación de datos y lógica de negocio.

**Reducción de Código:** ~200 líneas menos en DespachoComponent  
**Componentes Creados:** 2 nuevos componentes modal reutilizables  
**Mantenibilidad:** ⬆️ Significativamente mejorada  
**Reusabilidad:** ⬆️ Modales pueden usarse en otros contextos  
**Testabilidad:** ⬆️ Cada componente puede probarse en aislamiento

✅ **Refactorización completada exitosamente**
