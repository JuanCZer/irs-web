import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ArchivoSeleccionado {
  archivo: File;
  base64: string;
}

export interface ValidarEvent {
  evidencias: string;
}

@Component({
  selector: 'app-modal-validar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-validar.component.html',
  styleUrl: './modal-validar.component.less',
})
export class ModalValidarComponent {
  @Input() visible = false;
  @Input() folioFicha = '';
  @Input() delegacion = '';
  @Input() municipio = '';
  @Input() lugar = '';
  @Input() prioridad = '';

  @Output() cerrar = new EventEmitter<void>();
  @Output() validar = new EventEmitter<ValidarEvent>();

  archivosSeleccionados: ArchivoSeleccionado[] = [];
  isDragging = false;

  onCerrar(): void {
    this.archivosSeleccionados = [];
    this.isDragging = false;
    this.cerrar.emit();
  }

  onValidar(): void {
    if (this.archivosSeleccionados.length === 0) {
      alert('Debe subir al menos un archivo PNG como evidencia.');
      return;
    }

    const evidencias = this.archivosSeleccionados
      .map((a) => a.base64)
      .join('|');

    this.validar.emit({ evidencias });
    this.archivosSeleccionados = [];
    this.isDragging = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
    // Reset input value to allow selecting the same file again
    input.value = '';
  }

  private handleFiles(files: File[]): void {
    const pngFiles = files.filter((file) => file.type === 'image/png');

    if (pngFiles.length !== files.length) {
      alert('Solo se permiten archivos PNG.');
    }

    pngFiles.forEach((file) => {
      this.convertirArchivosABase64(file);
    });
  }

  private convertirArchivosABase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const base64 = e.target?.result as string;
      this.archivosSeleccionados.push({
        archivo: file,
        base64,
      });
    };
    reader.readAsDataURL(file);
  }

  eliminarArchivo(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getPrioridadClass(): string {
    if (this.prioridad === 'Alta') return 'prioridad-alta';
    if (this.prioridad === 'Media') return 'prioridad-media';
    return 'prioridad-baja';
  }
}
