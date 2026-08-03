import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../components/pagination/pagination.component';

interface FichaBorrador {
  id: string;
  creationDate: string;
  eventDate: string;
  state: string;
  eventStartTime: string;
  eventEndTime: string;
  priority: string;
  sector: string;
  attendeeCount: number | null;
  currentStatus: string;
  draftUser: string;

  completeData: any;
}

@Component({
  selector: 'app-borradores-fichas',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './borradores-fichas.component.html',
  styleUrl: './borradores-fichas.component.less',
})
export class BorradoresFichasComponent implements OnInit {
  drafts: FichaBorrador[] = [];
  filteredDrafts: FichaBorrador[] = [];
  search: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDrafts();
  }

  loadDrafts(): void {

    const savedDrafts = localStorage.getItem('borradores_fichas');
    if (savedDrafts) {
      this.drafts = JSON.parse(savedDrafts);
    } else {

      this.drafts = this.generateExamples();
      this.saveToLocalStorage();
    }
    this.filteredDrafts = [...this.drafts];
  }

  generateExamples(): FichaBorrador[] {
    return [
      {
        id: '6',
        creationDate: '25/08/2025',
        eventDate: '2025-08-25',
        state: 'Hidalgo',
        eventStartTime: '09:00',
        eventEndTime: '11:00',
        priority: 'Alta',
        sector: 'Sector 2',
        attendeeCount: 350,
        currentStatus: 'NUEVO',
        draftUser: 'Patricia Sánchez',
        completeData: {
          state: 'Hidalgo',
          place: 'Plaza de la Constitución',
          latitude: 20.1011,
          longitude: -98.7424,
          address: 'Centro Histórico, Plaza Principal',
          sector: 'Sector 2',
          subsector: 'SubSector E',
          eventStartTime: '09:00',
          eventEndTime: '11:00',
          eventDate: '2025-08-25',
          attendeeCount: 350,
          priority: 'Alta',
          eventCondition: 'En proceso',
          information: 'Pública',
          subject: 'Ceremonia cívica',
          facts: 'Ceremonia conmemorativa con presencia de autoridades',
          agreements: 'Mantener orden y seguridad durante el evento',
          reporter: 'Informante 3',
          receptionDate: '2025-08-25',
          receptionTime: '08:30',
        },
      },
      {
        id: '1',
        creationDate: '26/07/2025',
        eventDate: '2025-07-26',
        state: 'Hidalgo',
        eventStartTime: '10:00',
        eventEndTime: '12:00',
        priority: 'Media',
        sector: 'Sector 1',
        attendeeCount: 150,
        currentStatus: 'NUEVO',
        draftUser: 'Juan Pérez',
        completeData: {
          state: 'Hidalgo',
          place: 'Plaza Principal',
          latitude: 20.0911,
          longitude: -98.7624,
          address: 'Calle Juárez 123, Centro',
          sector: 'Sector 1',
          subsector: 'SubSector A',
          eventStartTime: '10:00',
          eventEndTime: '12:00',
          eventDate: '2025-07-26',
          attendeeCount: 150,
          priority: 'Media',
          eventCondition: 'En proceso',
          information: 'Pública',
          subject: 'Manifestación pacífica',
          facts:
            'Grupo de ciudadanos realizando manifestación por mejores servicios públicos',
          agreements: 'Se acordó mesa de diálogo con autoridades',
          reporter: 'Informante 1',
          receptionDate: '2025-07-26',
          receptionTime: '09:30',
        },
      },
      {
        id: '2',
        creationDate: '26/07/2025',
        eventDate: '2025-07-26',
        state: 'Hidalgo',
        eventStartTime: '14:30',
        eventEndTime: '16:00',
        priority: 'Alta',
        sector: 'Sector 2',
        attendeeCount: 300,
        currentStatus: 'NUEVO',
        draftUser: 'María López',
        completeData: {
          state: 'Hidalgo',
          place: 'Parque Central',
          latitude: 20.1211,
          longitude: -98.7324,
          address: 'Av. Revolución 456',
          sector: 'Sector 2',
          subsector: 'SubSector D',
          eventStartTime: '14:30',
          eventEndTime: '16:00',
          eventDate: '2025-07-26',
          attendeeCount: 300,
          priority: 'Alta',
          eventCondition: 'Finalizado',
          information: 'Pública',
          subject: 'Evento cultural',
          facts: 'Evento cultural con alta asistencia de público',
          agreements: 'Próximo evento programado para agosto',
          reporter: 'Informante 2',
          receptionDate: '2025-07-26',
          receptionTime: '14:00',
        },
      },
      {
        id: '3',
        creationDate: '26/07/2025',
        eventDate: '2025-07-26',
        state: 'Hidalgo',
        eventStartTime: '08:00',
        eventEndTime: '09:30',
        priority: 'Baja',
        sector: 'Sector 3',
        attendeeCount: 50,
        currentStatus: 'NUEVO',
        draftUser: 'Carlos Ramírez',
        completeData: {
          state: 'Hidalgo',
          place: 'Auditorio Municipal',
          latitude: 20.0511,
          longitude: -98.8024,
          address: 'Blvd. Felipe Angeles 789',
          sector: 'Sector 3',
          subsector: 'SubSector G',
          eventStartTime: '08:00',
          eventEndTime: '09:30',
          eventDate: '2025-07-26',
          attendeeCount: 50,
          priority: 'Baja',
          eventCondition: 'Pendiente',
          information: 'Pública',
          subject: 'Reunión vecinal',
          facts: 'Reunión de vecinos para discutir temas de seguridad',
          agreements: 'Formar comité de vigilancia vecinal',
          reporter: 'Informante 3',
          receptionDate: '2025-07-26',
          receptionTime: '07:45',
        },
      },
      {
        id: '4',
        creationDate: '26/07/2025',
        eventDate: '2025-07-26',
        state: 'Hidalgo',
        eventStartTime: '16:00',
        eventEndTime: '18:00',
        priority: 'Crítica',
        sector: 'Sector 4',
        attendeeCount: 500,
        currentStatus: 'NUEVO',
        draftUser: 'Ana Torres',
        completeData: {
          state: 'Hidalgo',
          place: 'Estadio Municipal',
          latitude: 20.1411,
          longitude: -98.7124,
          address: 'Carretera Pachuca-Tulancingo Km 5',
          sector: 'Sector 4',
          subsector: 'SubSector J',
          eventStartTime: '16:00',
          eventEndTime: '18:00',
          eventDate: '2025-07-26',
          attendeeCount: 500,
          priority: 'Crítica',
          eventCondition: 'En proceso',
          information: 'Pública',
          subject: 'Evento deportivo masivo',
          facts: 'Gran evento deportivo con alta concentración de personas',
          agreements: 'Reforzar seguridad y servicios médicos',
          reporter: 'Informante 1',
          receptionDate: '2025-07-26',
          receptionTime: '15:30',
        },
      },
      {
        id: '5',
        creationDate: '26/07/2025',
        eventDate: '2025-07-26',
        state: 'Hidalgo',
        eventStartTime: '11:00',
        eventEndTime: '13:00',
        priority: 'Media',
        sector: 'Sector 1',
        attendeeCount: 200,
        currentStatus: 'NUEVO',
        draftUser: 'Luis Hernández',
        completeData: {
          state: 'Hidalgo',
          place: 'Centro Comunitario',
          latitude: 20.0711,
          longitude: -98.7824,
          address: 'Calle Morelos 234',
          sector: 'Sector 1',
          subsector: 'SubSector B',
          eventStartTime: '11:00',
          eventEndTime: '13:00',
          eventDate: '2025-07-26',
          attendeeCount: 200,
          priority: 'Media',
          eventCondition: 'Finalizado',
          information: 'Pública',
          subject: 'Jornada de salud',
          facts: 'Jornada de vacunación y servicios médicos gratuitos',
          agreements: 'Programar siguiente jornada en septiembre',
          reporter: 'Informante 2',
          receptionDate: '2025-07-26',
          receptionTime: '10:30',
        },
      },
    ];
  }

  search(): void {
    const term = this.search.toLowerCase().trim();
    if (!term) {
      this.filteredDrafts = [...this.drafts];
    } else {
      this.filteredDrafts = this.drafts.filter(
        (draft) =>
          draft.state.toLowerCase().includes(term) ||
          draft.eventDate.includes(term) ||
          draft.creationDate.includes(term) ||
          draft.currentStatus.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDrafts.length / this.itemsPerPage);
  }

  get paginatedDrafts(): FichaBorrador[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredDrafts.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  editDraft(draft: FichaBorrador): void {

    localStorage.setItem('borrador_editar_id', draft.id);

    this.router.navigate(['/fichas/registrar']);
  }

  deleteDraft(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este borrador?')) {
      this.drafts = this.drafts.filter((b) => b.id !== id);
      this.filteredDrafts = this.filteredDrafts.filter(
        (b) => b.id !== id
      );
      this.saveToLocalStorage();


      if (this.paginatedDrafts.length === 0 && this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }

  saveToLocalStorage(): void {
    localStorage.setItem('borradores_fichas', JSON.stringify(this.drafts));
  }
}
