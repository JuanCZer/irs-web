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
  @Input() showModal: boolean = false;
  @Input() selectedUser: UsuarioDTO | null = null;
  @Input() userLoading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UsuarioDTO>();

  roles: CatRol[] = [];
  showPassword = false;
  newPassword = '';

  constructor(private usersService: UsuariosService) {}

  async ngOnInit(): Promise<void> {
    await this.loadRoles();
  }

  async loadRoles(): Promise<void> {
    try {
      this.roles = await this.usersService.getRoles();
    } catch {}
  }

  closeModal(): void {
    this.close.emit();
    this.newPassword = '';
    this.showPassword = false;
  }

  onSave(): void {
    if (this.selectedUser) {
      this.save.emit(this.selectedUser);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
