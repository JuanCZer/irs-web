import { ApiService } from './api.service';
import { DespachoService } from './despacho.service';

describe('DespachoService', () => {
  let service: DespachoService;

  beforeEach(() => {
    service = new DespachoService({} as ApiService);
  });

  it('conserva un borrador de medidas por ficha', () => {
    service.saveMeasuresDraft(10, {
      measures: [1, 3],
      comment: 'Comentario de la ficha 10',
    });
    service.saveMeasuresDraft(20, {
      measures: [2],
      comment: 'Comentario de la ficha 20',
    });

    expect(service.getMeasuresDraft(10)).toEqual({
      measures: [1, 3],
      comment: 'Comentario de la ficha 10',
    });
    expect(service.getMeasuresDraft(20)?.measures).toEqual([2]);
  });

  it('elimina el borrador cuando la ficha ya fue validada', () => {
    service.saveMeasuresDraft(10, {
      measures: [1],
      comment: '',
    });

    service.deleteMeasuresDraft(10);

    expect(service.getMeasuresDraft(10)).toBeUndefined();
  });
});
