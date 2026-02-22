import { Injectable } from '@angular/core';

export interface CatSector {
  idCatSector: number;
  sector: string;
}

export interface CatSubsector {
  idCatSubsector: number;
  subsector: string;
  idCatSector?: number;
  estatus: number;
  catSector?: CatSector;
}

export interface CatPrioridad {
  idCatPrioridad: number;
  prioridad: string;
}

export interface CatCondicion {
  idCatCondicion: number;
  condicion: string;
}

export interface CatInformacion {
  idCatInformacion: number;
  informacion: string;
}

export interface CatMunicipio {
  idCatMunicipio: number;
  municipio: string;
  idDelegacion?: number;
}

export interface CatDelegacion {
  idCatDelegacion: number;
  delegacion: string;
}

export interface CatMedidaSeguridad {
  idCatMedida: number;
  medida: string;
  estatus: number;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  private apiUrl = 'https://localhost:5001/api/catalogos';

  constructor() {}

  async obtenerSectores(): Promise<CatSector[]> {
    try {
      const response = await fetch(`${this.apiUrl}/sectores`);
      if (!response.ok) {
        throw new Error(`Error al obtener sectores: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerSubsectores(): Promise<CatSubsector[]> {
    try {
      const response = await fetch(`${this.apiUrl}/subsectores`);
      if (!response.ok) {
        throw new Error(`Error al obtener subsectores: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerSubsectoresPorSector(idSector: number): Promise<CatSubsector[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/subsectores/sector/${idSector}`,
      );
      if (!response.ok) {
        throw new Error(`Error al obtener subsectores: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerPrioridades(): Promise<CatPrioridad[]> {
    try {
      const response = await fetch(`${this.apiUrl}/prioridades`);
      if (!response.ok) {
        throw new Error(`Error al obtener prioridades: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerCondiciones(): Promise<CatCondicion[]> {
    try {
      const response = await fetch(`${this.apiUrl}/condiciones`);
      if (!response.ok) {
        throw new Error(`Error al obtener condiciones: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerInformaciones(): Promise<CatInformacion[]> {
    try {
      const response = await fetch(`${this.apiUrl}/informaciones`);
      if (!response.ok) {
        throw new Error(
          `Error al obtener informaciones: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerMunicipios(): Promise<CatMunicipio[]> {
    try {
      const response = await fetch(`${this.apiUrl}/municipios`);
      if (!response.ok) {
        throw new Error(`Error al obtener municipios: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerDelegaciones(): Promise<CatDelegacion[]> {
    try {
      const response = await fetch(`${this.apiUrl}/delegaciones`);
      if (!response.ok) {
        throw new Error(
          `Error al obtener delegaciones: ${response.statusText}`,
        );
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  async obtenerMedidasSeguridad(): Promise<CatMedidaSeguridad[]> {
    try {
      const response = await fetch(`${this.apiUrl}/medidas-seguridad`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al obtener medidas de seguridad: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  }
}
