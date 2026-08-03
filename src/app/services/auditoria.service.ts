import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface AuditoriaEvento {
  auditId: number;
  userId?: number;
  user: string;
  fullName?: string;
  role?: string;
  action: string;
  module: string;
  description: string;
  httpMethod?: string;
  path?: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  statusCode: number;
  successful: boolean;
  dateTime: string;
  details?: string;
}

export interface AuditoriaResumen {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  distinctUsers: number;
}

export interface AuditoriaPagina {
  items: AuditoriaEvento[];
  summary: AuditoriaResumen;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditoriaFiltros {
  search?: string;
  userId?: number;
  module?: string;
  action?: string;
  successful?: boolean;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private readonly apiUrl = 'https://localhost:5001/api/auditoria';

  constructor(private api: ApiService) {}

  async query(filters: AuditoriaFiltros): Promise<AuditoriaPagina> {
    const parameters = new URLSearchParams();
    parameters.set('page', filters.page.toString());
    parameters.set('pageSize', filters.pageSize.toString());

    if (filters.search) parameters.set('search', filters.search.trim());
    if (filters.userId)
      parameters.set('userId', filters.userId.toString());
    if (filters.module) parameters.set('module', filters.module);
    if (filters.action) parameters.set('action', filters.action);
    if (filters.successful !== undefined)
      parameters.set('successful', filters.successful.toString());
    if (filters.startDate)
      parameters.set(
        'startDate',
        this.convertLocalStartOfDayToIso(filters.startDate),
      );
    if (filters.endDate)
      parameters.set(
        'endDate',
        this.convertLocalStartOfDayToIso(filters.endDate),
      );

    const response = await this.api.fetch(`${this.apiUrl}?${parameters}`);
    if (!response.ok) {
      if (response.status === 403)
        throw new Error('Solo los administradores pueden consultar la bitácora.');
      if (response.status === 401)
        throw new Error('La sesión expiró. Inicia sesión nuevamente.');
      throw new Error('No fue posible consultar la bitácora de actividad.');
    }

    return response.json();
  }

  async logNavigation(path: string): Promise<void> {
    try {
      await this.api.fetch(`${this.apiUrl}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
    } catch {

    }
  }

  private convertLocalStartOfDayToIso(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toISOString();
  }
}
