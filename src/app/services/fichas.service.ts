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
      console.log('🌐 Fetching:', this.apiUrl);
      const response = await fetch(this.apiUrl);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener fichas:', error);
      throw error;
    }
  }

  async obtenerFichasPorEstado(estado: string): Promise<FichasTodosDTO[]> {
    try {
      console.log(
        '🔍 Obteniendo fichas concluidas desde /api/fichas/concluidas',
      );
      const response = await fetch(`${this.apiUrl}/concluidas`);

      if (!response.ok) {
        throw new Error('Error al obtener fichas concluidas');
      }

      const data = await response.json();
      console.log(`✅ Fichas concluidas obtenidas:`, data.length);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener fichas concluidas:', error);
      throw error;
    }
  }

  async obtenerFichaPorId(id: number): Promise<FichaInformativa> {
    try {
      console.log('🔍 Obteniendo ficha por ID:', id);
      const response = await fetch(`${this.apiUrl}/${id}`);
      if (!response.ok) {
        throw new Error('Error al cargar la ficha');
      }
      const data = await response.json();
      console.log('✅ Ficha obtenida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener ficha:', error);
      throw error;
    }
  }

  async crearFicha(ficha: FichaInformativa): Promise<FichaInformativa> {
    try {
      console.log('➕ Creando ficha:', ficha);
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
      console.log('✅ Ficha creada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al crear ficha:', error);
      throw error;
    }
  }

  async actualizarFicha(
    id: number,
    ficha: FichaInformativa,
  ): Promise<FichaInformativa> {
    try {
      console.log('✏️ Actualizando ficha ID:', id, ficha);
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
      console.log('✅ Ficha actualizada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar ficha:', error);
      throw error;
    }
  }

  async eliminarFicha(id: number): Promise<boolean> {
    try {
      console.log('🗑️ Eliminando ficha ID:', id);
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la ficha');
      }

      console.log('✅ Ficha eliminada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar ficha:', error);
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
      console.error('Error al buscar fichas:', error);
      throw error;
    }
  }

  async obtenerFichasPorRangoFechas(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<FichasTodosDTO[]> {
    try {
      console.log('📅 obtenerFichasPorRangoFechas - Parámetros recibidos:');
      console.log('   fechaInicio:', fechaInicio, 'tipo:', typeof fechaInicio);
      console.log('   fechaFin:', fechaFin, 'tipo:', typeof fechaFin);

      // Validar que las fechas no estén vacías
      if (!fechaInicio || !fechaFin) {
        console.error('❌ Error: fechaInicio o fechaFin están vacías');
        throw new Error('Las fechas son requeridas');
      }

      // Codificar las fechas para URL
      const fechaInicioEncoded = encodeURIComponent(fechaInicio);
      const fechaFinEncoded = encodeURIComponent(fechaFin);

      const url = `${this.apiUrl}/rango-fechas?fechaInicio=${fechaInicioEncoded}&fechaFin=${fechaFinEncoded}`;
      console.log('🌐 URL completa:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);

        // Intentar parsear el error como JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Error JSON:', errorJson);
          throw new Error(
            errorJson.mensaje || 'Error al obtener fichas por rango de fechas',
          );
        } catch {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Datos recibidos (rango fechas):', data);
      console.log('📊 Total fichas:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error en obtenerFichasPorRangoFechas:', error);
      throw error;
    }
  }

  async obtenerFichasDelDia(): Promise<FichasTodosDTO[]> {
    try {
      const url = `${this.apiUrl}/dia-actual`;
      console.log('🌐 Fetching fichas del día:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al obtener fichas del día');
      }

      const data = await response.json();
      console.log('📦 Datos recibidos (día actual):', data);
      return data;
    } catch (error) {
      console.error('Error al obtener fichas del día:', error);
      throw error;
    }
  }

  async obtenerBorradores(): Promise<FichasBorradorDTO[]> {
    try {
      const url = `${this.apiUrl}/borradores`;
      console.log('🌐 Fetching borradores:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al obtener borradores');
      }

      const data = await response.json();
      console.log('📦 Borradores recibidos:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener borradores:', error);
      throw error;
    }
  }

  async buscarBorradores(criterio: string): Promise<FichasBorradorDTO[]> {
    try {
      const url = `${
        this.apiUrl
      }/borradores/buscar?criterio=${encodeURIComponent(criterio)}`;
      console.log('🔍 Buscando borradores:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al buscar borradores');
      }

      const data = await response.json();
      console.log('📦 Resultados búsqueda:', data);
      return data;
    } catch (error) {
      console.error('Error al buscar borradores:', error);
      throw error;
    }
  }
}
