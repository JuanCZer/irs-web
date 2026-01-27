import { Injectable } from '@angular/core';

export interface UsuarioDTO {
  idUsuario: number;
  nombre?: string;
  app?: string;
  apm?: string;
  alias?: string;
  usuario: string;
  status?: number;
  statusList?: number;
  ultimoAcceso?: string;
  intento?: number;
  ip?: string;
  fechaHoraCreacion?: string;
  idRol?: number;
  nombreRol?: string;
}

export interface CrearUsuarioDTO {
  nombre?: string;
  app?: string;
  apm?: string;
  alias?: string;
  usuario: string;
  password: string;
  status?: number;
  idRol?: number;
}

export interface ActualizarUsuarioDTO {
  nombre?: string;
  app?: string;
  apm?: string;
  alias?: string;
  usuario?: string;
  password?: string;
  status?: number;
  idRol?: number;
}

export interface CatRol {
  idCatRol: number;
  nombreRol: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'https://localhost:5001/api/usuarios';
  private rolesApiUrl = 'https://localhost:5001/api/roles';

  constructor() {}

  async obtenerRoles(): Promise<CatRol[]> {
    try {
      console.log('🔄 Obteniendo catálogo de roles desde:', this.rolesApiUrl);

      const response = await fetch(this.rolesApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const roles = await response.json();
      console.log('✅ Roles obtenidos:', roles);
      console.log('✅ Total roles:', roles.length);
      return roles;
    } catch (error) {
      console.error('❌ Error al obtener roles:', error);
      console.error('❌ Error tipo:', typeof error);
      console.error('❌ Error completo:', error);

      // Si es un error de red o CORS
      if (error instanceof TypeError) {
        console.error('❌ Error de red o CORS detectado');
        console.error(
          '   Verifica que el backend esté corriendo en:',
          this.rolesApiUrl
        );
        console.error('   Verifica la configuración de CORS en el backend');
      }

      throw error;
    }
  }

  async obtenerTodosLosUsuarios(): Promise<UsuarioDTO[]> {
    try {
      console.log('🔄 Obteniendo todos los usuarios...');
      const response = await fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const usuarios = await response.json();
      console.log('✅ Usuarios obtenidos:', usuarios.length);
      return usuarios;
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  }

  async obtenerUsuarioPorId(id: number): Promise<UsuarioDTO> {
    try {
      console.log(`🔍 Obteniendo usuario con ID: ${id}`);
      const response = await fetch(`${this.apiUrl}/${id}`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const usuario = await response.json();
      console.log('✅ Usuario obtenido:', usuario);
      return usuario;
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      throw error;
    }
  }

  async crearUsuario(usuario: CrearUsuarioDTO): Promise<UsuarioDTO> {
    try {
      console.log('➕ Creando nuevo usuario:', usuario.usuario);
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }

      const nuevoUsuario = await response.json();
      console.log('✅ Usuario creado:', nuevoUsuario);
      return nuevoUsuario;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      throw error;
    }
  }

  async actualizarUsuario(
    id: number,
    usuario: ActualizarUsuarioDTO
  ): Promise<void> {
    try {
      console.log(`✏️ Actualizando usuario con ID: ${id}`);
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }

      console.log('✅ Usuario actualizado correctamente');
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      throw error;
    }
  }

  async eliminarUsuario(id: number): Promise<void> {
    try {
      console.log(`🗑️ Eliminando usuario con ID: ${id}`);
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }

      console.log('✅ Usuario eliminado correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw error;
    }
  }
}
