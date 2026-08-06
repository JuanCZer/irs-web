import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ArchivoSeleccionado {
  file: File;
  base64: string;
}

export interface ValidarEvent {
  evidenceFiles: string;
}

@Component({
  selector: 'app-modal-validar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-validar.component.html',
  styleUrl: './modal-validar.component.less',
})
export class ModalValidarComponent {
  private readonly maximumFiles = 5;
  private readonly maximumBytesPerFile = 2 * 1024 * 1024;
  private readonly maximumTotalBytes = 5 * 1024 * 1024;

  @Input() visible = false;
  @Input() reportReference = '';
  @Input() delegation = '';
  @Input() municipality = '';
  @Input() place = '';
  @Input() priority = '';

  @Output() close = new EventEmitter<void>();
  @Output() validate = new EventEmitter<ValidarEvent>();

  selectedFiles: ArchivoSeleccionado[] = [];
  isDragging = false;

  onClose(): void {
    this.selectedFiles = [];
    this.isDragging = false;
    this.close.emit();
  }

  onValidate(): void {
    if (this.selectedFiles.length === 0) {
      alert('Debe subir al menos un archivo PNG como evidencia.');
      return;
    }

    const evidenceFiles = this.selectedFiles
      .map((a) => a.base64)
      .join('|');

    this.validate.emit({ evidenceFiles });
    this.selectedFiles = [];
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

    input.value = '';
  }

  private handleFiles(files: File[]): void {
    const pngFiles = files.filter((file) => file.type === 'image/png');

    if (pngFiles.length !== files.length) {
      alert('Solo se permiten archivos PNG.');
    }

    let totalBytes = this.selectedFiles.reduce(
      (total, selected) => total + selected.file.size,
      0,
    );
    const acceptedFiles: File[] = [];

    for (const file of pngFiles) {
      if (this.selectedFiles.length + acceptedFiles.length >= this.maximumFiles) {
        alert('Solo se permiten hasta 5 archivos PNG.');
        break;
      }
      if (file.size > this.maximumBytesPerFile) {
        alert(`El archivo "${file.name}" supera el límite de 2 MB.`);
        continue;
      }
      if (totalBytes + file.size > this.maximumTotalBytes) {
        alert('La evidencia completa no puede superar 5 MB.');
        break;
      }

      acceptedFiles.push(file);
      totalBytes += file.size;
    }

    acceptedFiles.forEach((file) => {
      this.convertFilesToBase64(file);
    });
  }

  private convertFilesToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const base64 = e.target?.result as string;
      this.selectedFiles.push({
        file: file,
        base64,
      });
    };
    reader.readAsDataURL(file);
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getPriorityClass(): string {
    if (this.priority === 'Alta') return 'prioridad-alta';
    if (this.priority === 'Media') return 'prioridad-media';
    return 'prioridad-baja';
  }
}
