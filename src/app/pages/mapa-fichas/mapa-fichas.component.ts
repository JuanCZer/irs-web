import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import mapboxgl from 'mapbox-gl';
import { FichasService, FichasTodosDTO } from '../../services/fichas.service';

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

  constructor(private fichasService: FichasService) {}

  ngOnInit(): void {
    this.establecerFechasDefecto();
    this.cargarSectoresUnicos();
  }

  ngAfterViewInit(): void {
    console.log('🔧 ngAfterViewInit() ejecutado');

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
      console.log('⏱️ Ejecutando cargarFichas() después de 500ms...');
      this.cargarFichas();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
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
    console.log('📥 cargarFichas() - Iniciando carga desde API...');
    console.log('📅 Con rango de fechas:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
    });
    console.log('mapReady:', this.mapReady);
    console.log('map existe:', !!this.map);

    this.cargando = true;
    this.mensajeError = '';

    this.fichasService
      .obtenerFichasPorRangoFechas(this.fechaInicio, this.fechaFin)
      .then((fichas) => {
        console.log(
          '✅ Fichas obtenidas del API (con filtro de fechas):',
          fichas,
        );
        console.log('📊 Total fichas:', fichas.length);

        // Convertir string de latitud/longitud a number y validar
        this.todasLasFichas = fichas.map(
          (ficha: any, index: number): FichaConCoordenadas => {
            const latitudRaw = ficha.latitud;
            const longitudRaw = ficha.longitud;
            const latitudParsed = latitudRaw ? parseFloat(latitudRaw) : null;
            const longitudParsed = longitudRaw ? parseFloat(longitudRaw) : null;

            console.log(`Ficha ${index} (${ficha.id}):`, {
              latitudRaw,
              latitudParsed,
              longitudRaw,
              longitudParsed,
              latitudValid: !isNaN(latitudParsed!) && latitudParsed !== null,
              longitudValid: !isNaN(longitudParsed!) && longitudParsed !== null,
            });

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

        console.log('✅ Fichas procesadas:', this.todasLasFichas.length);
        console.log(
          '🧭 Fichas con coordenadas válidas:',
          this.todasLasFichas.filter((f) => f.latitud && f.longitud).length,
        );

        this.cargando = false;
        this.aplicarFiltros();
      })
      .catch((error) => {
        console.error('❌ Error al cargar fichas:', error);
        this.cargando = false;
        this.mensajeError =
          'Error al cargar fichas del servidor. Intenta de nuevo más tarde.';
      });
  }

  aplicarFiltros(): void {
    console.log(
      '🔍 aplicarFiltros() - Filtrando por estado/sector/condición...',
    );
    console.log('Filtros activos:', {
      estado: this.filtroEstado || 'todos',
      sector: this.filtroSector || 'todos',
      condicion: this.filtroCondicion || 'todos',
    });

    // Nota: El filtrado por fechas ya se hizo en el servidor
    // Aquí solo filtramos por estado, sector y condición
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

    console.log('✅ Filtrado completado:', {
      totalFichas: this.todasLasFichas.length,
      fichasVisibles: this.fichasVisible.length,
      conCoordenadas: this.fichasVisible.filter((f) => f.latitud && f.longitud)
        .length,
    });

    // Actualizar marcadores del mapa (si el mapa está listo)
    if (this.mapReady && this.map) {
      console.log('📍 Mapa listo, actualizando marcadores...');
      if (this.map.isStyleLoaded()) {
        console.log(
          '🎨 Estilo del mapa cargado, llamando actualizarMarcadores()',
        );
        this.actualizarMarcadores();
      } else {
        console.warn('⚠️ Estilo del mapa aún cargándose, esperando...');
        this.map.once('style.load', () => {
          console.log('🎨 Estilo cargado, actualizando marcadores ahora');
          this.actualizarMarcadores();
        });
      }
    } else {
      console.warn('⚠️ Mapa no está listo aún', {
        mapReady: this.mapReady,
        mapExists: !!this.map,
      });
      // Fallback: reintentar en 500ms
      setTimeout(() => {
        if (this.mapReady && this.map && this.map.isStyleLoaded()) {
          console.log(
            '🔄 Reintentando actualizarMarcadores() después de espera',
          );
          this.actualizarMarcadores();
        }
      }, 500);
    }
  }

  private initMap(): void {
    console.log('🗺️ Inicializando mapa...');
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
      console.log('✅ Mapa cargado correctamente');
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
    console.log('🗺️ actualizarMarcadores() llamado');
    console.log('mapReady:', this.mapReady);
    console.log('this.map:', !!this.map);

    // Validar que el mapa esté inicializado
    if (!this.map) {
      console.error('❌ Mapa no inicializado');
      return;
    }

    // Limpiar marcadores anteriores
    console.log('🧹 Limpiando', this.markers.length, 'marcadores anteriores');
    this.markers.forEach((marker) => {
      try {
        marker.remove();
      } catch (e) {
        console.warn('Error removiendo marcador:', e);
      }
    });
    this.markers = [];

    // Validar que el mapa haya cargado el estilo
    if (!this.map.isStyleLoaded()) {
      console.warn('⚠️ Mapa aún no ha cargado el estilo, reintentando...');
      setTimeout(() => this.actualizarMarcadores(), 500);
      return;
    }

    console.log('📍 Procesando', this.fichasVisible.length, 'fichas...');

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
          console.log(`✏️ Creando marcador para ficha ${ficha.id}:`, {
            latitud: ficha.latitud,
            longitud: ficha.longitud,
          });

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
          console.error('❌ Error al crear marcador:', error, ficha);
        }
      } else {
        contadorSinCoordenadas++;
        console.warn('⚠️ Ficha sin coordenadas válidas:', {
          id: ficha.id,
          latitud: ficha.latitud,
          longitud: ficha.longitud,
          tipoLat: typeof ficha.latitud,
          tipoLng: typeof ficha.longitud,
        });
      }
    });

    console.log('✅ Resultado:', {
      marcadoresCreados: contadorMarcadores,
      fichasSinCoordenadas: contadorSinCoordenadas,
      totalProcesadas: this.fichasVisible.length,
    });

    // Ajustar zoom si hay marcadores
    if (this.markers.length > 0) {
      console.log('🎯 Ajustando zoom a marcadores');
      this.ajustarZoomAMarcadores();
    } else {
      console.warn('⚠️ No hay marcadores para mostrar');
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
