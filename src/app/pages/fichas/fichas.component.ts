import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../environment/environment.local';

interface FichaInformativa {
  estado: string;
  lugar: string;
  latitud: number | null;
  longitud: number | null;
  direccion: string;
  sector: string;
  subsector: string;
  horaInicioSuceso: string;
  horaFinSuceso: string;
  fechaSuceso: string;
  numeroAsistentes: number | null;
  prioridad: string;
  condicionEvento: string;
  informacion: string;
  asunto: string;
  hechos: string;
  acuerdos: string;
  informo: string;
  fechaRecepcion: string;
  horaRecepcion: string;
}

@Component({
  selector: 'app-fichas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fichas.component.html',
  styleUrl: './fichas.component.less',
})
export class FichasComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
  private readonly MAPBOX_TOKEN = environment.mapboxToken;

  ficha: FichaInformativa = {
    estado: '',
    lugar: '',
    latitud: null,
    longitud: null,
    direccion: '',
    sector: '',
    subsector: '',
    horaInicioSuceso: '',
    horaFinSuceso: '',
    fechaSuceso: this.obtenerFechaActual(),
    numeroAsistentes: null,
    prioridad: '',
    condicionEvento: '',
    informacion: '',
    asunto: '',
    hechos: '',
    acuerdos: '',
    informo: '',
    fechaRecepcion: this.obtenerFechaActual(),
    horaRecepcion: this.obtenerHoraActual(),
  };

  estadosMexico = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Coahuila',
    'Colima',
    'Durango',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'México',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas',
  ];

  sectores = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'];
  subsectores: string[] = [];

  prioridades = ['Baja', 'Media', 'Alta', 'Crítica'];

  condicionesEvento = ['Finalizado', 'En proceso', 'Pendiente', 'Cancelado'];

  tiposInformacion = ['Pública', 'Confidencial', 'Restringida'];

  informantes = ['Informante 1', 'Informante 2', 'Informante 3'];

  mensajeExito = '';
  mensajeError = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarBorradorSiExiste();
  }

  private cargarBorradorSiExiste(): void {
    // Verificar si hay un borrador para editar
    const borradorId = localStorage.getItem('borrador_editar_id');

    if (borradorId) {
      // Cargar todos los borradores
      const borradoresGuardados = localStorage.getItem('borradores_fichas');

      if (borradoresGuardados) {
        const borradores = JSON.parse(borradoresGuardados);
        const borrador = borradores.find((b: any) => b.id === borradorId);

        if (borrador && borrador.datosCompletos) {
          // Cargar los datos completos del borrador en el formulario
          this.ficha = { ...this.ficha, ...borrador.datosCompletos };

          // Actualizar subsectores si hay un sector seleccionado
          if (this.ficha.sector) {
            this.onSectorChange();
          }

          // Si hay coordenadas, actualizar el mapa después de que se inicialice
          if (this.ficha.latitud && this.ficha.longitud) {
            setTimeout(() => {
              this.actualizarMarcadorMapa(
                this.ficha.latitud!,
                this.ficha.longitud!,
              );
            }, 500);
          }

          this.mensajeExito = 'Borrador cargado correctamente';
          setTimeout(() => {
            this.mensajeExito = '';
          }, 3000);
        }
      }

      // Limpiar el flag de localStorage
      localStorage.removeItem('borrador_editar_id');
    }
  }

  ngAfterViewInit(): void {
    // Esperar a que el DOM esté completamente renderizado
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Configurar el token de Mapbox
    mapboxgl.accessToken = this.MAPBOX_TOKEN;

    // Centro de México
    const centerLat = 23.6345;
    const centerLng = -102.5528;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 5,
    });

    // Esperar a que el mapa esté completamente cargado
    this.map.on('load', () => {
      // Crear marcador draggable con popup
      this.marker = new mapboxgl.Marker({
        draggable: true,
        color: '#667eea',
        scale: 1.2,
      })
        .setLngLat([centerLng, centerLat])
        .addTo(this.map);

      // Agregar popup al marcador
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(
        '<strong>Arrastre para ubicar</strong><br/>o haga clic en el mapa',
      );
      this.marker.setPopup(popup);

      // Mostrar popup inicialmente
      setTimeout(() => {
        this.marker.togglePopup();
      }, 500);

      // Actualizar coordenadas al arrastrar el marcador
      this.marker.on('dragend', () => {
        const lngLat = this.marker.getLngLat();
        this.ficha.latitud = Number(lngLat.lat.toFixed(6));
        this.ficha.longitud = Number(lngLat.lng.toFixed(6));

        // Actualizar popup con las coordenadas
        popup.setHTML(
          `<strong>Ubicación seleccionada</strong><br/>` +
            `Lat: ${this.ficha.latitud}<br/>` +
            `Lng: ${this.ficha.longitud}`,
        );
      });

      // Permitir click en el mapa para mover el marcador
      this.map.on('click', (e) => {
        this.marker.setLngLat(e.lngLat);
        this.ficha.latitud = Number(e.lngLat.lat.toFixed(6));
        this.ficha.longitud = Number(e.lngLat.lng.toFixed(6));

        // Mostrar popup con las coordenadas
        popup.setHTML(
          `<strong>Ubicación seleccionada</strong><br/>` +
            `Lat: ${this.ficha.latitud}<br/>` +
            `Lng: ${this.ficha.longitud}`,
        );
        const markerPopup = this.marker.getPopup();
        if (markerPopup && !markerPopup.isOpen()) {
          this.marker.togglePopup();
        }
      });
    });

    // Agregar controles de navegación
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  onSectorChange(): void {
    // Simulación de subsectores según el sector
    const subsectoresMap: { [key: string]: string[] } = {
      'Sector 1': ['SubSector A', 'SubSector B', 'SubSector C'],
      'Sector 2': ['SubSector D', 'SubSector E', 'SubSector F'],
      'Sector 3': ['SubSector G', 'SubSector H', 'SubSector I'],
      'Sector 4': ['SubSector J', 'SubSector K', 'SubSector L'],
    };
    this.subsectores = subsectoresMap[this.ficha.sector] || [];
    this.ficha.subsector = '';
  }

  actualizarMarcadorDesdeInput(): void {
    if (this.ficha.latitud && this.ficha.longitud && this.marker && this.map) {
      this.marker.setLngLat([this.ficha.longitud, this.ficha.latitud]);
      this.map.flyTo({
        center: [this.ficha.longitud, this.ficha.latitud],
        zoom: 12,
      });
    }
  }

  private actualizarMarcadorMapa(lat: number, lng: number): void {
    if (this.marker && this.map) {
      this.marker.setLngLat([lng, lat]);
      this.map.flyTo({
        center: [lng, lat],
        zoom: 12,
      });

      // Actualizar popup con las coordenadas
      const popup = this.marker.getPopup();
      if (popup) {
        popup.setHTML(
          `<strong>Ubicación del borrador</strong><br/>` +
            `Lat: ${lat}<br/>` +
            `Lng: ${lng}`,
        );
        if (!popup.isOpen()) {
          this.marker.togglePopup();
        }
      }
    }
  }

  private obtenerFechaActual(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private obtenerHoraActual(): string {
    const ahora = new Date();
    const hours = String(ahora.getHours()).padStart(2, '0');
    const minutes = String(ahora.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  validarFormulario(): boolean {
    if (!this.ficha.estado) {
      this.mensajeError = 'El campo Estado es obligatorio';
      return false;
    }
    if (!this.ficha.lugar) {
      this.mensajeError = 'El campo Lugar es obligatorio';
      return false;
    }
    if (!this.ficha.sector) {
      this.mensajeError = 'El campo Sector es obligatorio';
      return false;
    }
    if (!this.ficha.fechaSuceso) {
      this.mensajeError = 'La Fecha del suceso es obligatoria';
      return false;
    }
    if (!this.ficha.prioridad) {
      this.mensajeError = 'La Prioridad es obligatoria';
      return false;
    }
    return true;
  }

  guardarBorrador(): void {
    this.mensajeExito = 'Ficha guardada como borrador';
    this.mensajeError = '';

    setTimeout(() => {
      this.mensajeExito = '';
    }, 3000);
  }

  guardarYValidar(): void {
    if (!this.validarFormulario()) {
      setTimeout(() => {
        this.mensajeError = '';
      }, 5000);
      return;
    }
    this.mensajeExito = 'Ficha guardada y validada correctamente';
    this.mensajeError = '';

    setTimeout(() => {
      this.mensajeExito = '';
      this.limpiarFormulario();
    }, 3000);
  }

  salir(): void {
    if (
      confirm(
        '¿Está seguro de que desea salir? Los cambios no guardados se perderán.',
      )
    ) {
      this.router.navigate(['/inicio']);
    }
  }

  limpiarFormulario(): void {
    this.ficha = {
      estado: '',
      lugar: '',
      latitud: null,
      longitud: null,
      direccion: '',
      sector: '',
      subsector: '',
      horaInicioSuceso: '',
      horaFinSuceso: '',
      fechaSuceso: this.obtenerFechaActual(),
      numeroAsistentes: null,
      prioridad: '',
      condicionEvento: '',
      informacion: '',
      asunto: '',
      hechos: '',
      acuerdos: '',
      informo: '',
      fechaRecepcion: this.obtenerFechaActual(),
      horaRecepcion: this.obtenerHoraActual(),
    };
    this.subsectores = [];
  }
}
