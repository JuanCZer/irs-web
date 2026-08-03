import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import {
  BorradorMedidasDespacho,
  DespachoService,
} from './despacho.service';

export const DRONE_SECURITY_MEASURE =
  'Monitoreo Policial: Despliegue de Dron';

export interface DroneRoutePoint {
  latitude: number;
  longitude: number;
  timestamp?: string;
  altitudeMeters?: number;
}

export interface DroneLinkedReport {
  dispatchReportId: number;
  reportId: number;
  referenceNumber: string;
  eventDate?: string | null;
  validationDate: string;
  delegation: string;
  municipality: string;
  place: string;
  latitude?: number | null;
  longitude?: number | null;
  subject: string;
  comment: string;
  securityMeasure: string;
  pendingValidation?: boolean;
}

export interface DroneFlight {
  id: string;
  externalFlightId?: string;
  startedAt: string;
  endedAt?: string | null;
  durationMinutes?: number | null;
  distanceKilometers?: number | null;
  maximumAltitudeMeters?: number | null;
  purpose: string;
  status: 'completed' | 'in-progress' | 'pending-sync' | 'selected';
  route: DroneRoutePoint[];
  report: DroneLinkedReport;
}

export interface DroneRecord {
  id: string;
  externalId?: string;
  name: string;
  model: string;
  status: 'available' | 'in-flight' | 'offline' | 'pending-sync' | 'selected';
  lastActivity?: string | null;
  linkedReport: DroneLinkedReport;
  flights: DroneFlight[];
}

@Injectable({ providedIn: 'root' })
export class DronesService {
  private readonly apiUrl = 'https://localhost:5001/api/despacho/drones';

  constructor(
    private api: ApiService,
    private dispatchService: DespachoService,
  ) {}

  /**
   * Obtiene solamente fichas cuya medida sea
   * "Monitoreo Policial: Despliegue de Dron".
   * Cuando se defina la API de Skydio, este método será el punto de unión entre
   * esas fichas y el inventario/telemetría real de la aeronave.
   */
  async getDroneDashboard(): Promise<DroneRecord[]> {
    const response = await this.api.fetch(`${this.apiUrl}/fichas`);

    if (!response.ok) {
      let message = 'No fue posible cargar la operación de drones';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch {
        // La respuesta puede no contener JSON.
      }
      throw new Error(message);
    }

    const reports: DroneLinkedReport[] = await response.json();
    const validatedDrones = reports
      .filter(
        (report) =>
          report.securityMeasure?.trim().toLocaleLowerCase() ===
          DRONE_SECURITY_MEASURE.toLocaleLowerCase(),
      )
      .map((report) =>
        this.toPendingDrone(report, report.pendingValidation === true),
      );

    const validatedReportIds = new Set(
      validatedDrones.map((drone) => drone.linkedReport.reportId),
    );
    const selectedDraftDrones = this.dispatchService
      .getAllMeasuresDrafts()
      .filter(
        ({ reportId, draft }) =>
          !validatedReportIds.has(reportId) &&
          draft.measureNames?.some(
            (measure) =>
              measure.trim().toLocaleLowerCase() ===
              DRONE_SECURITY_MEASURE.toLocaleLowerCase(),
          ),
      )
      .map(({ reportId, draft }) => this.toDraftDrone(reportId, draft));

    return [...validatedDrones, ...selectedDraftDrones].sort(
      (left, right) =>
        new Date(right.lastActivity || 0).getTime() -
        new Date(left.lastActivity || 0).getTime(),
    );
  }

  private toDraftDrone(
    reportId: number,
    draft: BorradorMedidasDespacho,
  ): DroneRecord {
    const report = draft.report;
    return this.toPendingDrone({
      dispatchReportId: -Math.abs(reportId),
      reportId,
      referenceNumber: report?.referenceNumber ?? `F-${reportId}`,
      eventDate: report?.eventDate ?? null,
      validationDate: draft.updatedAt ?? new Date().toISOString(),
      delegation: report?.delegation ?? '',
      municipality: report?.municipality ?? '',
      place: report?.place ?? '',
      subject: report?.subject ?? 'Despliegue de dron seleccionado',
      comment: draft.comment,
      securityMeasure: DRONE_SECURITY_MEASURE,
    }, true);
  }

  private toPendingDrone(
    report: DroneLinkedReport,
    selectionOnly = false,
  ): DroneRecord {
    const flight: DroneFlight = {
      id: `pending-${report.dispatchReportId}`,
      startedAt: report.validationDate,
      endedAt: null,
      durationMinutes: null,
      distanceKilometers: null,
      maximumAltitudeMeters: null,
      purpose: report.subject || 'Atención de ficha',
      status: selectionOnly ? 'selected' : 'pending-sync',
      route: [],
      report,
    };

    return {
      id: `unassigned-${report.dispatchReportId}`,
      name: selectionOnly ? 'Dron pendiente de asignar' : 'Dron por sincronizar',
      model: selectionOnly
        ? 'Medida seleccionada en Despacho'
        : 'Skydio · pendiente de conexión',
      status: selectionOnly ? 'selected' : 'pending-sync',
      lastActivity: report.validationDate,
      linkedReport: report,
      flights: [flight],
    };
  }
}
