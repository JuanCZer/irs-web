import { Injectable } from '@angular/core';

export interface ValidarFichaDespachoRequest {
  idFicha: number;
  idsMedidasSeguridad: number[];
  comentario: string;
  evidencia?: string;
  idUsuario?: number;
}

export interface FichaDespachoResponse {
  idFichaDespacho: number;
  idFicha: number;
  idCatMedida: number;
  medidaSeguridad: string;
  comentario: string;
  evidencia?: string;
  fechaValidacion: string;
  idUsuario?: number;
  nombreUsuario?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DespachoService {
  private apiUrl = 'http://localhost:5000/api/despacho';

  async validarFicha(
    request: ValidarFichaDespachoRequest
  ): Promise<FichaDespachoResponse[]> {
    const response = await fetch(`${this.apiUrl}/validar`, {
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

  async obtenerFichasDespacho(
    idFicha: number
  ): Promise<FichaDespachoResponse[]> {
    const response = await fetch(`${this.apiUrl}/ficha/${idFicha}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || 'Error al obtener fichas de despacho'
      );
    }

    return response.json();
  }
}
