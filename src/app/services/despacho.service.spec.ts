import { ApiService } from './api.service';
import {
  DISPATCH_DRAFT_STORAGE_KEY,
  DespachoService,
} from './despacho.service';

describe('DespachoService', () => {
  let service: DespachoService;

  beforeEach(() => {
    localStorage.removeItem(DISPATCH_DRAFT_STORAGE_KEY);
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

  it('restaura el estado seleccionado después de recargar el servicio', () => {
    service.saveMeasuresDraft(30, {
      measures: [4, 6],
      comment: 'Mantener monitoreo',
    });

    const restoredService = new DespachoService({} as ApiService);

    expect(restoredService.getMeasuresDraft(30)).toEqual({
      measures: [4, 6],
      comment: 'Mantener monitoreo',
    });
  });
});
