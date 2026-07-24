import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface AuditoriaEvento {
  idAuditoria: number;
  idUsuario?: number;
  usuario: string;
  nombreCompleto?: string;
  rol?: string;
  accion: string;
  modulo: string;
  descripcion: string;
  metodoHttp?: string;
  ruta?: string;
  entidad?: string;
  idEntidad?: string;
  direccionIp?: string;
  codigoEstado: number;
  exitoso: boolean;
  fechaHora: string;
  detalles?: string;
}

export interface AuditoriaResumen {
  totalEventos: number;
  eventosExitosos: number;
  eventosConError: number;
  usuariosDistintos: number;
}

export interface AuditoriaPagina {
  elementos: AuditoriaEvento[];
  resumen: AuditoriaResumen;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}

export interface AuditoriaFiltros {
  busqueda?: string;
  idUsuario?: number;
  modulo?: string;
  accion?: string;
  exitoso?: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  pagina: number;
  tamanoPagina: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private readonly apiUrl = 'https://localhost:5001/api/auditoria';

  constructor(private api: ApiService) {}

  async consultar(filtros: AuditoriaFiltros): Promise<AuditoriaPagina> {
    const parametros = new URLSearchParams();
    parametros.set('pagina', filtros.pagina.toString());
    parametros.set('tamanoPagina', filtros.tamanoPagina.toString());

    if (filtros.busqueda) parametros.set('busqueda', filtros.busqueda.trim());
    if (filtros.idUsuario)
      parametros.set('idUsuario', filtros.idUsuario.toString());
    if (filtros.modulo) parametros.set('modulo', filtros.modulo);
    if (filtros.accion) parametros.set('accion', filtros.accion);
    if (filtros.exitoso !== undefined)
      parametros.set('exitoso', filtros.exitoso.toString());
    if (filtros.fechaInicio)
      parametros.set(
        'fechaInicio',
        this.convertirInicioDelDiaLocalAISO(filtros.fechaInicio),
      );
    if (filtros.fechaFin)
      parametros.set(
        'fechaFin',
        this.convertirInicioDelDiaLocalAISO(filtros.fechaFin),
      );

    const response = await this.api.fetch(`${this.apiUrl}?${parametros}`);
    if (!response.ok) {
      if (response.status === 403)
        throw new Error('Solo los administradores pueden consultar la bitácora.');
      if (response.status === 401)
        throw new Error('La sesión expiró. Inicia sesión nuevamente.');
      throw new Error('No fue posible consultar la bitácora de actividad.');
    }

    return response.json();
  }

  async registrarNavegacion(ruta: string): Promise<void> {
    try {
      await this.api.fetch(`${this.apiUrl}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruta }),
      });
    } catch {
      // Un fallo de auditoría no debe impedir la navegación del usuario.
    }
  }

  private convertirInicioDelDiaLocalAISO(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia).toISOString();
  }
}
