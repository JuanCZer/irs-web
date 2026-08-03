import { SimpleChange } from '@angular/core';
import { ModalMedidasComponent } from './modal-medidas.component';

describe('ModalMedidasComponent', () => {
  let component: ModalMedidasComponent;

  beforeEach(() => {
    component = new ModalMedidasComponent();
  });

  it('restaura las medidas y el comentario al abrirse', () => {
    component.visible = true;
    component.selectedMeasures = [2, 4];
    component.initialComment = 'Mantener vigilancia';

    component.ngOnChanges({
      visible: new SimpleChange(false, true, true),
    });

    expect(component.selectedMeasuresMap).toEqual({ 2: true, 4: true });
    expect(component.comment).toBe('Mantener vigilancia');
  });

  it('conserva y comunica el borrador al cerrar', () => {
    const drafts: Array<{ measures: number[]; comment: string }> = [];
    component.draftChange.subscribe((draft) =>
      drafts.push(draft)
    );
    component.onMeasureChange(3, true);
    component.onCommentChange('Rondines');

    component.onClose();

    expect(component.selectedMeasuresMap[3]).toBeTrue();
    expect(component.comment).toBe('Rondines');
    expect(drafts.at(-1)).toEqual({
      measures: [3],
      comment: 'Rondines',
    });
  });
});
