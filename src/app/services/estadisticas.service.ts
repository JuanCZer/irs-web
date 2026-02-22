import { Injectable } from '@angular/core';

export interface EstadisticasResumen {
  totalFichas: number;
  fichasHoy: number;
  fichasSemana: number;
  fichasMes: number;
  promedioMensual: number;
  crecimientoMensual: number;
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
  resumen: EstadisticasResumen;
  fichasPorEstado: FichasPorEstado;
  fichasPorMes: FichasPorMes;
  tendenciaMensual: TendenciaMensual;
}

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private apiUrl = 'https://localhost:5001/api/fichas/estadisticas';

  constructor() {}

  async obtenerEstadisticas(): Promise<FichasEstadisticas> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {}
        const mensaje =
          errorData.mensaje ||
          errorData.error ||
          `Error HTTP: ${response.status}`;
        throw new Error(mensaje);
      }

      const estadisticas = await response.json();
      return estadisticas;
    } catch (error) {
      throw error;
    }
  }
}
