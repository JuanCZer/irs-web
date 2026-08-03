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
  events: AuditoriaEvento[] = [];
  users: UsuarioDTO[] = [];
  loading = false;
  error = '';

  readonly modules = [
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

  readonly actions = [
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

  filters: AuditoriaFiltros = this.createInitialFilters();

  summary: AuditoriaPagina['summary'] = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    distinctUsers: 0,
  };

  constructor(
    private auditService: AuditoriaService,
    private usersService: UsuariosService,
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadUsers(), this.loadEvents()]);
  }

  async loadEvents(): Promise<void> {
    this.ensureDefaultDate();
    this.loading = true;
    this.error = '';

    try {
      const page = await this.auditService.query(this.filters);
      this.events = page.items;
      this.summary = page.summary;
      this.filters.page = page.page;
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'No fue posible consultar la bitácora.';
      this.events = [];
    } finally {
      this.loading = false;
    }
  }

  applyFilters(): void {
    this.filters.page = 1;
    void this.loadEvents();
  }

  clearFilters(): void {
    this.filters = this.createInitialFilters();
    void this.loadEvents();
  }

  changePage(page: number): void {
    this.filters.page = page;
    void this.loadEvents();
  }

  changeResult(value: string): void {
    this.filters.successful =
      value === '' ? undefined : value === 'true';
  }

  formatCode(code: string): string {
    return code
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  trackByEvent(_: number, event: AuditoriaEvento): number {
    return event.auditId;
  }

  private createInitialFilters(): AuditoriaFiltros {
    const today = this.getCurrentLocalDate();

    return {
      startDate: today,
      endDate: today,
      page: 1,
      pageSize: 25,
    };
  }

  private ensureDefaultDate(): void {
    if (this.filters.startDate || this.filters.endDate) return;

    const today = this.getCurrentLocalDate();
    this.filters.startDate = today;
    this.filters.endDate = today;
  }

  private getCurrentLocalDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async loadUsers(): Promise<void> {
    try {
      this.users = await this.usersService.getAllUsers();
    } catch {
      this.users = [];
    }
  }
}
