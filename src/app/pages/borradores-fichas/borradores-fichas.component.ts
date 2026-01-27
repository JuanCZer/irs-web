import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FichaBorrador {
  id: string;
  fechaElaboracion: string;
  fechaSuceso: string;
  estado: string;
  horaInicioSuceso: string;
  horaFinSuceso: string;
  prioridad: string;
  sector: string;
  numeroAsistentes: number | null;
  estadoActual: string;
  borradorUsuario: string;
  // Datos completos para editar
  datosCompletos: any;
}

@Component({
  selector: 'app-borradores-fichas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './borradores-fichas.component.html',
  styleUrl: './borradores-fichas.component.less',
})
export class BorradoresFichasComponent implements OnInit {
  borradores: FichaBorrador[] = [];
  borradoresFiltrados: FichaBorrador[] = [];
  busqueda: string = '';
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  Math = Math;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarBorradores();
  }

  cargarBorradores(): void {
    // Cargar borradores desde localStorage
    const borradoresGuardados = localStorage.getItem('borradores_fichas');
    if (borradoresGuardados) {
      this.borradores = JSON.parse(borradoresGuardados);
    } else {
      // Datos de ejemplo
      this.borradores = this.generarEjemplos();
      this.guardarEnLocalStorage();
    }
    this.borradoresFiltrados = [...this.borradores];
  }

  generarEjemplos(): FichaBorrador[] {
    return [
      {
        id: '6',
        fechaElaboracion: '25/08/2025',
        fechaSuceso: '2025-08-25',
        estado: 'Hidalgo',
        horaInicioSuceso: '09:00',
        horaFinSuceso: '11:00',
        prioridad: 'Alta',
        sector: 'Sector 2',
        numeroAsistentes: 350,
        estadoActual: 'NUEVO',
        borradorUsuario: 'Patricia Sánchez',
        datosCompletos: {
          estado: 'Hidalgo',
          lugar: 'Plaza de la Constitución',
          latitud: 20.1011,
          longitud: -98.7424,
          direccion: 'Centro Histórico, Plaza Principal',
          sector: 'Sector 2',
          subsector: 'SubSector E',
          horaInicioSuceso: '09:00',
          horaFinSuceso: '11:00',
          fechaSuceso: '2025-08-25',
          numeroAsistentes: 350,
          prioridad: 'Alta',
          condicionEvento: 'En proceso',
          informacion: 'Pública',
          asunto: 'Ceremonia cívica',
          hechos: 'Ceremonia conmemorativa con presencia de autoridades',
          acuerdos: 'Mantener orden y seguridad durante el evento',
          informo: 'Informante 3',
          fechaRecepcion: '2025-08-25',
          horaRecepcion: '08:30',
        },
      },
      {
        id: '1',
        fechaElaboracion: '26/07/2025',
        fechaSuceso: '2025-07-26',
        estado: 'Hidalgo',
        horaInicioSuceso: '10:00',
        horaFinSuceso: '12:00',
        prioridad: 'Media',
        sector: 'Sector 1',
        numeroAsistentes: 150,
        estadoActual: 'NUEVO',
        borradorUsuario: 'Juan Pérez',
        datosCompletos: {
          estado: 'Hidalgo',
          lugar: 'Plaza Principal',
          latitud: 20.0911,
          longitud: -98.7624,
          direccion: 'Calle Juárez 123, Centro',
          sector: 'Sector 1',
          subsector: 'SubSector A',
          horaInicioSuceso: '10:00',
          horaFinSuceso: '12:00',
          fechaSuceso: '2025-07-26',
          numeroAsistentes: 150,
          prioridad: 'Media',
          condicionEvento: 'En proceso',
          informacion: 'Pública',
          asunto: 'Manifestación pacífica',
          hechos:
            'Grupo de ciudadanos realizando manifestación por mejores servicios públicos',
          acuerdos: 'Se acordó mesa de diálogo con autoridades',
          informo: 'Informante 1',
          fechaRecepcion: '2025-07-26',
          horaRecepcion: '09:30',
        },
      },
      {
        id: '2',
        fechaElaboracion: '26/07/2025',
        fechaSuceso: '2025-07-26',
        estado: 'Hidalgo',
        horaInicioSuceso: '14:30',
        horaFinSuceso: '16:00',
        prioridad: 'Alta',
        sector: 'Sector 2',
        numeroAsistentes: 300,
        estadoActual: 'NUEVO',
        borradorUsuario: 'María López',
        datosCompletos: {
          estado: 'Hidalgo',
          lugar: 'Parque Central',
          latitud: 20.1211,
          longitud: -98.7324,
          direccion: 'Av. Revolución 456',
          sector: 'Sector 2',
          subsector: 'SubSector D',
          horaInicioSuceso: '14:30',
          horaFinSuceso: '16:00',
          fechaSuceso: '2025-07-26',
          numeroAsistentes: 300,
          prioridad: 'Alta',
          condicionEvento: 'Finalizado',
          informacion: 'Pública',
          asunto: 'Evento cultural',
          hechos: 'Evento cultural con alta asistencia de público',
          acuerdos: 'Próximo evento programado para agosto',
          informo: 'Informante 2',
          fechaRecepcion: '2025-07-26',
          horaRecepcion: '14:00',
        },
      },
      {
        id: '3',
        fechaElaboracion: '26/07/2025',
        fechaSuceso: '2025-07-26',
        estado: 'Hidalgo',
        horaInicioSuceso: '08:00',
        horaFinSuceso: '09:30',
        prioridad: 'Baja',
        sector: 'Sector 3',
        numeroAsistentes: 50,
        estadoActual: 'NUEVO',
        borradorUsuario: 'Carlos Ramírez',
        datosCompletos: {
          estado: 'Hidalgo',
          lugar: 'Auditorio Municipal',
          latitud: 20.0511,
          longitud: -98.8024,
          direccion: 'Blvd. Felipe Angeles 789',
          sector: 'Sector 3',
          subsector: 'SubSector G',
          horaInicioSuceso: '08:00',
          horaFinSuceso: '09:30',
          fechaSuceso: '2025-07-26',
          numeroAsistentes: 50,
          prioridad: 'Baja',
          condicionEvento: 'Pendiente',
          informacion: 'Pública',
          asunto: 'Reunión vecinal',
          hechos: 'Reunión de vecinos para discutir temas de seguridad',
          acuerdos: 'Formar comité de vigilancia vecinal',
          informo: 'Informante 3',
          fechaRecepcion: '2025-07-26',
          horaRecepcion: '07:45',
        },
      },
      {
        id: '4',
        fechaElaboracion: '26/07/2025',
        fechaSuceso: '2025-07-26',
        estado: 'Hidalgo',
        horaInicioSuceso: '16:00',
        horaFinSuceso: '18:00',
        prioridad: 'Crítica',
        sector: 'Sector 4',
        numeroAsistentes: 500,
        estadoActual: 'NUEVO',
        borradorUsuario: 'Ana Torres',
        datosCompletos: {
          estado: 'Hidalgo',
          lugar: 'Estadio Municipal',
          latitud: 20.1411,
          longitud: -98.7124,
          direccion: 'Carretera Pachuca-Tulancingo Km 5',
          sector: 'Sector 4',
          subsector: 'SubSector J',
          horaInicioSuceso: '16:00',
          horaFinSuceso: '18:00',
          fechaSuceso: '2025-07-26',
          numeroAsistentes: 500,
          prioridad: 'Crítica',
          condicionEvento: 'En proceso',
          informacion: 'Pública',
          asunto: 'Evento deportivo masivo',
          hechos: 'Gran evento deportivo con alta concentración de personas',
          acuerdos: 'Reforzar seguridad y servicios médicos',
          informo: 'Informante 1',
          fechaRecepcion: '2025-07-26',
          horaRecepcion: '15:30',
        },
      },
      {
        id: '5',
        fechaElaboracion: '26/07/2025',
        fechaSuceso: '2025-07-26',
        estado: 'Hidalgo',
        horaInicioSuceso: '11:00',
        horaFinSuceso: '13:00',
        prioridad: 'Media',
        sector: 'Sector 1',
        numeroAsistentes: 200,
        estadoActual: 'NUEVO',
        borradorUsuario: 'Luis Hernández',
        datosCompletos: {
          estado: 'Hidalgo',
          lugar: 'Centro Comunitario',
          latitud: 20.0711,
          longitud: -98.7824,
          direccion: 'Calle Morelos 234',
          sector: 'Sector 1',
          subsector: 'SubSector B',
          horaInicioSuceso: '11:00',
          horaFinSuceso: '13:00',
          fechaSuceso: '2025-07-26',
          numeroAsistentes: 200,
          prioridad: 'Media',
          condicionEvento: 'Finalizado',
          informacion: 'Pública',
          asunto: 'Jornada de salud',
          hechos: 'Jornada de vacunación y servicios médicos gratuitos',
          acuerdos: 'Programar siguiente jornada en septiembre',
          informo: 'Informante 2',
          fechaRecepcion: '2025-07-26',
          horaRecepcion: '10:30',
        },
      },
    ];
  }

  buscar(): void {
    const termino = this.busqueda.toLowerCase().trim();
    if (!termino) {
      this.borradoresFiltrados = [...this.borradores];
    } else {
      this.borradoresFiltrados = this.borradores.filter(
        (borrador) =>
          borrador.estado.toLowerCase().includes(termino) ||
          borrador.fechaSuceso.includes(termino) ||
          borrador.fechaElaboracion.includes(termino) ||
          borrador.estadoActual.toLowerCase().includes(termino)
      );
    }
    this.paginaActual = 1;
  }

  get totalPaginas(): number {
    return Math.ceil(this.borradoresFiltrados.length / this.elementosPorPagina);
  }

  get borradorespaginados(): FichaBorrador[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.borradoresFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  editarBorrador(borrador: FichaBorrador): void {
    // Guardar el ID del borrador a editar
    localStorage.setItem('borrador_editar_id', borrador.id);
    // Navegar a la página de fichas para continuar editando
    this.router.navigate(['/fichas/registrar']);
  }

  eliminarBorrador(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este borrador?')) {
      this.borradores = this.borradores.filter((b) => b.id !== id);
      this.borradoresFiltrados = this.borradoresFiltrados.filter(
        (b) => b.id !== id
      );
      this.guardarEnLocalStorage();

      // Ajustar página si es necesario
      if (this.borradorespaginados.length === 0 && this.paginaActual > 1) {
        this.paginaActual--;
      }
    }
  }

  guardarEnLocalStorage(): void {
    localStorage.setItem('borradores_fichas', JSON.stringify(this.borradores));
  }

  verTutorial(): void {
    alert(
      'Tutorial:\n\n1. Aquí se guardan las fichas que no has completado.\n2. Puedes editarlas haciendo clic en el botón azul.\n3. Puedes eliminarlas haciendo clic en el botón rojo.\n4. Usa el buscador para encontrar borradores específicos.'
    );
  }
}
