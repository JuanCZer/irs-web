import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FichasService, FichasTodosDTO } from '../../services/fichas.service';
import { DespachoService } from '../../services/despacho.service';
import {
  CatalogosService,
  CatMedidaSeguridad,
} from '../../services/catalogos.service';
import { AuthService } from '../../services/auth.service';
import {
  ModalMedidasComponent,
  AplicarMedidasEvent,
} from '../../components/modal-medidas/modal-medidas.component';
import {
  ModalValidarComponent,
  ValidarEvent,
} from '../../components/modal-validar/modal-validar.component';

interface FichaDespacho {
  idFicha: number;
  folio: string;
  fechaSuceso: string;
  delegacion: string;
  municipio: string;
  lugar: string;
  prioridad: string;
  sector: string;
  asunto: string;
}

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalMedidasComponent,
    ModalValidarComponent,
  ],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.less',
})
export class DespachoComponent implements OnInit {
  fichas: FichaDespacho[] = [];
  cargando = false;
  error = '';

  // Para los modales
  mostrarModalMedidas = false;
  mostrarModalValidar = false;
  mostrarModalVerFicha = false;
  fichaSeleccionada: FichaDespacho | null = null;
  fichaDetalleCompleta: FichasTodosDTO | null = null;

  medidasSeguridad: CatMedidaSeguridad[] = [];
  medidasSeleccionadasIds: number[] = [];
  comentarioTemporal = '';

  // Paginación
  paginaActual = 1;
  fichasPorPagina = 10;

  constructor(
    private fichasService: FichasService,
    private despachoService: DespachoService,
    private catalogosService: CatalogosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarFichas();
    this.cargarMedidasSeguridad();
  }

  async cargarMedidasSeguridad(): Promise<void> {
    try {
       this.medidasSeguridad =
        await this.catalogosService.obtenerMedidasSeguridad();
         `✅ ${this.medidasSeguridad.length} medidas de seguridad cargadas:`,
        this.medidasSeguridad
      );
    } catch (error) {
       this.error = 'Error al cargar las medidas de seguridad';
    }
  }

  async cargarFichas(): Promise<void> {
    try {
      this.cargando = true;
      this.error = '';
 
      // Obtener fichas con estado "Concluido" desde el backend
      const fichasDTO = await this.fichasService.obtenerFichasPorEstado(
        'Concluido'
      );

      // Mapear FichasTodosDTO a FichaDespacho
      this.fichas = fichasDTO.map((dto) => ({
        idFicha: dto.id,
        folio: dto.folio,
        fechaSuceso: dto.fechaSuceso,
        delegacion: dto.estado, // Estado contiene la delegación
        municipio: dto.municipio || 'N/A',
        lugar: dto.lugar || 'N/A',
        prioridad: dto.prioridad,
        sector: dto.sector,
        asunto: dto.asunto,
      }));
         `✅ ${this.fichas.length} fichas con estado "Concluido" cargadas`
      );
    } catch (error) {
       this.error =
        'Error al cargar las fichas. Verifique que el backend esté corriendo.';
    } finally {
      this.cargando = false;
    }
  }

  get fichasPaginadas(): FichaDespacho[] {
    const inicio = (this.paginaActual - 1) * this.fichasPorPagina;
    const fin = inicio + this.fichasPorPagina;
    return this.fichas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.fichas.length / this.fichasPorPagina);
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 3;
    let inicio = Math.max(
      1,
      this.paginaActual - Math.floor(maxPaginasVisibles / 2)
    );
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);

    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  abrirModalMedidas(ficha: FichaDespacho): void {
    this.fichaSeleccionada = ficha;
    this.medidasSeleccionadasIds = [];
    this.comentarioTemporal = '';
    this.mostrarModalMedidas = true;
  }

  abrirModalValidar(ficha: FichaDespacho): void {
    if (this.medidasSeleccionadasIds.length === 0) {
      alert(
        'Primero debe seleccionar las medidas de seguridad usando el botón "Medidas"'
      );
      return;
    }
    this.fichaSeleccionada = ficha;
    this.mostrarModalValidar = true;
  }

  async abrirModalVerFicha(ficha: FichaDespacho): Promise<void> {
    try {
      this.fichaSeleccionada = ficha;
      this.cargando = true;

      // Obtener los detalles completos de la ficha
      const fichasDetalle = await this.fichasService.obtenerFichasPorEstado(
        'Concluido'
      );
      this.fichaDetalleCompleta =
        fichasDetalle.find((f) => f.id === ficha.idFicha) || null;

      this.mostrarModalVerFicha = true;
    } catch (error) {
       alert('Error al cargar los detalles de la ficha');
    } finally {
      this.cargando = false;
    }
  }

  cerrarModal(): void {
    this.mostrarModalMedidas = false;
    this.mostrarModalValidar = false;
    this.mostrarModalVerFicha = false;
    this.fichaSeleccionada = null;
    this.fichaDetalleCompleta = null;
  }

  async onAplicarMedidas(event: AplicarMedidasEvent): Promise<void> {
    if (!this.fichaSeleccionada) return;

    this.medidasSeleccionadasIds = event.medidas;
    this.comentarioTemporal = event.comentario;
  
    alert(
      `Se han seleccionado ${event.medidas.length} medidas. Ahora use el botón "Validar" para subir la evidencia.`
    );

    this.cerrarModal();
  }

  async onValidarFicha(event: ValidarEvent): Promise<void> {
    if (!this.fichaSeleccionada) return;

    try {
 
      const usuario = this.authService.currentUserValue;

      await this.despachoService.validarFicha({
        idFicha: this.fichaSeleccionada.idFicha,
        idsMedidasSeguridad: this.medidasSeleccionadasIds,
        comentario: this.comentarioTemporal,
        evidencia: event.evidencias,
        idUsuario: usuario?.idUsuario,
      });

      alert('Ficha validada correctamente con evidencia');
      this.cerrarModal();

      // Limpiar datos temporales
      this.medidasSeleccionadasIds = [];
      this.comentarioTemporal = '';
    } catch (error) {
       alert('Error al validar la ficha. Intente nuevamente.');
    }
  }

  getPrioridadClass(prioridad: string): string {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
        return 'prioridad-alta';
      case 'media':
        return 'prioridad-media';
      case 'baja':
        return 'prioridad-baja';
      default:
        return '';
    }
  }
}
