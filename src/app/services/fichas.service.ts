import { Injectable } from '@angular/core';

// DTO para listar fichas en tabla (11 campos)
export interface FichasTodosDTO {
  id: number;
  fechaElaboracion: string;
  folio: string;
  fechaSuceso: string;
  horaSuceso: string;
  estado: string;
  municipio: string;
  lugar: string;
  asunto: string;
  prioridad: string;
  sector: string;
  asistentes: number;
  estadoActual: string;
  latitud?: string;
  longitud?: string;
}

// DTO para borradores (10 campos)
export interface FichasBorradorDTO {
  id: number;
  fechaElaboracion: string;
  fechaSuceso: string;
  horaSuceso: string;
  estado: string;
  prioridad: string;
  sector: string;
  asistentes: number;
  estadoActual: string;
  borradorUsuario: string;
}

// Modelo completo FichaInformativa (31 campos) - para CRUD
export interface FichaInformativa {
  id: number;
  cedula?: number;
  delegacion?: string;
  municipio?: string;
  lugar?: string;
  latitud?: string;
  longitud?: string;
  horaSucesoInicio?: string;
  horaSucesoFin?: string;
  fechaSuceso?: string;
  sector?: string;
  subsector?: string;
  numAsistentes?: number;
  fechaElaboracion?: string;
  horaElaboracion?: string;
  prioridad?: string;
  condicion?: string;
  informacion?: string;
  asunto?: string;
  hechos?: string;
  acuerdos?: string;
  idInformo?: number;
  idUsuario?: number;
  idAutorizo?: number;
  fechaRecepcion?: string;
  horaRecepcion?: string;
  idEstadoActual?: number;
  motivoCancelacion?: string;
  activo?: number;
  folioInterno?: string;
  direccion?: string;
  visto?: number;
  idFichaAnterior?: number;
  fechaValidacion?: string;
}

// DTO para crear/actualizar (envío al backend)
export interface FichaInformativaDTO {
  cedula?: number;
  delegacion: string;
  municipio: string;
  lugar: string;
  latitud?: string;
  longitud?: string;
  direccion: string;
  sector: string;
  subsector: string;
  horaSucesoInicio: string;
  horaSucesoFin: string;
  fechaSuceso: string;
  numAsistentes?: number;
  fechaElaboracion: string;
  horaElaboracion: string;
  prioridad: string;
  condicion: string;
  informacion: string;
  asunto: string;
  hechos: string;
  acuerdos: string;
  idInformo?: number;
  idUsuario?: number;
  idAutorizo?: number;
  fechaRecepcion: string;
  horaRecepcion: string;
  idEstadoActual?: number;
  motivoCancelacion?: string;
  activo: number;
  folioInterno?: string;
  visto: number;
  idFichaAnterior?: number;
  fechaValidacion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FichasService {
  private apiUrl = 'https://localhost:5001/api/fichas';

  constructor() {}

  async obtenerTodasLasFichas(): Promise<FichasTodosDTO[]> {
    try {
       const response = await fetch(this.apiUrl);
 
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
       return data;
    } catch (error) {
       throw error;
    }
  }

  async obtenerFichasPorEstado(estado: string): Promise<FichasTodosDTO[]> {
    try {
         '🔍 Obteniendo fichas concluidas desde /api/fichas/concluidas',
      );
      const response = await fetch(`${this.apiUrl}/concluidas`);

      if (!response.ok) {
        throw new Error('Error al obtener fichas concluidas');
      }

      const data = await response.json();
       return data;
    } catch (error) {
       throw error;
    }
  }

  async obtenerFichaPorId(id: number): Promise<FichaInformativa> {
    try {
       const response = await fetch(`${this.apiUrl}/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar la ficha');
      }
      const data = await response.json();
       return data;
    } catch (error) {
       throw error;
    }
  }

  async crearFicha(ficha: FichaInformativa): Promise<FichaInformativa> {
    try {
       const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ficha),
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

  async actualizarFicha(
    id: number,
    ficha: FichaInformativa,
  ): Promise<FichaInformativa> {
    try {
       const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ficha),
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

  async eliminarFicha(id: number): Promise<boolean> {
    try {
       const response = await fetch(`${this.apiUrl}/${id}`, {
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

  async buscarFichas(criterio: string): Promise<FichasTodosDTO[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/buscar?criterio=${encodeURIComponent(criterio)}`,
      );
      if (!response.ok) {
        throw new Error('Error al buscar fichas');
      }
      return await response.json();
    } catch (error) {
       throw error;
    }
  }

  async obtenerFichasPorRangoFechas(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<FichasTodosDTO[]> {
    try {
   
      // Validar que las fechas no estén vacías
      if (!fechaInicio || !fechaFin) {
         throw new Error('Las fechas son requeridas');
      }

      // Codificar las fechas para URL
      const fechaInicioEncoded = encodeURIComponent(fechaInicio);
      const fechaFinEncoded = encodeURIComponent(fechaFin);

      const url = `${this.apiUrl}/rango-fechas?fechaInicio=${fechaInicioEncoded}&fechaFin=${fechaFinEncoded}`;
 
      const response = await fetch(url);
 
      if (!response.ok) {
        const errorText = await response.text();
 
        // Intentar parsear el error como JSON
        try {
          const errorJson = JSON.parse(errorText);
           throw new Error(
            errorJson.mensaje || 'Error al obtener fichas por rango de fechas',
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

  async obtenerFichasDelDia(): Promise<FichasTodosDTO[]> {
    try {
      const url = `${this.apiUrl}/dia-actual`;
 
      const response = await fetch(url);
 
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

  async obtenerBorradores(): Promise<FichasBorradorDTO[]> {
    try {
      const url = `${this.apiUrl}/borradores`;
 
      const response = await fetch(url);
 
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

  async buscarBorradores(criterio: string): Promise<FichasBorradorDTO[]> {
    try {
      const url = `${
        this.apiUrl
      }/borradores/buscar?criterio=${encodeURIComponent(criterio)}`;
 
      const response = await fetch(url);
 
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
