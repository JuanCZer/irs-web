import { ApiService } from './api.service';
import { DespachoService } from './despacho.service';

describe('DespachoService', () => {
  let service: DespachoService;

  beforeEach(() => {
    service = new DespachoService({} as ApiService);
  });

  it('conserva un borrador de medidas por ficha', () => {
    service.guardarBorradorMedidas(10, {
      medidas: [1, 3],
      comentario: 'Comentario de la ficha 10',
    });
    service.guardarBorradorMedidas(20, {
      medidas: [2],
      comentario: 'Comentario de la ficha 20',
    });

    expect(service.obtenerBorradorMedidas(10)).toEqual({
      medidas: [1, 3],
      comentario: 'Comentario de la ficha 10',
    });
    expect(service.obtenerBorradorMedidas(20)?.medidas).toEqual([2]);
  });

  it('elimina el borrador cuando la ficha ya fue validada', () => {
    service.guardarBorradorMedidas(10, {
      medidas: [1],
      comentario: '',
    });

    service.eliminarBorradorMedidas(10);

    expect(service.obtenerBorradorMedidas(10)).toBeUndefined();
  });
});
