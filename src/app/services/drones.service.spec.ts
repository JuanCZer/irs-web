import { ApiService } from './api.service';
import {
  DRONE_SECURITY_MEASURE,
  DroneLinkedReport,
  DronesService,
} from './drones.service';
import {
  DISPATCH_DRAFT_STORAGE_KEY,
  DespachoService,
} from './despacho.service';

describe('DronesService', () => {
  beforeEach(() => {
    localStorage.removeItem(DISPATCH_DRAFT_STORAGE_KEY);
  });

  it('conserva únicamente fichas con la medida de despliegue de dron', async () => {
    const reports: DroneLinkedReport[] = [
      createReport(1, DRONE_SECURITY_MEASURE),
      createReport(2, 'Dron'),
      createReport(3, 'Policía auxiliar'),
    ];
    const api = {
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify(reports), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    } as ApiService;
    const dispatchService = new DespachoService({} as ApiService);
    const service = new DronesService(api, dispatchService);

    const drones = await service.getDroneDashboard();

    expect(drones.length).toBe(1);
    expect(drones[0].linkedReport.reportId).toBe(1);
    expect(drones[0].flights[0].status).toBe('pending-sync');
  });

  it('incluye la ficha desde que la medida se selecciona en el borrador', async () => {
    const api = {
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
    } as ApiService;
    const dispatchService = new DespachoService({} as ApiService);
    dispatchService.saveMeasuresDraft(25, {
      measures: [7],
      measureNames: [DRONE_SECURITY_MEASURE],
      comment: '',
      updatedAt: '2026-08-03T12:00:00Z',
      report: {
        reportId: 25,
        referenceNumber: 'F-25',
        eventDate: '2026-08-03',
        delegation: 'Delegación de prueba',
        municipality: 'Municipio de prueba',
        place: 'Lugar de prueba',
        priority: 'Alta',
        sector: 'Sector 1',
        subject: 'Atención de incidente',
      },
    });
    const service = new DronesService(api, dispatchService);

    const drones = await service.getDroneDashboard();

    expect(drones.length).toBe(1);
    expect(drones[0].linkedReport.reportId).toBe(25);
    expect(drones[0].status).toBe('selected');
  });

  function createReport(
    reportId: number,
    securityMeasure: string,
  ): DroneLinkedReport {
    return {
      dispatchReportId: reportId,
      reportId,
      referenceNumber: `F-${reportId}`,
      validationDate: '2026-08-03T12:00:00Z',
      delegation: 'Delegación de prueba',
      municipality: 'Municipio de prueba',
      place: 'Lugar de prueba',
      subject: 'Atención de incidente',
      comment: '',
      securityMeasure,
    };
  }
});
