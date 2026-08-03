import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

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
}

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  private apiUrl = 'https://localhost:5001/api/despacho';
  private measureDrafts = new Map<number, BorradorMedidasDespacho>();

  constructor(private api: ApiService) {}

  saveMeasuresDraft(
    reportId: number,
    draft: BorradorMedidasDespacho
  ): void {
    this.measureDrafts.set(reportId, {
      measures: [...draft.measures],
      comment: draft.comment,
    });
  }

  getMeasuresDraft(
    reportId: number
  ): BorradorMedidasDespacho | undefined {
    const draft = this.measureDrafts.get(reportId);

    return draft
      ? {
          measures: [...draft.measures],
          comment: draft.comment,
        }
      : undefined;
  }

  deleteMeasuresDraft(reportId: number): void {
    this.measureDrafts.delete(reportId);
  }

  async validateReport(
    request: ValidarFichaDespachoRequest
  ): Promise<FichaDespachoResponse[]> {
    const response = await this.api.fetch(`${this.apiUrl}/validate`, {
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
    const response = await this.api.fetch(`${this.apiUrl}/report/${reportId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Error al obtener fichas de despacho'
      );
    }

    return response.json();
  }
}
