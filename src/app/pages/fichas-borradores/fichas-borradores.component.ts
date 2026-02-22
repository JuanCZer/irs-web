import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  FichasService,
  FichasBorradorDTO,
  FichaInformativa,
} from '../../services/fichas.service';
import { ModalFichasConsultaComponent } from '../../components/modal-fichas-consulta/modal-fichas-consulta.component';

@Component({
  selector: 'app-fichas-borradores',
  imports: [CommonModule, FormsModule, ModalFichasConsultaComponent],
  templateUrl: './fichas-borradores.component.html',
  styleUrl: './fichas-borradores.component.less',
})
export class FichasBorradoresComponent implements OnInit {
  borradores: FichasBorradorDTO[] = [];
  borradoresFiltrados: FichasBorradorDTO[] = [];
  cargando: boolean = false;
  error: string = '';

  // Modal
  mostrarModal: boolean = false;
  fichaSeleccionada: FichaInformativa | null = null;
  cargandoFicha: boolean = false;

  // Búsqueda
  buscarTexto: string = '';

  // Paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  totalPaginas: number = 0;

  // Para usar Math en el template
  Math = Math;

  constructor(
    private fichasService: FichasService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarBorradores();
  }

  async cargarBorradores(): Promise<void> {
    this.cargando = true;
    this.error = '';

    try {
      this.borradores = await this.fichasService.obtenerBorradores();
      this.borradoresFiltrados = [...this.borradores];
      this.calcularPaginacion();
      this.cdr.detectChanges();
    } catch (error) {
      this.error =
        'No se pudieron cargar los borradores. Verifica que el backend esté corriendo.';
    } finally {
      this.cargando = false;
    }
  }

  async buscar(): Promise<void> {
    if (!this.buscarTexto.trim()) {
      this.borradoresFiltrados = [...this.borradores];
      this.paginaActual = 1;
      this.calcularPaginacion();
      return;
    }

    this.cargando = true;
    try {
      this.borradoresFiltrados = await this.fichasService.buscarBorradores(
        this.buscarTexto
      );
      this.paginaActual = 1;
      this.calcularPaginacion();
    } catch (error) {
      this.error = 'Error al realizar la búsqueda';
    } finally {
      this.cargando = false;
    }
  }

  limpiarBusqueda(): void {
    this.buscarTexto = '';
    this.borradoresFiltrados = [...this.borradores];
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(
      this.borradoresFiltrados.length / this.registrosPorPagina
    );
  }

  get borradoresPaginados(): FichasBorradorDTO[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.borradoresFiltrados.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  abrirBorrador(id: number): void {
    this.cargarFichaCompleta(id);
  }

  async cargarFichaCompleta(id: number): Promise<void> {
    this.cargandoFicha = true;
    this.mostrarModal = true;
    this.fichaSeleccionada = null;

    try {
      this.fichaSeleccionada = await this.fichasService.obtenerFichaPorId(id);
      this.cdr.detectChanges();
    } catch (error) {
      alert('Error al cargar la ficha');
      this.cerrarModal();
    } finally {
      this.cargandoFicha = false;
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.fichaSeleccionada = null;
  }

  async validarYGuardar(): Promise<void> {
    if (!this.fichaSeleccionada) return;

    // Validar que tenga datos completos
    const camposFaltantes: string[] = [];

    if (!this.fichaSeleccionada.delegacion) camposFaltantes.push('Delegación');
    if (!this.fichaSeleccionada.municipio) camposFaltantes.push('Municipio');
    if (!this.fichaSeleccionada.lugar) camposFaltantes.push('Lugar');
    if (!this.fichaSeleccionada.fechaSuceso)
      camposFaltantes.push('Fecha Suceso');
    if (!this.fichaSeleccionada.sector) camposFaltantes.push('Sector');
    if (!this.fichaSeleccionada.prioridad) camposFaltantes.push('Prioridad');
    if (!this.fichaSeleccionada.asunto) camposFaltantes.push('Asunto');

    if (camposFaltantes.length > 0) {
      alert(
        `⚠️ Faltan los siguientes campos obligatorios:\n\n${camposFaltantes.join(
          '\n'
        )}`
      );
      return;
    }

    // Confirmar validación
    const confirmar = confirm(
      '¿Estás seguro de validar y guardar esta ficha?\n\n' +
        'Al confirmar, la ficha dejará de ser un borrador y pasará a estado activo.\n\n' +
        `Delegación: ${this.fichaSeleccionada.delegacion}\n` +
        `Fecha Suceso: ${this.fichaSeleccionada.fechaSuceso}\n` +
        `Sector: ${this.fichaSeleccionada.sector}`
    );

    if (!confirmar) return;

    this.cargandoFicha = true;

    try {
      // Cambiar Activo de 2 a 3 (o el valor que corresponda para fichas validadas)
      this.fichaSeleccionada.activo = 3;
      this.fichaSeleccionada.fechaValidacion = new Date().toISOString();

      await this.fichasService.actualizarFicha(
        this.fichaSeleccionada.id,
        this.fichaSeleccionada
      );
      alert('✅ Ficha validada y guardada correctamente');

      this.cerrarModal();
      await this.cargarBorradores(); // Recargar lista (ya no aparecerá este borrador)
    } catch (error) {
      alert('❌ Error al validar y guardar la ficha');
    } finally {
      this.cargandoFicha = false;
    }
  }

  async eliminarBorrador(id: number): Promise<void> {
    if (confirm('¿Estás seguro de eliminar este borrador?')) {
      this.cargando = true;
      try {
        await this.fichasService.eliminarFicha(id);
        alert('Borrador eliminado correctamente');
        await this.cargarBorradores(); // Recargar lista
      } catch (error) {
        alert('Error al eliminar el borrador');
      } finally {
        this.cargando = false;
      }
    }
  }
}
