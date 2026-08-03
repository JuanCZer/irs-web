import { Injectable } from '@angular/core';
import { ApiService } from './api.service';


export interface FichasTodosDTO {
  id: number;
  creationDate: string;
  referenceNumber: string;
  eventDate: string;
  eventTime: string;
  state: string;
  municipality: string;
  place: string;
  subject: string;
  priority: string;
  sector: string;
  attendees: number;
  currentStatus: string;
  latitude?: string;
  longitude?: string;
}


export interface FichasBorradorDTO {
  id: number;
  creationDate: string;
  eventDate: string;
  eventTime: string;
  state: string;
  priority: string;
  sector: string;
  attendees: number;
  currentStatus: string;
  draftUser: string;
}


export interface FichaInformativa {
  id: number;
  certificateNumber?: number;
  delegation?: string;
  municipality?: string;
  place?: string;
  latitude?: string;
  longitude?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventDate?: string;
  sector?: string;
  subsector?: string;
  attendeeCount?: number;
  creationDate?: string;
  creationTime?: string;
  priority?: string;
  condition?: string;
  information?: string;
  subject?: string;
  facts?: string;
  agreements?: string;
  reporterId?: number;
  userId?: number;
  authorizerId?: number;
  receptionDate?: string;
  receptionTime?: string;
  currentStatusId?: number;
  cancellationReason?: string;
  active?: number;
  internalReference?: string;
  address?: string;
  seen?: number;
  previousReportId?: number;
  validationDate?: string;
}


export interface FichaInformativaDTO {
  certificateNumber?: number;
  delegation: string;
  municipality: string;
  place: string;
  latitude?: string;
  longitude?: string;
  address: string;
  sector: string;
  subsector: string;
  eventStartTime: string;
  eventEndTime: string;
  eventDate: string;
  attendeeCount?: number;
  creationDate: string;
  creationTime: string;
  priority: string;
  condition: string;
  information: string;
  subject: string;
  facts: string;
  agreements: string;
  reporterId?: number;
  userId?: number;
  authorizerId?: number;
  receptionDate: string;
  receptionTime: string;
  currentStatusId?: number;
  cancellationReason?: string;
  active: number;
  internalReference?: string;
  seen: number;
  previousReportId?: number;
  validationDate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FichasService {
  private apiUrl = 'https://localhost:5001/api/fichas';

  constructor(private api: ApiService) {}

  async getAllReports(): Promise<FichasTodosDTO[]> {
    try {
      const response = await this.api.fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getReportsByStatus(state: string): Promise<FichasTodosDTO[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/concluidas`);

      if (!response.ok) {
        throw new Error('Error al obtener fichas concluidas');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getReportById(id: number): Promise<FichaInformativa> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar la ficha');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async createReport(report: FichaInformativa): Promise<FichaInformativa> {
    try {
      const response = await this.api.fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error('Error al crear la ficha');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateReport(
    id: number,
    report: FichaInformativa,
  ): Promise<FichaInformativa> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la ficha');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteReport(id: number): Promise<boolean> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la ficha');
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  async searchReports(criteria: string): Promise<FichasTodosDTO[]> {
    try {
      const response = await this.api.fetch(
        `${this.apiUrl}/search?criteria=${encodeURIComponent(criteria)}`,
      );
      if (!response.ok) {
        throw new Error('Error al buscar fichas');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getReportsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<FichasTodosDTO[]> {
    try {


      if (!startDate || !endDate) {
        throw new Error('Las fechas son requeridas');
      }


      const encodedStartDate = encodeURIComponent(startDate);
      const encodedEndDate = encodeURIComponent(endDate);

      const url = `${this.apiUrl}/rango-fechas?startDate=${encodedStartDate}&endDate=${encodedEndDate}`;

      const response = await this.api.fetch(url);

      if (!response.ok) {
        const errorText = await response.text();


        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            errorJson.message || 'Error al obtener fichas por rango de fechas',
          );
        } catch {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getReportsForToday(): Promise<FichasTodosDTO[]> {
    try {
      const url = `${this.apiUrl}/day-actual`;

      const response = await this.api.fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Error al obtener fichas del día');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getDrafts(): Promise<FichasBorradorDTO[]> {
    try {
      const url = `${this.apiUrl}/drafts`;

      const response = await this.api.fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Error al obtener borradores');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async searchDrafts(criteria: string): Promise<FichasBorradorDTO[]> {
    try {
      const url = `${
        this.apiUrl
      }/drafts/search?criteria=${encodeURIComponent(criteria)}`;

      const response = await this.api.fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Error al buscar borradores');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
