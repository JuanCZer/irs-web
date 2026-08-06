import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export const DISPATCH_DRAFT_STORAGE_KEY = 'irs.dispatch.measure-drafts.v1';

export interface ValidarFichaDespachoRequest {
  reportId: number;
  securityMeasureIds: number[];
  comment: string;
  evidence?: string;
  userId?: number;
}

export interface FichaDespachoResponse {
  dispatchReportId: number;
  reportId: number;
  measureCategoryId: number;
  securityMeasure: string;
  comment: string;
  evidence?: string;
  validationDate: string;
  userId?: number;
  userName?: string;
}

export interface BorradorMedidasDespacho {
  measures: number[];
  comment: string;
  measureNames?: string[];
  updatedAt?: string;
  report?: BorradorFichaDespacho;
}

export interface BorradorFichaDespacho {
  reportId: number;
  referenceNumber: string;
  eventDate: string;
  delegation: string;
  municipality: string;
  place: string;
  priority: string;
  sector: string;
  subject: string;
}

export interface CambioBorradorMedidas {
  reportId: number;
  draft: BorradorMedidasDespacho | null;
}

interface BorradorMedidasServidor {
  reportId: number;
  securityMeasureIds: number[];
  comment: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  private readonly apiUrl = 'despacho';
  private measureDrafts = new Map<number, BorradorMedidasDespacho>();
  private readonly draftChangesSubject =
    new BehaviorSubject<CambioBorradorMedidas | null>(null);
  private readonly draftSyncErrorSubject = new BehaviorSubject<string>('');
  private readonly draftSyncTimers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly draftChanges$ = this.draftChangesSubject.asObservable();
  readonly draftSyncError$ = this.draftSyncErrorSubject.asObservable();

  constructor(private api: ApiService) {
    this.restoreMeasuresDrafts();
  }

  saveMeasuresDraft(
    reportId: number,
    draft: BorradorMedidasDespacho
  ): void {
    if (draft.measures.length === 0 && !draft.comment.trim()) {
      this.deleteMeasuresDraft(reportId);
      return;
    }

    const savedDraft = this.cloneDraft(draft);
    this.measureDrafts.set(reportId, savedDraft);
    this.persistMeasuresDrafts();
    this.draftChangesSubject.next({
      reportId,
      draft: this.cloneDraft(savedDraft),
    });
  }

  getMeasuresDraft(
    reportId: number
  ): BorradorMedidasDespacho | undefined {
    const draft = this.measureDrafts.get(reportId);

    return draft ? this.cloneDraft(draft) : undefined;
  }

  getAllMeasuresDrafts(): Array<{
    reportId: number;
    draft: BorradorMedidasDespacho;
  }> {
    return Array.from(this.measureDrafts.entries()).map(([reportId, draft]) => ({
      reportId,
      draft: this.cloneDraft(draft),
    }));
  }

  deleteMeasuresDraft(reportId: number): void {
    const deleted = this.measureDrafts.delete(reportId);
    if (!deleted) return;

    this.persistMeasuresDrafts();
    this.draftChangesSubject.next({ reportId, draft: null });
  }

  queueMeasureDraftSync(reportId: number): void {
    const currentTimer = this.draftSyncTimers.get(reportId);
    if (currentTimer) clearTimeout(currentTimer);

    this.draftSyncTimers.set(
      reportId,
      setTimeout(() => {
        this.draftSyncTimers.delete(reportId);
        void this.syncMeasureDraft(reportId);
      }, 300),
    );
  }

  async loadMeasureDraftsFromServer(): Promise<void> {
    const localDrafts = new Map(this.measureDrafts);
    const response = await this.api.fetch(
      `${this.apiUrl}/borradores-medidas`,
    );
    if (!response.ok) {
      throw new Error('No fue posible recuperar las medidas seleccionadas');
    }

    const serverDrafts: BorradorMedidasServidor[] = await response.json();
    const serverReportIds = new Set<number>();
    for (const serverDraft of serverDrafts) {
      serverReportIds.add(serverDraft.reportId);
      const localDraft = this.measureDrafts.get(serverDraft.reportId);
      if (
        localDraft?.updatedAt &&
        new Date(localDraft.updatedAt).getTime() >
          new Date(serverDraft.updatedAt).getTime()
      ) {
        this.queueMeasureDraftSync(serverDraft.reportId);
        continue;
      }

      const mergedDraft: BorradorMedidasDespacho = {
        ...(localDraft ?? { measures: [], comment: '' }),
        measures: [...serverDraft.securityMeasureIds],
        comment: serverDraft.comment,
        updatedAt: serverDraft.updatedAt,
      };
      this.measureDrafts.set(serverDraft.reportId, mergedDraft);
      this.draftChangesSubject.next({
        reportId: serverDraft.reportId,
        draft: this.cloneDraft(mergedDraft),
      });
    }
    this.persistMeasuresDrafts();

    for (const reportId of localDrafts.keys()) {
      if (!serverReportIds.has(reportId)) {
        this.queueMeasureDraftSync(reportId);
      }
    }
  }

  private async syncMeasureDraft(reportId: number): Promise<void> {
    const draft = this.measureDrafts.get(reportId);

    try {
      const response = await this.api.fetch(
        `${this.apiUrl}/borradores-medidas/${reportId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            securityMeasureIds: draft?.measures ?? [],
            comment: draft?.comment ?? '',
          }),
        },
      );
      if (!response.ok) {
        throw new Error('El backend rechazó el borrador de medidas');
      }

      this.draftSyncErrorSubject.next('');
    } catch {
      this.draftSyncErrorSubject.next(
        'La selección se guardó localmente, pero no pudo sincronizarse con el backend.',
      );
    }
  }

  private cloneDraft(
    draft: BorradorMedidasDespacho
  ): BorradorMedidasDespacho {
    return {
      measures: [...draft.measures],
      comment: draft.comment,
      ...(draft.measureNames
        ? { measureNames: [...draft.measureNames] }
        : {}),
      ...(draft.updatedAt ? { updatedAt: draft.updatedAt } : {}),
      ...(draft.report ? { report: { ...draft.report } } : {}),
    };
  }

  private persistMeasuresDrafts(): void {
    try {
      localStorage.setItem(
        DISPATCH_DRAFT_STORAGE_KEY,
        JSON.stringify(Array.from(this.measureDrafts.entries())),
      );
    } catch {
      // El estado en memoria continúa disponible si el navegador bloquea storage.
    }
  }

  private restoreMeasuresDrafts(): void {
    try {
      const saved = localStorage.getItem(DISPATCH_DRAFT_STORAGE_KEY);
      if (!saved) return;

      const entries = JSON.parse(saved) as Array<
        [number, BorradorMedidasDespacho]
      >;
      this.measureDrafts = new Map(
        entries
          .filter(
            ([reportId, draft]) =>
              Number.isInteger(reportId) && Array.isArray(draft?.measures),
          )
          .map(([reportId, draft]) => [reportId, this.cloneDraft(draft)]),
      );
    } catch {
      localStorage.removeItem(DISPATCH_DRAFT_STORAGE_KEY);
    }
  }

  async validateReport(
    request: ValidarFichaDespachoRequest
  ): Promise<FichaDespachoResponse[]> {
    const response = await this.api.fetch(`${this.apiUrl}/validar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al validar ficha');
    }

    return response.json();
  }

  async getDispatchReports(
    reportId: number
  ): Promise<FichaDespachoResponse[]> {
    const response = await this.api.fetch(`${this.apiUrl}/ficha/${reportId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Error al obtener fichas de despacho'
      );
    }

    return response.json();
  }
}
