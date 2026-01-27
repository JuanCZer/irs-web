import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FichasService,
  FichasTodosDTO,
  FichaInformativa,
} from '../../services/fichas.service';
import { ModalFichasConsultaComponent } from '../../components/modal-fichas-consulta/modal-fichas-consulta.component';

@Component({
  selector: 'app-consultar-todas-fichas',
  imports: [CommonModule, FormsModule, ModalFichasConsultaComponent],
  templateUrl: './consultar-todas-fichas.component.html',
  styleUrl: './consultar-todas-fichas.component.less',
})
export class ConsultarTodasFichasComponent implements OnInit {
  Math = Math; // Para usar Math.min en el template
  buscarTexto: string = '';

  // Modal
  mostrarModal: boolean = false;
  fichaSeleccionada: FichaInformativa | null = null;
  cargandoFicha: boolean = false;

  private _fechaInicio: string = '';
  private _fechaFin: string = '';

  // Getters y setters para fechas con auto-filtrado
  get fechaInicio(): string {
    return this._fechaInicio;
  }

  set fechaInicio(value: string) {
    console.log('📅 SET fechaInicio:', value);
    const valorAnterior = this._fechaInicio;
    this._fechaInicio = value;

    // Solo filtrar si cambió el valor y ambas fechas están definidas
    if (valorAnterior !== value && this._fechaInicio && this._fechaFin) {
      console.log('✅ Valor cambió, filtrando inmediatamente...');
      setTimeout(() => this.filtrarPorFechas(), 0); // Async para no bloquear el setter
    }
  }

  get fechaFin(): string {
    return this._fechaFin;
  }

  set fechaFin(value: string) {
    console.log('📅 SET fechaFin:', value);
    const valorAnterior = this._fechaFin;
    this._fechaFin = value;

    // Solo filtrar si cambió el valor y ambas fechas están definidas
    if (valorAnterior !== value && this._fechaInicio && this._fechaFin) {
      console.log('✅ Valor cambió, filtrando inmediatamente...');
      setTimeout(() => this.filtrarPorFechas(), 0); // Async para no bloquear el setter
    }
  }

  fichas: FichasTodosDTO[] = [];
  fichasFiltradas: FichasTodosDTO[] = [];
  cargando: boolean = false;
  error: string = '';

  // Paginación
  paginaActual: number = 1;
  fichasPorPagina: number = 10;
  totalPaginas: number = 0;

  constructor(private fichasService: FichasService) {}

  async ngOnInit(): Promise<void> {
    console.log('🔄 ngOnInit - Inicializando componente');
    this.establecerFechasPorDefecto();
    console.log('📅 Fechas por defecto establecidas:', {
      fechaInicio: this._fechaInicio,
      fechaFin: this._fechaFin,
    });

    // Cargar fichas usando el filtro de fechas por defecto
    await this.filtrarPorFechas();
  }

  async cargarFichas(): Promise<void> {
    console.log('🔄 cargarFichas - Cargando todas las fichas sin filtro');
    this.cargando = true;
    this.error = '';

    try {
      this.fichas = await this.fichasService.obtenerTodasLasFichas();
      console.log('✅ Total fichas cargadas:', this.fichas.length);
      this.fichasFiltradas = [...this.fichas];
      this.calcularTotalPaginas();
    } catch (error) {
      this.error =
        'Error al cargar las fichas. Verifica que el backend esté corriendo.';
      console.error('❌ Error:', error);
    } finally {
      this.cargando = false;
    }
  }

  establecerFechasPorDefecto(): void {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    this.fechaFin = this.formatearFechaInput(hoy);
    this.fechaInicio = this.formatearFechaInput(haceUnMes);

    console.log('📅 Fechas establecidas:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
    });
  }

  formatearFechaInput(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  formatearFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  parsearFecha(fechaStr: string): Date {
    // Formato esperado: yyyy-MM-dd del backend
    const fecha = new Date(fechaStr);
    return fecha;
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  async filtrarPorFechas(): Promise<void> {
    console.log('🔍 filtrarPorFechas() llamado');
    console.log('📅 ESTADO ACTUAL DE LAS FECHAS:');
    console.log(
      '   fechaInicio:',
      this._fechaInicio,
      '(tipo:',
      typeof this._fechaInicio,
      ')',
    );
    console.log(
      '   fechaFin:',
      this._fechaFin,
      '(tipo:',
      typeof this._fechaFin,
      ')',
    );

    if (this._fechaInicio && this._fechaFin) {
      // Validar que sean fechas válidas
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/;

      if (!regexFecha.test(this._fechaInicio)) {
        this.error = `Formato de fecha inicio inválido: ${this._fechaInicio}. Use formato yyyy-MM-dd`;
        console.error('❌', this.error);
        return;
      }

      if (!regexFecha.test(this._fechaFin)) {
        this.error = `Formato de fecha fin inválido: ${this._fechaFin}. Use formato yyyy-MM-dd`;
        console.error('❌', this.error);
        return;
      }

      // Validar que fechaInicio sea menor o igual a fechaFin
      if (this._fechaInicio > this._fechaFin) {
        this.error =
          'La fecha de inicio debe ser anterior o igual a la fecha fin';
        console.error('❌', this.error);
        return;
      }

      this.cargando = true;
      this.error = '';
      console.log(
        '✅ Fechas válidas, filtrando fichas por rango:',
        this._fechaInicio,
        'a',
        this._fechaFin,
      );

      try {
        console.log('🌐 Llamando al servicio obtenerTodasLasFichas...');
        // Obtener todas las fichas del servidor
        const todasLasFichas = await this.fichasService.obtenerTodasLasFichas();
        console.log(
          '✅ Total de fichas obtenidas del backend:',
          todasLasFichas.length,
        );

        // Filtrar localmente por rango de fechas
        const fechaInicio = new Date(this._fechaInicio);
        const fechaFin = new Date(this._fechaFin);

        this.fichas = todasLasFichas.filter((ficha) => {
          const fechaSuceso = new Date(ficha.fechaSuceso);
          return fechaSuceso >= fechaInicio && fechaSuceso <= fechaFin;
        });

        console.log(
          '📋 Fichas filtradas por rango de fechas:',
          this.fichas.length,
        );
        console.log('📋 Datos recibidos:', this.fichas);

        this.fichasFiltradas = [...this.fichas];
        this.paginaActual = 1;
        this.calcularTotalPaginas();
        console.log(
          '📊 Total de fichas filtradas:',
          this.fichasFiltradas.length,
        );
      } catch (error) {
        this.error = 'Error al filtrar por fechas';
        console.error('❌ Error al filtrar por fechas:', error);
      } finally {
        this.cargando = false;
      }
    } else if (!this._fechaInicio && !this._fechaFin) {
      // Si no hay fechas, cargar todas
      console.log('🔄 Sin filtros de fecha, cargando todas las fichas');
      await this.cargarFichas();
    } else {
      console.warn('⚠️ Falta una de las dos fechas:', {
        fechaInicio: this._fechaInicio,
        fechaFin: this._fechaFin,
      });
    }
  }

  aplicarFiltros(): void {
    let resultados = [...this.fichas];

    // Filtrar por texto
    if (this.buscarTexto.trim()) {
      const textoLower = this.buscarTexto.toLowerCase();
      resultados = resultados.filter(
        (ficha) =>
          ficha.folio.toLowerCase().includes(textoLower) ||
          ficha.asunto.toLowerCase().includes(textoLower) ||
          ficha.estado.toLowerCase().includes(textoLower) ||
          ficha.sector.toLowerCase().includes(textoLower) ||
          ficha.prioridad.toLowerCase().includes(textoLower),
      );
    }

    this.fichasFiltradas = resultados;
    this.paginaActual = 1;
    this.calcularTotalPaginas();
  }

  limpiarFiltros(): void {
    this.buscarTexto = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.cargarFichas();
  }

  establecerHoy(): void {
    const hoy = new Date();
    this.fechaInicio = this.formatearFechaInput(hoy);
    this.fechaFin = this.formatearFechaInput(hoy);
    this.filtrarPorFechas();
  }

  establecerUltimaSemana(): void {
    const hoy = new Date();
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

    this.fechaInicio = this.formatearFechaInput(haceUnaSemana);
    this.fechaFin = this.formatearFechaInput(hoy);
    this.filtrarPorFechas();
  }

  establecerUltimoMes(): void {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    this.fechaInicio = this.formatearFechaInput(haceUnMes);
    this.fechaFin = this.formatearFechaInput(hoy);
    this.filtrarPorFechas();
  }

  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(
      this.fichasFiltradas.length / this.fichasPorPagina,
    );
  }

  get fichasPaginadas(): FichasTodosDTO[] {
    const inicio = (this.paginaActual - 1) * this.fichasPorPagina;
    const fin = inicio + this.fichasPorPagina;
    return this.fichasFiltradas.slice(inicio, fin);
  }

  anterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  siguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const rango = 2; // Número de páginas a mostrar antes y después de la actual

    let inicio = Math.max(1, this.paginaActual - rango);
    let fin = Math.min(this.totalPaginas, this.paginaActual + rango);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  verTutorial(): void {
    console.log('Mostrar tutorial');
    // Implementar lógica para mostrar tutorial
  }

  exportarExcel(): void {
    console.log('Exportar a Excel');
    // Implementar lógica para exportar a Excel
  }

  exportarPDF(): void {
    console.log('Exportar a PDF');
    // Implementar lógica para exportar a PDF
  }

  async verFicha(id: number): Promise<void> {
    this.cargandoFicha = true;
    this.mostrarModal = true;

    try {
      console.log('🔍 Cargando ficha con ID:', id);
      this.fichaSeleccionada = await this.fichasService.obtenerFichaPorId(id);
      console.log('✅ Ficha cargada:', this.fichaSeleccionada);
    } catch (error) {
      console.error('❌ Error al cargar la ficha:', error);
      this.cerrarModal();
    } finally {
      this.cargandoFicha = false;
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.fichaSeleccionada = null;
  }
}
