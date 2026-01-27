import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsuarioDTO,
  UsuariosService,
  CatRol,
} from '../../services/usuarios.service';

@Component({
  selector: 'app-modal-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-editar-usuario.component.html',
  styleUrls: ['./modal-editar-usuario.component.less'],
})
export class ModalEditarUsuarioComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() usuarioSeleccionado: UsuarioDTO | null = null;
  @Input() cargandoUsuario: boolean = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<UsuarioDTO>();

  roles: CatRol[] = [];
  mostrarContrasena = false;
  passwordNueva = '';

  constructor(private usuariosService: UsuariosService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarRoles();
  }

  async cargarRoles(): Promise<void> {
    try {
      this.roles = await this.usuariosService.obtenerRoles();
      console.log('✅ Roles cargados en modal:', this.roles);
    } catch (error) {
      console.error('❌ Error al cargar roles en modal:', error);
    }
  }

  cerrarModal(): void {
    this.cerrar.emit();
    this.passwordNueva = '';
    this.mostrarContrasena = false;
  }

  onGuardar(): void {
    if (this.usuarioSeleccionado) {
      this.guardar.emit(this.usuarioSeleccionado);
    }
  }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }
}
