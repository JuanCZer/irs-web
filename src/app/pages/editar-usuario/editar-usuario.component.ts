import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsuariosService,
  UsuarioDTO,
  ActualizarUsuarioDTO,
} from '../../services/usuarios.service';
import { ModalEditarUsuarioComponent } from '../../components/modal-editar-usuario/modal-editar-usuario.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalEditarUsuarioComponent,
    PaginationComponent,
  ],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.less'],
})
export class EditarUsuarioComponent implements OnInit {
  users: UsuarioDTO[] = [];
  filteredUsers: UsuarioDTO[] = [];
  loading = false;
  error = '';
  showModal = false;
  selectedUser: UsuarioDTO | null = null;
  userLoading = false;
  currentPage = 1;
  usersPerPage = 10;
  totalPages = 0;
  searchTerm = '';

  constructor(private usersService: UsuariosService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      this.users = await this.usersService.getAllUsers();
      this.filteredUsers = [...this.users];
      this.calculateTotalPages();
    } catch (error) {
      this.error = 'Error al cargar usuarios';
    } finally {
      this.loading = false;
    }
  }

  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = term
      ? this.users.filter((u) => u.user.toLowerCase().includes(term))
      : [...this.users];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(
      this.filteredUsers.length / this.usersPerPage
    );
    this.currentPage = Math.min(
      Math.max(1, this.currentPage),
      Math.max(1, this.totalPages)
    );
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.usersPerPage;
    return this.filteredUsers.slice(
      start,
      start + this.usersPerPage
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  async openEditModal(id: number) {
    this.showModal = true;
    this.userLoading = true;
    try {
      this.selectedUser = await this.usersService.getUserById(
        id
      );
    } catch {
      this.closeModal();
    } finally {
      this.userLoading = false;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedUser = null;
  }

  async saveUser(user: UsuarioDTO) {
    try {
      await this.usersService.updateUser(
        user.userId,
        user as ActualizarUsuarioDTO
      );
      this.closeModal();
      await this.loadUsers();
    } catch {
      this.error = 'Error al actualizar usuario';
    }
  }

  async deleteUser(id: number, name: string) {
    if (confirm(`¿Eliminar usuario "${name}"?`)) {
      try {
        await this.usersService.deleteUser(id);
        await this.loadUsers();
      } catch {
        this.error = 'Error al eliminar';
      }
    }
  }

}
