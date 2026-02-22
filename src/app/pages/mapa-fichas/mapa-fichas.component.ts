import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import mapboxgl from 'mapbox-gl';
import { FichasService, FichasTodosDTO } from '../../services/fichas.service';
import { NavbarService } from '../../services/navbar.service';
import { Subscription } from 'rxjs';

// Interfaz extendida para manejar coordenadas numéricas
interface FichaConCoordenadas extends Omit<
  FichasTodosDTO,
  'latitud' | 'longitud'
> {
  latitud?: number | null;
  longitud?: number | null;
}

@Component({
  selector: 'app-mapa-fichas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-fichas.component.html',
  styleUrl: './mapa-fichas.component.less',
})
export class MapaFichasComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private mapReady = false;
  private readonly MAPBOX_TOKEN =
    'pk.eyJ1IjoianVhbmN6ZXJvbmciLCJhIjoiY21lbTRuY3pwMHAzdjJub294eWM3ZDNxeiJ9.GR7kio2VVQvxV55zolMCKQ';

  // Datos de fichas
  todasLasFichas: FichaConCoordenadas[] = [];
  fichasVisible: FichaConCoordenadas[] = [];

  // Filtros
  filtroEstado: string = '';
  filtroSector: string = '';
  filtroCondicion: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Listas para dropdowns
  estados: string[] = [
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

  sectores: string[] = [];
  condiciones = ['Finalizado', 'En proceso', 'Pendiente', 'Cancelado'];

  // Control de carga
  cargando = false;
  mensajeError = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fichasService: FichasService,
    private navbarService: NavbarService
  ) {}

  ngOnInit(): void {
    this.establecerFechasDefecto();
    this.cargarSectoresUnicos();
    this.subscribeToSidebarChanges();
  }

  ngAfterViewInit(): void {

    // Exponer datos para debugging en consola
    const self = this;
    (window as any).fichasDebug = {
      get mapReady(): boolean {
        return self.mapReady;
      },
      get todasLasFichas(): FichaConCoordenadas[] {
        return self.todasLasFichas;
      },
      get fichasVisible(): FichaConCoordenadas[] {
        return self.fichasVisible;
      },
      get markers(): mapboxgl.Marker[] {
        return self.markers;
      },
      get mapLoaded(): boolean {
        return !!self.map;
      },
    };

    // Primero inicializar el mapa
    this.initMap();

    // Luego cargar las fichas (el mapa estará listo cuando se carguen)
    setTimeout(() => {
      this.cargarFichas();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.subscriptions.unsubscribe();
  }

  /**
   * Subscribe to sidebar collapse changes to resize the map and adjust layout.
   */
  private subscribeToSidebarChanges(): void {
    this.subscriptions.add(
      this.navbarService.sidebarCollapsed$.subscribe((collapsed) => {
        // Allow CSS transition to finish before resizing map
        setTimeout(() => {
          try {
            if (this.map) {
              this.map.resize();
            }
          } catch (e) {
            return;
          }
        }, 350);
      })
    );
  }

  private establecerFechasDefecto(): void {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.fechaInicio = hace30Dias.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  private cargarSectoresUnicos(): void {
    // Esta lista se actualizaría con los datos reales del API
    this.sectores = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'];
  }

  cargarFichas(): void {

    this.cargando = true;
    this.mensajeError = '';

    this.fichasService
      .obtenerFichasPorRangoFechas(this.fechaInicio, this.fechaFin)
      .then((fichas) => {

        // Convertir string de latitud/longitud a number y validar
        this.todasLasFichas = fichas.map(
          (ficha: any, index: number): FichaConCoordenadas => {
            const latitudRaw = ficha.latitud;
            const longitudRaw = ficha.longitud;
            const latitudParsed = latitudRaw ? parseFloat(latitudRaw) : null;
            const longitudParsed = longitudRaw ? parseFloat(longitudRaw) : null;
            const result: any = { ...ficha };
            result.latitud =
              !isNaN(latitudParsed!) && latitudParsed !== null
                ? latitudParsed
                : null;
            result.longitud =
              !isNaN(longitudParsed!) && longitudParsed !== null
                ? longitudParsed
                : null;

            return result as FichaConCoordenadas;
          },
        );
        this.cargando = false;
        this.aplicarFiltros();
      })
      .catch((error) => {
        this.cargando = false;
        this.mensajeError =
          'Error al cargar fichas del servidor. Intenta de nuevo más tarde.';
      });
  }

  aplicarFiltros(): void {
    this.fichasVisible = this.todasLasFichas.filter((ficha) => {
      // Filtro de estado
      const cumpleEstado =
        !this.filtroEstado || ficha.estado === this.filtroEstado;

      // Filtro de sector
      const cumpleSector =
        !this.filtroSector || ficha.sector === this.filtroSector;

      // Filtro de condición
      const cumpleCondicion =
        !this.filtroCondicion ||
        (ficha.estadoActual && ficha.estadoActual === this.filtroCondicion);

      return cumpleEstado && cumpleSector && cumpleCondicion;
    });

    // Actualizar marcadores del mapa (si el mapa está listo)
    if (this.mapReady && this.map) {
      if (this.map.isStyleLoaded()) {
        this.actualizarMarcadores();
      } else {
        this.map.once('style.load', () => {
          this.actualizarMarcadores();
        });
      }
    } else {
      // Fallback: reintentar en 500ms
      setTimeout(() => {
        if (this.mapReady && this.map && this.map.isStyleLoaded()) {
          this.actualizarMarcadores();
        }
      }, 500);
    }
  }

  private initMap(): void {
    mapboxgl.accessToken = this.MAPBOX_TOKEN;

    // Centro de México
    const centerLat = 23.6345;
    const centerLng = -102.5528;

    this.map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 5,
    });

    this.map.on('load', () => {
      this.mapReady = true;
      // Si las fichas ya se cargaron, actualizar marcadores
      if (this.fichasVisible.length > 0) {
        this.actualizarMarcadores();
      }
    });

    // Agregar controles de navegación
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  private actualizarMarcadores(): void {

    // Validar que el mapa esté inicializado
    if (!this.map) {
      return;
    }

    // Limpiar marcadores anteriores
    this.markers.forEach((marker) => {
      try {
        marker.remove();
      } catch (e) {
      }
    });
    this.markers = [];

    // Validar que el mapa haya cargado el estilo
    if (!this.map.isStyleLoaded()) {
      setTimeout(() => this.actualizarMarcadores(), 500);
      return;
    }

    let contadorMarcadores = 0;
    let contadorSinCoordenadas = 0;

    // Agregar nuevos marcadores para las fichas filtradas
    this.fichasVisible.forEach((ficha) => {
      // Validar que las coordenadas sean números válidos
      if (
        ficha.latitud !== null &&
        ficha.latitud !== undefined &&
        ficha.longitud !== null &&
        ficha.longitud !== undefined &&
        typeof ficha.latitud === 'number' &&
        typeof ficha.longitud === 'number' &&
        !isNaN(ficha.latitud) &&
        !isNaN(ficha.longitud)
      ) {
        // Color por defecto (azul púrpura)
        const color = '#667eea';

        try {
          const marker = new mapboxgl.Marker({
            color: color,
            scale: 1,
          })
            .setLngLat([ficha.longitud, ficha.latitud])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div class="popup-content">
                  <strong>${ficha.id} - ${ficha.folio}</strong><br/>
                  <small>${ficha.lugar} - ${ficha.estado}</small><br/>
                  <small>Sector: ${ficha.sector}</small><br/>
                  <small>Fecha: ${ficha.fechaSuceso}</small>
                </div>`,
              ),
            )
            .addTo(this.map);

          this.markers.push(marker);
          contadorMarcadores++;
        } catch (error) {
        }
      } else {
        contadorSinCoordenadas++;
      }
    });
    // Ajustar zoom si hay marcadores
    if (this.markers.length > 0) {
      this.ajustarZoomAMarcadores();
    } else {
    }
  }

  private ajustarZoomAMarcadores(): void {
    if (this.fichasVisible.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    this.fichasVisible.forEach((ficha) => {
      if (ficha.latitud && ficha.longitud) {
        bounds.extend([ficha.longitud, ficha.latitud]);
      }
    });

    this.map.fitBounds(bounds, { padding: 50 });
  }

  limpiarFiltros(): void {
    this.establecerFechasDefecto();
    this.filtroEstado = '';
    this.filtroSector = '';
    this.filtroCondicion = '';
    // Recargar fichas con nuevas fechas
    this.cargarFichas();
  }

  contarFichasConCoordenadas(): number {
    return this.fichasVisible.filter((f) => f.latitud && f.longitud).length;
  }

  seleccionarFicha(ficha: FichaConCoordenadas): void {
    if (ficha.latitud && ficha.longitud) {
      this.map.flyTo({
        center: [ficha.longitud, ficha.latitud],
        zoom: 12,
      });

      // Abrir popup del marcador
      const marker = this.markers.find((m) => {
        const lngLat = m.getLngLat();
        return lngLat.lat === ficha.latitud && lngLat.lng === ficha.longitud;
      });

      if (marker) {
        marker.togglePopup();
      }
    }
  }
}
