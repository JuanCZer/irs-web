import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FichasService,
  FichasTodosDTO,
  FichaInformativa,
} from '../../services/fichas.service';
import { ModalFichasConsultaComponent } from '../../components/modal-fichas-consulta/modal-fichas-consulta.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-consultar-todas-fichas',
  imports: [
    CommonModule,
    FormsModule,
    ModalFichasConsultaComponent,
    PaginationComponent,
  ],
  templateUrl: './consultar-todas-fichas.component.html',
  styleUrl: './consultar-todas-fichas.component.less',
})
export class ConsultarTodasFichasComponent implements OnInit {
  searchText: string = '';


  showModal: boolean = false;
  selectedReport: FichaInformativa | null = null;
  reportLoading: boolean = false;

  private _startDate: string = '';
  private _endDate: string = '';


  get startDate(): string {
    return this._startDate;
  }

  set startDate(value: string) {
    const previousValue = this._startDate;
    this._startDate = value;


    if (previousValue !== value && this._startDate && this._endDate) {
      setTimeout(() => this.filterByDates(), 0);
    }
  }

  get endDate(): string {
    return this._endDate;
  }

  set endDate(value: string) {
    const previousValue = this._endDate;
    this._endDate = value;


    if (previousValue !== value && this._startDate && this._endDate) {
      setTimeout(() => this.filterByDates(), 0);
    }
  }

  reports: FichasTodosDTO[] = [];
  filteredReports: FichasTodosDTO[] = [];
  loading: boolean = false;
  error: string = '';


  currentPage: number = 1;
  reportsPerPage: number = 10;
  totalPages: number = 0;

  constructor(private reportsService: FichasService) {}

  async ngOnInit(): Promise<void> {
    this.setDefaultDates();
    await this.filterByDates();
  }

  async loadReports(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.reports = await this.reportsService.getAllReports();
      this.filteredReports = [...this.reports];
      this.calculateTotalPages();
    } catch (error) {
      this.error =
        'Error al cargar las fichas. Verifica que el backend esté corriendo.';
    } finally {
      this.loading = false;
    }
  }

  setDefaultDates(): void {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    this.endDate = this.formatInputDate(today);
    this.startDate = this.formatInputDate(oneMonthAgo);
  }

  formatInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  parseDate(dateString: string): Date {

    const date = new Date(dateString);
    return date;
  }

  search(): void {
    this.applyFilters();
  }

  async filterByDates(): Promise<void> {
    if (this._startDate && this._endDate) {

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(this._startDate)) {
        this.error = `Formato de date start inválido: ${this._startDate}. Use formato yyyy-MM-dd`;
        return;
      }

      if (!dateRegex.test(this._endDate)) {
        this.error = `Formato de date end inválido: ${this._endDate}. Use formato yyyy-MM-dd`;
        return;
      }


      if (this._startDate > this._endDate) {
        this.error =
          'La fecha de inicio debe ser anterior o igual a la fecha fin';
        return;
      }

      this.loading = true;
      this.error = '';

      try {

        const allReports = await this.reportsService.getAllReports();


        const startDate = new Date(this._startDate);
        const endDate = new Date(this._endDate);

        this.reports = allReports.filter((report) => {
          const eventDate = new Date(report.eventDate);
          return eventDate >= startDate && eventDate <= endDate;
        });

        this.filteredReports = [...this.reports];
        this.currentPage = 1;
        this.calculateTotalPages();
      } catch (error) {
        this.error = 'Error al filtrar por fechas';
      } finally {
        this.loading = false;
      }
    } else if (!this._startDate && !this._endDate) {

      await this.loadReports();
    } else {
      this.error = 'Ambas fechas son requeridas para filtrar por rango';
    }
  }

  applyFilters(): void {
    let results = [...this.reports];


    if (this.searchText.trim()) {
      const lowercaseText = this.searchText.toLowerCase();
      results = results.filter(
        (report) =>
          report.referenceNumber.toLowerCase().includes(lowercaseText) ||
          report.subject.toLowerCase().includes(lowercaseText) ||
          report.state.toLowerCase().includes(lowercaseText) ||
          report.sector.toLowerCase().includes(lowercaseText) ||
          report.priority.toLowerCase().includes(lowercaseText),
      );
    }

    this.filteredReports = results;
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  clearFilters(): void {
    this.searchText = '';
    this.startDate = '';
    this.endDate = '';
    this.loadReports();
  }

  setToday(): void {
    const today = new Date();
    this.startDate = this.formatInputDate(today);
    this.endDate = this.formatInputDate(today);
    this.filterByDates();
  }

  setLastWeek(): void {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    this.startDate = this.formatInputDate(oneWeekAgo);
    this.endDate = this.formatInputDate(today);
    this.filterByDates();
  }

  setLastMonth(): void {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    this.startDate = this.formatInputDate(oneMonthAgo);
    this.endDate = this.formatInputDate(today);
    this.filterByDates();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(
      this.filteredReports.length / this.reportsPerPage,
    );
    this.currentPage = Math.min(
      Math.max(1, this.currentPage),
      Math.max(1, this.totalPages),
    );
  }

  get paginatedReports(): FichasTodosDTO[] {
    const start = (this.currentPage - 1) * this.reportsPerPage;
    const end = start + this.reportsPerPage;
    return this.filteredReports.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  exportExcel(): void {

  }

  exportPdf(): void {

  }

  async viewReport(id: number): Promise<void> {
    this.reportLoading = true;
    this.showModal = true;

    try {
      this.selectedReport = await this.reportsService.getReportById(id);
    } catch (error) {
      this.closeModal();
    } finally {
      this.reportLoading = false;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReport = null;
  }
}
