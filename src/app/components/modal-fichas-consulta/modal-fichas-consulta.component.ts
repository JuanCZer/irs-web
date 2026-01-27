import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FichaInformativa } from '../../services/fichas.service';

@Component({
  selector: 'app-modal-fichas-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-fichas-consulta.component.html',
  styleUrls: ['./modal-fichas-consulta.component.less'],
})
export class ModalFichasConsultaComponent {
  @Input() mostrarModal: boolean = false;
  @Input() fichaSeleccionada: FichaInformativa | null = null;
  @Input() cargandoFicha: boolean = false;
  @Input() modoSoloLectura: boolean = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() validarYGuardar = new EventEmitter<void>();

  cerrarModal(): void {
    this.cerrar.emit();
  }

  onValidarYGuardar(): void {
    this.validarYGuardar.emit();
  }
}
