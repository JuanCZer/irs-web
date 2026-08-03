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
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-fichas-borradores',
  imports: [
    CommonModule,
    FormsModule,
    ModalFichasConsultaComponent,
    PaginationComponent,
  ],
  templateUrl: './fichas-borradores.component.html',
  styleUrl: './fichas-borradores.component.less',
})
export class FichasBorradoresComponent implements OnInit {
  drafts: FichasBorradorDTO[] = [];
  filteredDrafts: FichasBorradorDTO[] = [];
  loading: boolean = false;
  error: string = '';


  showModal: boolean = false;
  selectedReport: FichaInformativa | null = null;
  reportLoading: boolean = false;


  searchText: string = '';


  currentPage: number = 1;
  recordsPerPage: number = 10;
  totalPages: number = 0;

  constructor(
    private reportsService: FichasService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDrafts();
  }

  async loadDrafts(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.drafts = await this.reportsService.getDrafts();
      this.filteredDrafts = [...this.drafts];
      this.calculatePagination();
      this.cdr.detectChanges();
    } catch (error) {
      this.error =
        'No se pudieron cargar los borradores. Verifica que el backend esté corriendo.';
    } finally {
      this.loading = false;
    }
  }

  async search(): Promise<void> {
    if (!this.searchText.trim()) {
      this.filteredDrafts = [...this.drafts];
      this.currentPage = 1;
      this.calculatePagination();
      return;
    }

    this.loading = true;
    try {
      this.filteredDrafts = await this.reportsService.searchDrafts(
        this.searchText
      );
      this.currentPage = 1;
      this.calculatePagination();
    } catch (error) {
      this.error = 'Error al realizar la búsqueda';
    } finally {
      this.loading = false;
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredDrafts = [...this.drafts];
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredDrafts.length / this.recordsPerPage
    );
    this.currentPage = Math.min(
      Math.max(1, this.currentPage),
      Math.max(1, this.totalPages)
    );
  }

  get paginatedDrafts(): FichasBorradorDTO[] {
    const start = (this.currentPage - 1) * this.recordsPerPage;
    const end = start + this.recordsPerPage;
    return this.filteredDrafts.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openDraft(id: number): void {
    this.loadFullReport(id);
  }

  async loadFullReport(id: number): Promise<void> {
    this.reportLoading = true;
    this.showModal = true;
    this.selectedReport = null;

    try {
      this.selectedReport = await this.reportsService.getReportById(id);
      this.cdr.detectChanges();
    } catch (error) {
      alert('Error al cargar la ficha');
      this.closeModal();
    } finally {
      this.reportLoading = false;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReport = null;
  }

  async validateAndSave(): Promise<void> {
    if (!this.selectedReport) return;


    const missingFields: string[] = [];

    if (!this.selectedReport.delegation) missingFields.push('Delegación');
    if (!this.selectedReport.municipality) missingFields.push('Municipio');
    if (!this.selectedReport.place) missingFields.push('Lugar');
    if (!this.selectedReport.eventDate)
      missingFields.push('Fecha Suceso');
    if (!this.selectedReport.sector) missingFields.push('Sector');
    if (!this.selectedReport.priority) missingFields.push('Prioridad');
    if (!this.selectedReport.subject) missingFields.push('Asunto');

    if (missingFields.length > 0) {
      alert(
        `⚠️ Faltan los siguientes campos obligatorios:\n\n${missingFields.join(
          '\n'
        )}`
      );
      return;
    }


    const confirmed = confirm(
      '¿Estás seguro de validar y guardar esta ficha?\n\n' +
        'Al confirmar, la ficha dejará de ser un borrador y pasará a estado activo.\n\n' +
        `Delegación: ${this.selectedReport.delegation}\n` +
        `Fecha Suceso: ${this.selectedReport.eventDate}\n` +
        `Sector: ${this.selectedReport.sector}`
    );

    if (!confirmed) return;

    this.reportLoading = true;

    try {

      this.selectedReport.active = 3;
      this.selectedReport.validationDate = new Date().toISOString();

      await this.reportsService.updateReport(
        this.selectedReport.id,
        this.selectedReport
      );
      alert('✅ Ficha validada y guardada correctamente');

      this.closeModal();
      await this.loadDrafts();
    } catch (error) {
      alert('❌ Error al validar y guardar la ficha');
    } finally {
      this.reportLoading = false;
    }
  }

  async deleteDraft(id: number): Promise<void> {
    if (confirm('¿Estás seguro de eliminar este borrador?')) {
      this.loading = true;
      try {
        await this.reportsService.deleteReport(id);
        alert('Borrador eliminado correctamente');
        await this.loadDrafts();
      } catch (error) {
        alert('Error al eliminar el borrador');
      } finally {
        this.loading = false;
      }
    }
  }
}
