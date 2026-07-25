import { SimpleChange } from '@angular/core';
import { ModalMedidasComponent } from './modal-medidas.component';

describe('ModalMedidasComponent', () => {
  let component: ModalMedidasComponent;

  beforeEach(() => {
    component = new ModalMedidasComponent();
  });

  it('restaura las medidas y el comentario al abrirse', () => {
    component.visible = true;
    component.medidasSeleccionadas = [2, 4];
    component.comentarioInicial = 'Mantener vigilancia';

    component.ngOnChanges({
      visible: new SimpleChange(false, true, true),
    });

    expect(component.medidasSeleccionadasMap).toEqual({ 2: true, 4: true });
    expect(component.comentario).toBe('Mantener vigilancia');
  });

  it('conserva y comunica el borrador al cerrar', () => {
    const borradores: Array<{ medidas: number[]; comentario: string }> = [];
    component.borradorChange.subscribe((borrador) =>
      borradores.push(borrador)
    );
    component.onMedidaChange(3, true);
    component.onComentarioChange('Rondines');

    component.onCerrar();

    expect(component.medidasSeleccionadasMap[3]).toBeTrue();
    expect(component.comentario).toBe('Rondines');
    expect(borradores.at(-1)).toEqual({
      medidas: [3],
      comentario: 'Rondines',
    });
  });
});
