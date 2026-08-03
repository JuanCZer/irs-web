import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatMedidaSeguridad } from '../../services/catalogos.service';

export interface AplicarMedidasEvent {
  measures: number[];
  comment: string;
}

@Component({
  selector: 'app-modal-medidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-medidas.component.html',
  styleUrl: './modal-medidas.component.less',
})
export class ModalMedidasComponent implements OnChanges {
  @Input() visible = false;
  @Input() reportReference = '';
  @Input() delegation = '';
  @Input() municipality = '';
  @Input() place = '';
  @Input() priority = '';
  @Input() securityMeasures: CatMedidaSeguridad[] = [];
  @Input() selectedMeasures: number[] = [];
  @Input() initialComment = '';

  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<AplicarMedidasEvent>();
  @Output() selectionChange = new EventEmitter<AplicarMedidasEvent>();
  /** @deprecated Use selectionChange para cambios inmediatos. */
  @Output() draftChange = new EventEmitter<AplicarMedidasEvent>();

  comment = '';
  selectedMeasuresMap: { [key: number]: boolean } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.visible &&
      (changes['visible'] ||
        changes['selectedMeasures'] ||
        changes['initialComment'])
    ) {
      this.comment = this.initialComment;
      this.selectedMeasuresMap = Object.fromEntries(
        this.selectedMeasures.map((id) => [id, true])
      );
    }
  }

  get selectedMeasureCount(): number {
    return Object.values(this.selectedMeasuresMap).filter((v) => v).length;
  }

  getSelectedMeasures(): CatMedidaSeguridad[] {
    return this.securityMeasures.filter(
      (m) => this.selectedMeasuresMap[m.measureCategoryId]
    );
  }

  onClose(): void {
    this.emitDraft();
    this.close.emit();
  }

  onMeasureChange(measureId: number, selected: boolean): void {
    this.selectedMeasuresMap[measureId] = selected;
    this.emitDraft();
  }

  onCommentChange(comment: string): void {
    this.comment = comment;
    this.emitDraft();
  }

  onApply(): void {
    const measureIds = Object.keys(this.selectedMeasuresMap)
      .filter((key) => this.selectedMeasuresMap[+key])
      .map((key) => +key);

    if (measureIds.length === 0) {
      alert('Debe seleccionar al menos una medida de seguridad');
      return;
    }

    this.apply.emit({
      measures: measureIds,
      comment: this.comment,
    });
  }

  private emitDraft(): void {
    const measures = Object.keys(this.selectedMeasuresMap)
      .filter((key) => this.selectedMeasuresMap[+key])
      .map((key) => +key);

    const selection = { measures, comment: this.comment };
    this.selectionChange.emit(selection);
    this.draftChange.emit(selection);
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
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
