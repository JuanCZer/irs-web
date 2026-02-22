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
  idUsuarioCrea?: number; // ID del usuario que crea (debe ser Admin)
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

export interface CambiarContrasenaDTO {
  idUsuario: number;
  contraseñaActual: string;
  contraseñaNueva: string;
  confirmarContraseña: string;
}

export interface RespuestaCambioContrasenaDTO {
  exitoso: boolean;
  mensaje: string;
  errores?: string[];
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

      const response = await fetch(this.rolesApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const roles = await response.json();
      return roles;
    } catch (error) {

      // Si es un error de red o CORS
      if (error instanceof TypeError) {
        console.error(
          '   Verifica que el backend esté corriendo en:',
          this.rolesApiUrl,
        );
      }

      throw error;
    }
  }

  async obtenerTodosLosUsuarios(): Promise<UsuarioDTO[]> {
    try {
      const response = await fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const usuarios = await response.json();
      return usuarios;
    } catch (error) {
      throw error;
    }
  }

  async obtenerUsuarioPorId(id: number): Promise<UsuarioDTO> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const usuario = await response.json();
      return usuario;
    } catch (error) {
      throw error;
    }
  }

  async crearUsuario(usuario: CrearUsuarioDTO): Promise<UsuarioDTO> {
    try {
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
      return nuevoUsuario;
    } catch (error) {
      throw error;
    }
  }

  async actualizarUsuario(
    id: number,
    usuario: ActualizarUsuarioDTO,
  ): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async eliminarUsuario(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async cambiarContrasena(
    cambioContraseña: CambiarContrasenaDTO,
  ): Promise<RespuestaCambioContrasenaDTO> {
    try {
      const response = await fetch(
        'https://localhost:5001/api/auth/cambiar-contrasena',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cambioContraseña),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `Error HTTP: ${response.status}`);
      }

      const resultado = await response.json();

      // Mapear respuesta del backend (PascalCase) a camelCase
      return {
        exitoso:
          resultado.exitoso !== undefined
            ? resultado.exitoso
            : resultado.Exitoso,
        mensaje: resultado.mensaje || resultado.Mensaje || '',
        errores: resultado.errores || resultado.Errores,
      };
    } catch (error) {
      throw error;
    }
  }
}
