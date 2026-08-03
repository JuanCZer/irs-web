import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import mapboxgl from 'mapbox-gl';
import { FichasService, FichasTodosDTO } from '../../services/fichas.service';
import { NavbarService } from '../../services/navbar.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environment/environment.local';


interface FichaConCoordenadas extends Omit<
  FichasTodosDTO,
  'latitude' | 'longitude'
> {
  latitude?: number | null;
  longitude?: number | null;
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
  private readonly MAPBOX_TOKEN = environment.mapboxToken;


  allReports: FichaConCoordenadas[] = [];
  visibleReports: FichaConCoordenadas[] = [];


  stateFilter: string = '';
  sectorFilter: string = '';
  conditionFilter: string = '';
  startDate: string = '';
  endDate: string = '';


  states: string[] = [
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

  sectors: string[] = [];
  conditions = ['Finalizado', 'En proceso', 'Pendiente', 'Cancelado'];


  loading = false;
  errorMessage = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private reportsService: FichasService,
    private navbarService: NavbarService,
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadUniqueSectors();
    this.subscribeToSidebarChanges();
  }

  ngAfterViewInit(): void {

    const self = this;
    (window as any).debugReports = {
      get mapReady(): boolean {
        return self.mapReady;
      },
      get allReports(): FichaConCoordenadas[] {
        return self.allReports;
      },
      get visibleReports(): FichaConCoordenadas[] {
        return self.visibleReports;
      },
      get markers(): mapboxgl.Marker[] {
        return self.markers;
      },
      get mapLoaded(): boolean {
        return !!self.map;
      },
    };


    this.initMap();


    setTimeout(() => {
      this.loadReports();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.subscriptions.unsubscribe();
  }




  private subscribeToSidebarChanges(): void {
    this.subscriptions.add(
      this.navbarService.sidebarCollapsed$.subscribe((collapsed) => {

        setTimeout(() => {
          try {
            if (this.map) {
              this.map.resize();
            }
          } catch (e) {
            return;
          }
        }, 350);
      }),
    );
  }

  private setDefaultDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  private loadUniqueSectors(): void {

    this.sectors = ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'];
  }

  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';

    this.reportsService
      .getReportsByDateRange(this.startDate, this.endDate)
      .then((reports) => {

        this.allReports = reports.map(
          (report: any, index: number): FichaConCoordenadas => {
            const rawLatitude = report.latitude;
            const rawLongitude = report.longitude;
            const parsedLatitude = rawLatitude ? parseFloat(rawLatitude) : null;
            const parsedLongitude = rawLongitude ? parseFloat(rawLongitude) : null;
            const result: any = { ...report };
            result.latitude =
              !isNaN(parsedLatitude!) && parsedLatitude !== null
                ? parsedLatitude
                : null;
            result.longitude =
              !isNaN(parsedLongitude!) && parsedLongitude !== null
                ? parsedLongitude
                : null;

            return result as FichaConCoordenadas;
          },
        );
        this.loading = false;
        this.applyFilters();
      })
      .catch((error) => {
        this.loading = false;
        this.errorMessage =
          'Error al cargar fichas del servidor. Intenta de nuevo más tarde.';
      });
  }

  applyFilters(): void {
    this.visibleReports = this.allReports.filter((report) => {

      const matchesState =
        !this.stateFilter || report.state === this.stateFilter;


      const matchesSector =
        !this.sectorFilter || report.sector === this.sectorFilter;


      const matchesCondition =
        !this.conditionFilter ||
        (report.currentStatus && report.currentStatus === this.conditionFilter);

      return matchesState && matchesSector && matchesCondition;
    });


    if (this.mapReady && this.map) {
      if (this.map.isStyleLoaded()) {
        this.updateMarkers();
      } else {
        this.map.once('style.load', () => {
          this.updateMarkers();
        });
      }
    } else {

      setTimeout(() => {
        if (this.mapReady && this.map && this.map.isStyleLoaded()) {
          this.updateMarkers();
        }
      }, 500);
    }
  }

  private initMap(): void {
    mapboxgl.accessToken = this.MAPBOX_TOKEN;


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

      if (this.visibleReports.length > 0) {
        this.updateMarkers();
      }
    });


    this.map.addControl(new mapboxgl.NavigationControl());
  }

  private updateMarkers(): void {

    if (!this.map) {
      return;
    }


    this.markers.forEach((marker) => {
      try {
        marker.remove();
      } catch (e) {}
    });
    this.markers = [];


    if (!this.map.isStyleLoaded()) {
      setTimeout(() => this.updateMarkers(), 500);
      return;
    }

    let markerCount = 0;
    let missingCoordinatesCount = 0;


    this.visibleReports.forEach((report) => {

      if (
        report.latitude !== null &&
        report.latitude !== undefined &&
        report.longitude !== null &&
        report.longitude !== undefined &&
        typeof report.latitude === 'number' &&
        typeof report.longitude === 'number' &&
        !isNaN(report.latitude) &&
        !isNaN(report.longitude)
      ) {

        const color = '#466b7b';

        try {
          const marker = new mapboxgl.Marker({
            color: color,
            scale: 1,
          })
            .setLngLat([report.longitude, report.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div class="popup-content">
                  <strong>${report.id} - ${report.referenceNumber}</strong><br/>
                  <small>${report.place} - ${report.state}</small><br/>
                  <small>Sector: ${report.sector}</small><br/>
                  <small>Fecha: ${report.eventDate}</small>
                </div>`,
              ),
            )
            .addTo(this.map);

          this.markers.push(marker);
          markerCount++;
        } catch {}
      } else {
        missingCoordinatesCount++;
      }
    });

    if (this.markers.length > 0) {
      this.fitMapToMarkers();
    }
  }

  private fitMapToMarkers(): void {
    if (this.visibleReports.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    this.visibleReports.forEach((report) => {
      if (report.latitude && report.longitude) {
        bounds.extend([report.longitude, report.latitude]);
      }
    });

    this.map.fitBounds(bounds, { padding: 50 });
  }

  clearFilters(): void {
    this.setDefaultDates();
    this.stateFilter = '';
    this.sectorFilter = '';
    this.conditionFilter = '';

    this.loadReports();
  }

  countReportsWithCoordinates(): number {
    return this.visibleReports.filter((f) => f.latitude && f.longitude).length;
  }

  selectReport(report: FichaConCoordenadas): void {
    if (report.latitude && report.longitude) {
      this.map.flyTo({
        center: [report.longitude, report.latitude],
        zoom: 12,
      });


      const marker = this.markers.find((m) => {
        const lngLat = m.getLngLat();
        return lngLat.lat === report.latitude && lngLat.lng === report.longitude;
      });

      if (marker) {
        marker.togglePopup();
      }
    }
  }
}
