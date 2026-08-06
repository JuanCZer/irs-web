import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface CatSector {
  sectorCategoryId: number;
  sector: string;
}

export interface CatSubsector {
  subsectorCategoryId: number;
  subsector: string;
  sectorCategoryId?: number;
  status: number;
  sectorCategory?: CatSector;
}

export interface CatPrioridad {
  priorityCategoryId: number;
  priority: string;
}

export interface CatCondicion {
  conditionCategoryId: number;
  condition: string;
}

export interface CatInformacion {
  informationCategoryId: number;
  information: string;
}

export interface CatMunicipio {
  municipalityCategoryId: number;
  municipality: string;
  delegationId?: number;
}

export interface CatDelegacion {
  delegationCategoryId: number;
  delegation: string;
}

export interface CatMedidaSeguridad {
  measureCategoryId: number;
  measure: string;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  private readonly apiUrl = 'catalogos';

  constructor(private api: ApiService) {}

  async getSectors(): Promise<CatSector[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/sectores`);
      if (!response.ok) {
        throw new Error(`Error al get sectors: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getSubsectors(): Promise<CatSubsector[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/subsectores`);
      if (!response.ok) {
        throw new Error(`Error al get subsectors: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getSubsectorsBySector(sectorId: number): Promise<CatSubsector[]> {
    try {
      const response = await this.api.fetch(
        `${this.apiUrl}/subsectores/sector/${sectorId}`,
      );
      if (!response.ok) {
        throw new Error(`Error al get subsectors: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getPriorities(): Promise<CatPrioridad[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/prioridades`);
      if (!response.ok) {
        throw new Error(`Error al get priorities: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getConditions(): Promise<CatCondicion[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/condiciones`);
      if (!response.ok) {
        throw new Error(`Error al get conditions: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getInformationItems(): Promise<CatInformacion[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/informaciones`);
      if (!response.ok) {
        throw new Error(
          `Error al get informationItems: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getMunicipalities(): Promise<CatMunicipio[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/municipios`);
      if (!response.ok) {
        throw new Error(`Error al get municipalities: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getDelegations(): Promise<CatDelegacion[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/delegaciones`);
      if (!response.ok) {
        throw new Error(
          `Error al get delegations: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async getSecurityMeasures(): Promise<CatMedidaSeguridad[]> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/medidas-seguridad`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al get measures de seguridad: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  }
}
