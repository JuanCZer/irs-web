import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  DroneFlight,
  DroneRecord,
  DroneRoutePoint,
  DronesService,
} from '../../services/drones.service';
import { DespachoService } from '../../services/despacho.service';

@Component({
  selector: 'app-drones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drones.component.html',
  styleUrl: './drones.component.less',
})
export class DronesComponent implements OnInit, OnDestroy {
  drones: DroneRecord[] = [];
  selectedDrone: DroneRecord | null = null;
  selectedDay = '';
  searchTerm = '';
  loading = false;
  errorMessage = '';
  private readonly subscriptions = new Subscription();

  constructor(
    private dronesService: DronesService,
    private dispatchService: DespachoService,
  ) {}

  ngOnInit(): void {
    void this.loadDrones();
    this.subscriptions.add(
      this.dispatchService.draftChanges$.subscribe((change) => {
        if (change) void this.loadDrones();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get filteredDrones(): DroneRecord[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    if (!query) return this.drones;

    return this.drones.filter((drone) => {
      const report = drone.linkedReport;
      return [
        drone.name,
        drone.model,
        report.referenceNumber,
        report.municipality,
        report.place,
        report.subject,
      ].some((value) => value?.toLocaleLowerCase().includes(query));
    });
  }

  get flightsForSelectedDay(): DroneFlight[] {
    if (!this.selectedDrone || !this.selectedDay) return [];

    return this.selectedDrone.flights
      .filter((flight) => this.toDateInputValue(flight.startedAt) === this.selectedDay)
      .sort(
        (left, right) =>
          new Date(right.startedAt).getTime() -
          new Date(left.startedAt).getTime(),
      );
  }

  get linkedReportCount(): number {
    return new Set(this.drones.map((drone) => drone.linkedReport.reportId)).size;
  }

  get pendingSyncCount(): number {
    return this.drones.filter(
      (drone) =>
        drone.status === 'pending-sync' || drone.status === 'selected',
    ).length;
  }

  async loadDrones(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.drones = await this.dronesService.getDroneDashboard();

      if (this.selectedDrone) {
        this.selectedDrone =
          this.drones.find((drone) => drone.id === this.selectedDrone?.id) ?? null;
      }
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No fue posible cargar la operación de drones';
      this.drones = [];
      this.selectedDrone = null;
    } finally {
      this.loading = false;
    }
  }

  selectDrone(drone: DroneRecord): void {
    this.selectedDrone = drone;
    this.selectedDay = this.toDateInputValue(
      drone.lastActivity || drone.flights[0]?.startedAt || new Date().toISOString(),
    );

    requestAnimationFrame(() => {
      document
        .getElementById('drone-history')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  clearSelection(): void {
    this.selectedDrone = null;
    this.selectedDay = '';
  }

  changeDay(offset: number): void {
    if (!this.selectedDay) return;

    const nextDate = new Date(`${this.selectedDay}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + offset);
    this.selectedDay = this.toDateInputValue(nextDate.toISOString());
  }

  formatDateTime(value?: string | null): string {
    if (!value) return 'Sin actividad registrada';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  formatDay(value: string): string {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  formatCoordinates(flight: DroneFlight): string {
    const { latitude, longitude } = flight.report;
    if (latitude == null || longitude == null) return 'Sin coordenadas';
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }

  getStatusLabel(status: DroneRecord['status']): string {
    const labels: Record<DroneRecord['status'], string> = {
      available: 'Disponible',
      'in-flight': 'En vuelo',
      offline: 'Sin conexión',
      'pending-sync': 'Pendiente de sincronización',
      selected: 'Medida seleccionada',
    };
    return labels[status];
  }

  getFlightStatusLabel(status: DroneFlight['status']): string {
    const labels: Record<DroneFlight['status'], string> = {
      completed: 'Vuelo concluido',
      'in-progress': 'Vuelo en curso',
      'pending-sync': 'Telemetría pendiente',
      selected: 'Pendiente de validación',
    };
    return labels[status];
  }

  routePolyline(points: DroneRoutePoint[]): string {
    if (points.length < 2) return '';

    const longitudes = points.map((point) => point.longitude);
    const latitudes = points.map((point) => point.latitude);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const longitudeRange = maxLongitude - minLongitude || 1;
    const latitudeRange = maxLatitude - minLatitude || 1;

    return points
      .map((point) => {
        const x = 24 + ((point.longitude - minLongitude) / longitudeRange) * 312;
        const y = 176 - ((point.latitude - minLatitude) / latitudeRange) * 152;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  trackDrone(_: number, drone: DroneRecord): string {
    return drone.id;
  }

  trackFlight(_: number, flight: DroneFlight): string {
    return flight.id;
  }

  private toDateInputValue(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
