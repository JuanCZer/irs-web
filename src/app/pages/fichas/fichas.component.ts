import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../environment/environment.local';
import { CatalogosService, CatCondicion, CatInformacion, CatPrioridad, CatSector, CatSubsector } from '../../services/catalogos.service';

interface FichaInformativa {
  state: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  sector: string;
  subsector: string;
  eventStartTime: string;
  eventEndTime: string;
  eventDate: string;
  attendeeCount: number | null;
  priority: string;
  eventCondition: string;
  information: string;
  subject: string;
  facts: string;
  agreements: string;
  reporter: string;
  receptionDate: string;
  receptionTime: string;
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

  report: FichaInformativa = {
    state: '',
    place: '',
    latitude: null,
    longitude: null,
    address: '',
    sector: '',
    subsector: '',
    eventStartTime: '',
    eventEndTime: '',
    eventDate: this.getCurrentDate(),
    attendeeCount: null,
    priority: '',
    eventCondition: '',
    information: '',
    subject: '',
    facts: '',
    agreements: '',
    reporter: '',
    receptionDate: this.getCurrentDate(),
    receptionTime: this.getCurrentTime(),
  };

  mexicanStates = [
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

  sectors: CatSector[] = [];
  subsectors: CatSubsector[] = [];
  priorities: CatPrioridad[] = [];
  eventConditions: CatCondicion[] = [];
  informationTypes: CatInformacion[] = [];

  informants: string[] = ['Policía', 'Ciudadano', 'Medio de Comunicación', 'Otro'];

  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private catalogsService: CatalogosService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadDraftIfPresent();
    await this.loadSectors();
    await this.loadPriorities();
    await this.loadEventConditions();
    await this.loadInformation();
  }

  async loadSectors() {
    try {
      this.sectors = await this.catalogsService.getSectors();
      console.log('Sectores cargados:', this.sectors);
    } catch (error) {
      this.errorMessage =
        'Error al cargar el catálogo de sectores. Por favor, recargue la página.';
    }
  }

  async loadSubsectors() {
    try {
      this.subsectors =
        await this.catalogsService.getSubsectorsBySector(
          this.sectors.find((s) => s.sector === this.report.sector)
            ?.sectorCategoryId!,
        );
    } catch (error) {
      this.errorMessage =
        'Error al cargar el catálogo de subsectores. Por favor, recargue la página.';
    }
  }

  async loadPriorities() {
    try {
      this.priorities = await this.catalogsService.getPriorities();
    } catch (error) {
      this.errorMessage =
        'Error al cargar el catálogo de prioridades. Por favor, recargue la página.';
    }
  }

  async loadEventConditions() {
    try {
      this.eventConditions = await this.catalogsService.getConditions();
    } catch (error) {
      this.errorMessage =
        'Error al cargar el catálogo de condiciones del evento. Por favor, recargue la página.';
    }
  }

  async loadInformation() {
    try {
      this.informationTypes =
        await this.catalogsService.getInformationItems();
    } catch (error) {
      this.errorMessage =
        'Error al cargar el catálogo de tipos de informantes. Por favor, recargue la página.';
    }
  }

  private loadDraftIfPresent(): void {

    const draftId = localStorage.getItem('borrador_editar_id');

    if (draftId) {

      const savedDrafts = localStorage.getItem('borradores_fichas');

      if (savedDrafts) {
        const drafts = JSON.parse(savedDrafts);
        const draft = drafts.find((b: any) => b.id === draftId);

        if (draft && draft.completeData) {

          this.report = { ...this.report, ...draft.completeData };


          if (this.report.sector) {
            this.onSectorChange(this.report.sector);
          }


          if (this.report.latitude && this.report.longitude) {
            setTimeout(() => {
              this.updateMapMarker(
                this.report.latitude!,
                this.report.longitude!,
              );
            }, 500);
          }

          this.successMessage = 'Borrador cargado correctamente';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      }


      localStorage.removeItem('borrador_editar_id');
    }
  }

  ngAfterViewInit(): void {

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

    mapboxgl.accessToken = this.MAPBOX_TOKEN;


    const centerLat = 23.6345;
    const centerLng = -102.5528;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 5,
    });


    this.map.on('load', () => {

      this.marker = new mapboxgl.Marker({
        draggable: true,
        color: '#466b7b',
        scale: 1.2,
      })
        .setLngLat([centerLng, centerLat])
        .addTo(this.map);


      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(
        '<strong>Arrastre para ubicar</strong><br/>o haga clic en el mapa',
      );
      this.marker.setPopup(popup);


      setTimeout(() => {
        this.marker.togglePopup();
      }, 500);


      this.marker.on('dragend', () => {
        const lngLat = this.marker.getLngLat();
        this.report.latitude = Number(lngLat.lat.toFixed(6));
        this.report.longitude = Number(lngLat.lng.toFixed(6));


        popup.setHTML(
          `<strong>Ubicación seleccionada</strong><br/>` +
            `Lat: ${this.report.latitude}<br/>` +
            `Lng: ${this.report.longitude}`,
        );
      });


      this.map.on('click', (e) => {
        this.marker.setLngLat(e.lngLat);
        this.report.latitude = Number(e.lngLat.lat.toFixed(6));
        this.report.longitude = Number(e.lngLat.lng.toFixed(6));


        popup.setHTML(
          `<strong>Ubicación selected</strong><br/>` +
            `Lat: ${this.report.latitude}<br/>` +
            `Lng: ${this.report.longitude}`,
        );
        const markerPopup = this.marker.getPopup();
        if (markerPopup && !markerPopup.isOpen()) {
          this.marker.togglePopup();
        }
      });
    });


    this.map.addControl(new mapboxgl.NavigationControl());
  }

  async onSectorChange(selectedSector: string | null): Promise<void> {
  this.report.subsector = null as any;
  this.subsectors = [];

  if (!selectedSector) return;

  await this.loadSubsectors();
  }

  updateMarkerFromInput(): void {
    if (this.report.latitude && this.report.longitude && this.marker && this.map) {
      this.marker.setLngLat([this.report.longitude, this.report.latitude]);
      this.map.flyTo({
        center: [this.report.longitude, this.report.latitude],
        zoom: 12,
      });
    }
  }

  private updateMapMarker(lat: number, lng: number): void {
    if (this.marker && this.map) {
      this.marker.setLngLat([lng, lat]);
      this.map.flyTo({
        center: [lng, lat],
        zoom: 12,
      });


      const popup = this.marker.getPopup();
      if (popup) {
        popup.setHTML(
          `<strong>Ubicación del draft</strong><br/>` +
            `Lat: ${lat}<br/>` +
            `Lng: ${lng}`,
        );
        if (!popup.isOpen()) {
          this.marker.togglePopup();
        }
      }
    }
  }

  private getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  validateForm(): boolean {
    if (!this.report.state) {
      this.errorMessage = 'El campo Estado es obligatorio';
      return false;
    }
    if (!this.report.place) {
      this.errorMessage = 'El campo Lugar es obligatorio';
      return false;
    }
    if (!this.report.sector) {
      this.errorMessage = 'El campo Sector es obligatorio';
      return false;
    }
    if (!this.report.eventDate) {
      this.errorMessage = 'La Fecha del suceso es obligatoria';
      return false;
    }
    if (!this.report.priority) {
      this.errorMessage = 'La Prioridad es obligatoria';
      return false;
    }
    return true;
  }

  saveDraft(): void {
    this.successMessage = 'Ficha guardada como borrador';
    this.errorMessage = '';

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  saveAndValidate(): void {
    if (!this.validateForm()) {
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
      return;
    }
    this.successMessage = 'Ficha guardada y validada correctamente';
    this.errorMessage = '';

    setTimeout(() => {
      this.successMessage = '';
      this.clearForm();
    }, 3000);
  }

  exit(): void {
    if (
      confirm(
        '¿Está seguro de que desea salir? Los cambios no guardados se perderán.',
      )
    ) {
      this.router.navigate(['/inicio']);
    }
  }

  clearForm(): void {
    this.report = {
      state: '',
      place: '',
      latitude: null,
      longitude: null,
      address: '',
      sector: '',
      subsector: '',
      eventStartTime: '',
      eventEndTime: '',
      eventDate: this.getCurrentDate(),
      attendeeCount: null,
      priority: '',
      eventCondition: '',
      information: '',
      subject: '',
      facts: '',
      agreements: '',
      reporter: '',
      receptionDate: this.getCurrentDate(),
      receptionTime: this.getCurrentTime(),
    };
    this.subsectors = [];
  }
}
