import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FichasService, FichasTodosDTO } from '../../services/fichas.service';

@Component({
  selector: 'app-consultar-fichas',
  imports: [CommonModule, FormsModule],
  templateUrl: './consultar-fichas.component.html',
  styleUrl: './consultar-fichas.component.less',
})
export class ConsultarFichasComponent implements OnInit {
  fichas: FichasTodosDTO[] = [];
  fichasFiltradas: FichasTodosDTO[] = [];
  cargando: boolean = false;
  error: string = '';
  buscarTexto: string = '';

  constructor(
    private fichasService: FichasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🔵 Componente inicializado, cargando fichas del día...');
    this.cargarFichas();
  }

  async cargarFichas(): Promise<void> {
    this.cargando = true;
    this.error = '';
    console.log('🔵 Iniciando carga de fichas del día actual...');

    try {
      this.fichas = await this.fichasService.obtenerFichasDelDia();
      console.log('✅ Fichas del día cargadas:', this.fichas);
      console.log('📊 Total de fichas del día:', this.fichas.length);
      this.fichasFiltradas = [...this.fichas];
      console.log('📋 Fichas filtradas:', this.fichasFiltradas.length);
      this.cdr.detectChanges(); // Forzar detección de cambios
    } catch (error) {
      this.error =
        'No se pudieron cargar las fichas del día. Verifica que el backend esté corriendo en https://localhost:5001';
      console.error('❌ Error al cargar fichas del día:', error);
    } finally {
      this.cargando = false;
      console.log('🔵 Carga finalizada. Cargando:', this.cargando);
    }
  }

  async eliminarFicha(id: number): Promise<void> {
    if (!confirm('¿Estás seguro de eliminar esta ficha?')) {
      return;
    }

    try {
      await this.fichasService.eliminarFicha(id);
      // Recargar la lista después de eliminar
      await this.cargarFichas();
    } catch (error) {
      alert('Error al eliminar la ficha');
      console.error('Error:', error);
    }
  }

  filtrarFichas(): void {
    if (!this.buscarTexto.trim()) {
      this.fichasFiltradas = [...this.fichas];
      return;
    }

    const texto = this.buscarTexto.toLowerCase();
    this.fichasFiltradas = this.fichas.filter(
      (ficha) =>
        ficha.estado.toLowerCase().includes(texto) ||
        ficha.folio.toLowerCase().includes(texto) ||
        ficha.sector.toLowerCase().includes(texto) ||
        ficha.prioridad.toLowerCase().includes(texto) ||
        ficha.asunto.toLowerCase().includes(texto) ||
        ficha.estadoActual.toLowerCase().includes(texto)
    );
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  obtenerColorPrioridad(prioridad: string): string {
    const colores: { [key: string]: string } = {
      Baja: 'prioridad-baja',
      Media: 'prioridad-media',
      Alta: 'prioridad-alta',
      Crítica: 'prioridad-critica',
    };
    return colores[prioridad] || '';
  }

  obtenerColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      Finalizado: 'estado-finalizado',
      'En proceso': 'estado-proceso',
      Pendiente: 'estado-pendiente',
      Cancelado: 'estado-cancelado',
    };
    return colores[estado] || '';
  }

  verDetalleFicha(ficha: FichasTodosDTO): void {
    console.log('Ver detalle de ficha:', ficha);
    // Implementar navegación al detalle
  }
}
