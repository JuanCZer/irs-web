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
import { PaginationComponent } from '../../components/pagination/pagination.component';

interface FichaDespacho {
  reportId: number;
  referenceNumber: string;
  eventDate: string;
  delegation: string;
  municipality: string;
  place: string;
  priority: string;
  sector: string;
  subject: string;
}

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalMedidasComponent,
    ModalValidarComponent,
    PaginationComponent,
  ],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.less',
})
export class DespachoComponent implements OnInit {
  reports: FichaDespacho[] = [];
  loading = false;
  error = '';


  showMeasuresModal = false;
  showValidationModal = false;
  showReportDetailsModal = false;
  selectedReport: FichaDespacho | null = null;
  fullReportDetails: FichasTodosDTO | null = null;

  securityMeasures: CatMedidaSeguridad[] = [];
  selectedMeasureIds: number[] = [];
  temporaryComment = '';


  currentPage = 1;
  reportsPerPage = 10;

  constructor(
    private reportsService: FichasService,
    private dispatchService: DespachoService,
    private catalogsService: CatalogosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReports();
    this.loadSecurityMeasures();
  }

  async loadSecurityMeasures(): Promise<void> {
    try {
      this.securityMeasures =
        await this.catalogsService.getSecurityMeasures();
    } catch (error) {
      this.error = 'Error al cargar las medidas de seguridad';
    }
  }

  async loadReports(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';


      const reportDtos = await this.reportsService.getReportsByStatus(
        'Concluido'
      );


      this.reports = reportDtos.map((dto) => ({
        reportId: dto.id,
        referenceNumber: dto.referenceNumber,
        eventDate: dto.eventDate,
        delegation: dto.state,
        municipality: dto.municipality || 'N/A',
        place: dto.place || 'N/A',
        priority: dto.priority,
        sector: dto.sector,
        subject: dto.subject,
      }));
      this.currentPage = Math.min(
        Math.max(1, this.currentPage),
        Math.max(1, this.totalPages)
      );
    } catch (error) {
      this.error =
        'Error al cargar las fichas. Verifique que el backend esté corriendo.';
    } finally {
      this.loading = false;
    }
  }

  get paginatedReports(): FichaDespacho[] {
    const start = (this.currentPage - 1) * this.reportsPerPage;
    const end = start + this.reportsPerPage;
    return this.reports.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.reports.length / this.reportsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openMeasuresModal(report: FichaDespacho): void {
    this.selectedReport = report;
    this.loadMeasuresDraft(report.reportId);
    this.showMeasuresModal = true;
  }

  openValidationModal(report: FichaDespacho): void {
    this.loadMeasuresDraft(report.reportId);

    if (this.selectedMeasureIds.length === 0) {
      alert(
        'Primero debe seleccionar las medidas de seguridad usando el botón "Medidas"'
      );
      return;
    }
    this.selectedReport = report;
    this.showValidationModal = true;
  }

  async openReportDetailsModal(report: FichaDespacho): Promise<void> {
    try {
      this.selectedReport = report;
      this.loading = true;


      const reportDetails = await this.reportsService.getReportsByStatus(
        'Concluido'
      );
      this.fullReportDetails =
        reportDetails.find((f) => f.id === report.reportId) || null;

      this.showReportDetailsModal = true;
    } catch (error) {
      alert('Error al cargar los detalles de la ficha');
    } finally {
      this.loading = false;
    }
  }

  closeModal(): void {
    this.showMeasuresModal = false;
    this.showValidationModal = false;
    this.showReportDetailsModal = false;
    this.selectedReport = null;
    this.fullReportDetails = null;
  }

  onMeasuresDraftChange(event: AplicarMedidasEvent): void {
    if (!this.selectedReport) return;

    this.selectedMeasureIds = [...event.measures];
    this.temporaryComment = event.comment;
    this.dispatchService.saveMeasuresDraft(
      this.selectedReport.reportId,
      event
    );
  }

  async onApplyMeasures(event: AplicarMedidasEvent): Promise<void> {
    if (!this.selectedReport) return;

    this.onMeasuresDraftChange(event);

    alert(
      `Se han seleccionado ${event.measures.length} measures. Ahora use el botón "Validar" para subir la evidence.`
    );

    this.closeModal();
  }

  async onValidateReport(event: ValidarEvent): Promise<void> {
    if (!this.selectedReport) return;

    try {
      const reportId = this.selectedReport.reportId;
      const user = this.authService.currentUserValue;

      await this.dispatchService.validateReport({
        reportId,
        securityMeasureIds: this.selectedMeasureIds,
        comment: this.temporaryComment,
        evidence: event.evidenceFiles,
        userId: user?.userId,
      });

      alert('Ficha validada correctamente con evidencia');
      this.dispatchService.deleteMeasuresDraft(reportId);
      this.closeModal();


      this.selectedMeasureIds = [];
      this.temporaryComment = '';
    } catch (error) {
      alert('Error al validar la ficha. Intente nuevamente.');
    }
  }

  private loadMeasuresDraft(reportId: number): void {
    const draft = this.dispatchService.getMeasuresDraft(reportId);
    this.selectedMeasureIds = draft?.measures ?? [];
    this.temporaryComment = draft?.comment ?? '';
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
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
