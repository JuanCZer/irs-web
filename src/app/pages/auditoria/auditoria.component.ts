import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import {
  AuditoriaEvento,
  AuditoriaFiltros,
  AuditoriaPagina,
  AuditoriaService,
} from '../../services/auditoria.service';
import { UsuarioDTO, UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.less',
})
export class AuditoriaComponent implements OnInit {
  eventos: AuditoriaEvento[] = [];
  usuarios: UsuarioDTO[] = [];
  cargando = false;
  error = '';

  readonly modulos = [
    'AUTENTICACION',
    'SEGURIDAD',
    'USUARIOS',
    'FICHAS',
    'DESPACHO',
    'ESTADISTICAS',
    'CATALOGOS',
    'AUDITORIA',
    'NAVEGACION',
    'SISTEMA',
  ];

  readonly acciones = [
    'INICIAR_SESION',
    'CERRAR_SESION',
    'CAMBIAR_CONTRASENA',
    'CREAR_USUARIO',
    'ACTUALIZAR_USUARIO',
    'DESACTIVAR_USUARIO',
    'CONSULTAR_USUARIOS',
    'CREAR_FICHA',
    'ACTUALIZAR_FICHA',
    'ELIMINAR_FICHA',
    'CONSULTAR_FICHAS',
    'REALIZAR_DESPACHO',
    'CONSULTAR_DESPACHO',
    'CONSULTAR_ESTADISTICAS',
    'ABRIR_PANTALLA',
  ];

  filtros: AuditoriaFiltros = this.crearFiltrosIniciales();

  resumen: AuditoriaPagina['resumen'] = {
    totalEventos: 0,
    eventosExitosos: 0,
    eventosConError: 0,
    usuariosDistintos: 0,
  };

  constructor(
    private auditoriaService: AuditoriaService,
    private usuariosService: UsuariosService,
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargarUsuarios(), this.cargarEventos()]);
  }

  async cargarEventos(): Promise<void> {
    this.asegurarFechaPorDefecto();
    this.cargando = true;
    this.error = '';

    try {
      const pagina = await this.auditoriaService.consultar(this.filtros);
      this.eventos = pagina.elementos;
      this.resumen = pagina.resumen;
      this.filtros.pagina = pagina.pagina;
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No fue posible consultar la bitácora.';
      this.eventos = [];
    } finally {
      this.cargando = false;
    }
  }

  aplicarFiltros(): void {
    this.filtros.pagina = 1;
    void this.cargarEventos();
  }

  limpiarFiltros(): void {
    this.filtros = this.crearFiltrosIniciales();
    void this.cargarEventos();
  }

  cambiarPagina(pagina: number): void {
    this.filtros.pagina = pagina;
    void this.cargarEventos();
  }

  cambiarResultado(valor: string): void {
    this.filtros.exitoso =
      valor === '' ? undefined : valor === 'true';
  }

  formatearCodigo(codigo: string): string {
    return codigo
      .toLowerCase()
      .split('_')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  trackByEvento(_: number, evento: AuditoriaEvento): number {
    return evento.idAuditoria;
  }

  private crearFiltrosIniciales(): AuditoriaFiltros {
    const hoy = this.obtenerFechaLocalActual();

    return {
      fechaInicio: hoy,
      fechaFin: hoy,
      pagina: 1,
      tamanoPagina: 25,
    };
  }

  private asegurarFechaPorDefecto(): void {
    if (this.filtros.fechaInicio || this.filtros.fechaFin) return;

    const hoy = this.obtenerFechaLocalActual();
    this.filtros.fechaInicio = hoy;
    this.filtros.fechaFin = hoy;
  }

  private obtenerFechaLocalActual(): string {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private async cargarUsuarios(): Promise<void> {
    try {
      this.usuarios = await this.usuariosService.obtenerTodosLosUsuarios();
    } catch {
      this.usuarios = [];
    }
  }
}
