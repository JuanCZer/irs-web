import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatMedidaSeguridad } from '../../services/catalogos.service';

export interface AplicarMedidasEvent {
  medidas: number[];
  comentario: string;
}

@Component({
  selector: 'app-modal-medidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-medidas.component.html',
  styleUrl: './modal-medidas.component.less',
})
export class ModalMedidasComponent {
  @Input() visible = false;
  @Input() folioFicha = '';
  @Input() delegacion = '';
  @Input() municipio = '';
  @Input() lugar = '';
  @Input() prioridad = '';
  @Input() medidasSeguridad: CatMedidaSeguridad[] = [];

  @Output() cerrar = new EventEmitter<void>();
  @Output() aplicar = new EventEmitter<AplicarMedidasEvent>();

  comentario = '';
  medidasSeleccionadasMap: { [key: number]: boolean } = {};

  get medidasSeleccionadasCount(): number {
    return Object.values(this.medidasSeleccionadasMap).filter((v) => v).length;
  }

  getMedidasSeleccionadasList(): CatMedidaSeguridad[] {
    return this.medidasSeguridad.filter(
      (m) => this.medidasSeleccionadasMap[m.idCatMedida]
    );
  }

  onCerrar(): void {
    this.comentario = '';
    this.medidasSeleccionadasMap = {};
    this.cerrar.emit();
  }

  onAplicar(): void {
    const medidasIds = Object.keys(this.medidasSeleccionadasMap)
      .filter((key) => this.medidasSeleccionadasMap[+key])
      .map((key) => +key);

    if (medidasIds.length === 0) {
      alert('Debe seleccionar al menos una medida de seguridad');
      return;
    }

    this.aplicar.emit({
      medidas: medidasIds,
      comentario: this.comentario,
    });

    this.comentario = '';
    this.medidasSeleccionadasMap = {};
  }

  getPrioridadClass(prioridad: string): string {
    switch (prioridad?.toLowerCase()) {
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
