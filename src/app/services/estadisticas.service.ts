import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface EstadisticasResumen {
  totalReports: number;
  reportsToday: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  monthlyAverage: number;
  monthlyGrowth: number;
}

export interface FichasPorEstado {
  labels: string[];
  data: number[];
}

export interface FichasPorMes {
  labels: string[];
  data: number[];
}

export interface DatasetEstadistica {
  label: string;
  data: number[];
}

export interface TendenciaMensual {
  labels: string[];
  datasets: DatasetEstadistica[];
}

export interface FichasEstadisticas {
  summary: EstadisticasResumen;
  reportsByState: FichasPorEstado;
  reportsByMonth: FichasPorMes;
  monthlyTrend: TendenciaMensual;
}

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private apiUrl = 'https://localhost:5001/api/fichas/estadisticas';

  constructor(private api: ApiService) {}

  async getStatistics(): Promise<FichasEstadisticas> {
    try {
      const response = await this.api.fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {}
        const message =
          errorData.message ||
          errorData.error ||
          `Error HTTP: ${response.status}`;
        throw new Error(message);
      }

      const statistics = await response.json();
      return statistics;
    } catch (error) {
      throw error;
    }
  }
}
