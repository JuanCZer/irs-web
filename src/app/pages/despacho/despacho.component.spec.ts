import { AuthService } from '../../services/auth.service';
import { CatalogosService } from '../../services/catalogos.service';
import { DespachoService } from '../../services/despacho.service';
import { FichasService } from '../../services/fichas.service';
import { DespachoComponent } from './despacho.component';

describe('DespachoComponent filters', () => {
  let component: DespachoComponent;
  let getMeasuresDraft: jasmine.Spy;

  beforeEach(() => {
    getMeasuresDraft = jasmine.createSpy('getMeasuresDraft').and.callFake(
      (reportId: number) =>
        reportId === 8
          ? {
              measures: [1],
            }
          : undefined,
    );

    component = new DespachoComponent(
      {} as FichasService,
      { getMeasuresDraft } as unknown as DespachoService,
      {} as CatalogosService,
      {} as AuthService,
    );

    component.reports = [
      {
        reportId: 8,
        referenceNumber: 'F-000008',
        eventDate: '2025-03-21',
        delegation: 'HIDALGO',
        municipality: 'Pachuca de Soto',
        place: 'Plaza Juárez',
        priority: 'INUSUAL',
        sector: 'SEGURIDAD',
        subject: 'Detonación de arma de fuego',
      },
      {
        reportId: 4,
        referenceNumber: 'F-000004',
        eventDate: '2025-01-08',
        delegation: 'CENTRO',
        municipality: 'Mineral de la Reforma',
        place: 'Domicilio particular',
        priority: 'RELEVANTE',
        sector: 'GOBIERNO',
        subject: 'Persona localizada',
      },
      {
        reportId: 12,
        referenceNumber: 'F-000012',
        eventDate: '',
        delegation: 'CENTRO',
        municipality: 'Pachuca de Soto',
        place: 'Sin ubicación',
        priority: 'RELEVANTE',
        sector: 'SEGURIDAD',
        subject: 'Ficha sin fecha',
      },
    ];
  });

  it('searches across fields without distinguishing accents or case', () => {
    component.searchTerm = 'detonacion hidalgo';

    expect(component.filteredReports.map((report) => report.reportId)).toEqual([
      8,
    ]);
  });

  it('applies an inclusive event-date range and excludes reports without a date', () => {
    component.startDate = '2025-01-08';
    component.endDate = '2025-03-21';

    expect(component.filteredReports.map((report) => report.reportId)).toEqual([
      8, 4,
    ]);
  });

  it('combines catalog and saved-measure filters', () => {
    component.delegationFilter = 'HIDALGO';
    component.sectorFilter = 'SEGURIDAD';
    component.measureFilter = 'selected';

    expect(component.filteredReports.map((report) => report.reportId)).toEqual([
      8,
    ]);
    expect(getMeasuresDraft).toHaveBeenCalledWith(8);
  });

  it('rejects an inverted date range', () => {
    component.startDate = '2025-03-22';
    component.endDate = '2025-03-21';

    expect(component.dateRangeError).toContain('fecha inicial');
    expect(component.filteredReports).toEqual([]);
  });

  it('resets pagination when filters change and restores all reports when cleared', () => {
    component.currentPage = 3;
    component.searchTerm = 'persona';
    component.priorityFilter = 'RELEVANTE';
    component.onFiltersChange();

    expect(component.currentPage).toBe(1);
    expect(component.filteredReports.length).toBe(1);

    component.clearFilters();

    expect(component.hasActiveFilters).toBeFalse();
    expect(component.filteredReports.length).toBe(3);
  });
});
