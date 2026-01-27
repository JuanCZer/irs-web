import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsuariosService,
  UsuarioDTO,
  ActualizarUsuarioDTO,
} from '../../services/usuarios.service';
import { ModalEditarUsuarioComponent } from '../../components/modal-editar-usuario/modal-editar-usuario.component';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalEditarUsuarioComponent],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.less'],
})
export class EditarUsuarioComponent implements OnInit {
  Math = Math;
  usuarios: UsuarioDTO[] = [];
  usuariosFiltrados: UsuarioDTO[] = [];
  cargando = false;
  error = '';
  mostrarModal = false;
  usuarioSeleccionado: UsuarioDTO | null = null;
  cargandoUsuario = false;
  paginaActual = 1;
  usuariosPorPagina = 10;
  totalPaginas = 0;
  terminoBusqueda = '';

  constructor(private usuariosService: UsuariosService) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    try {
      this.usuarios = await this.usuariosService.obtenerTodosLosUsuarios();
      this.usuariosFiltrados = [...this.usuarios];
      this.calcularTotalPaginas();
    } catch (error) {
      this.error = 'Error al cargar usuarios';
    } finally {
      this.cargando = false;
    }
  }

  buscar() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.usuariosFiltrados = termino
      ? this.usuarios.filter((u) => u.usuario.toLowerCase().includes(termino))
      : [...this.usuarios];
    this.paginaActual = 1;
    this.calcularTotalPaginas();
  }

  calcularTotalPaginas() {
    this.totalPaginas = Math.ceil(
      this.usuariosFiltrados.length / this.usuariosPorPagina
    );
  }

  get usuariosPaginados() {
    const inicio = (this.paginaActual - 1) * this.usuariosPorPagina;
    return this.usuariosFiltrados.slice(
      inicio,
      inicio + this.usuariosPorPagina
    );
  }

  anterior() {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  siguiente() {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  async abrirModalEditar(id: number) {
    this.mostrarModal = true;
    this.cargandoUsuario = true;
    try {
      this.usuarioSeleccionado = await this.usuariosService.obtenerUsuarioPorId(
        id
      );
    } catch {
      this.cerrarModal();
    } finally {
      this.cargandoUsuario = false;
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }

  async guardarUsuario(usuario: UsuarioDTO) {
    try {
      await this.usuariosService.actualizarUsuario(
        usuario.idUsuario,
        usuario as ActualizarUsuarioDTO
      );
      this.cerrarModal();
      await this.cargarUsuarios();
    } catch {
      this.error = 'Error al actualizar usuario';
    }
  }

  async eliminarUsuario(id: number, nombre: string) {
    if (confirm(`¿Eliminar usuario "${nombre}"?`)) {
      try {
        await this.usuariosService.eliminarUsuario(id);
        await this.cargarUsuarios();
      } catch {
        this.error = 'Error al eliminar';
      }
    }
  }

  verTutorial() {
    console.log('Ver tutorial de administración de usuarios');
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const rango = 2;
    let inicio = Math.max(1, this.paginaActual - rango);
    let fin = Math.min(this.totalPaginas, this.paginaActual + rango);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }
}
