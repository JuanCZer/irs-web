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
  @Input() showModal: boolean = false;
  @Input() selectedReport: FichaInformativa | null = null;
  @Input() reportLoading: boolean = false;
  @Input() readOnlyMode: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() validateAndSave = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  onValidateAndSave(): void {
    this.validateAndSave.emit();
  }
}
