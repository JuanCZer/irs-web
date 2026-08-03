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
  reports: FichasTodosDTO[] = [];
  filteredReports: FichasTodosDTO[] = [];
  loading: boolean = false;
  error: string = '';
  searchText: string = '';

  constructor(
    private reportsService: FichasService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  async loadReports(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.reports = await this.reportsService.getReportsForToday();
      this.filteredReports = [...this.reports];
      this.cdr.detectChanges();
    } catch (error) {
      this.error =
        'No se pudieron cargar las fichas del día. Verifica que el backend esté corriendo en https://localhost:5001';
    } finally {
      this.loading = false;
    }
  }

  async deleteReport(id: number): Promise<void> {
    if (!confirm('¿Estás seguro de eliminar esta ficha?')) {
      return;
    }

    try {
      await this.reportsService.deleteReport(id);

      await this.loadReports();
    } catch (error) {
      alert('Error al eliminar la ficha');
    }
  }

  filterReports(): void {
    if (!this.searchText.trim()) {
      this.filteredReports = [...this.reports];
      return;
    }

    const text = this.searchText.toLowerCase();
    this.filteredReports = this.reports.filter(
      (report) =>
        report.state.toLowerCase().includes(text) ||
        report.referenceNumber.toLowerCase().includes(text) ||
        report.sector.toLowerCase().includes(text) ||
        report.priority.toLowerCase().includes(text) ||
        report.subject.toLowerCase().includes(text) ||
        report.currentStatus.toLowerCase().includes(text),
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      Baja: 'prioridad-baja',
      Media: 'prioridad-media',
      Alta: 'prioridad-alta',
      Crítica: 'prioridad-critica',
    };
    return colors[priority] || '';
  }

  getStateColor(state: string): string {
    const colors: { [key: string]: string } = {
      Finalizado: 'estado-finalizado',
      'En proceso': 'estado-proceso',
      Pendiente: 'estado-pendiente',
      Cancelado: 'estado-cancelado',
    };
    return colors[state] || '';
  }

  viewReportDetails(report: FichasTodosDTO): void {

  }
}
