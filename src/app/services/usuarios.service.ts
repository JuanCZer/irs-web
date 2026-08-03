import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface UsuarioDTO {
  userId: number;
  name?: string;
  firstSurname?: string;
  secondSurname?: string;
  alias?: string;
  user: string;
  status?: number;
  statusList?: number;
  lastAccess?: string;
  attempt?: number;
  ip?: string;
  createdAt?: string;
  roleId?: number;
  roleName?: string;
}

export interface CrearUsuarioDTO {
  name?: string;
  firstSurname?: string;
  secondSurname?: string;
  alias?: string;
  user: string;
  password: string;
  status?: number;
  roleId?: number;
}

export interface ActualizarUsuarioDTO {
  name?: string;
  firstSurname?: string;
  secondSurname?: string;
  alias?: string;
  user?: string;
  password?: string;
  status?: number;
  roleId?: number;
}

export interface CatRol {
  roleCategoryId: number;
  roleName: string;
}

export interface CambiarContrasenaDTO {
  newPassword: string;
  confirmPassword: string;
}

export interface RespuestaCambioContrasenaDTO {
  successful: boolean;
  message: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'https://localhost:5001/api/usuarios';
  private rolesApiUrl = 'https://localhost:5001/api/roles';

  constructor(private api: ApiService) {}

  async getRoles(): Promise<CatRol[]> {
    try {

      const response = await this.api.fetch(this.rolesApiUrl, {
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


      if (error instanceof TypeError) {
        console.error(
          '   Verifica que el backend esté corriendo en:',
          this.rolesApiUrl,
        );
      }

      throw error;
    }
  }

  async getAllUsers(): Promise<UsuarioDTO[]> {
    try {
      const response = await this.api.fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const users = await response.json();
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: number): Promise<UsuarioDTO> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/${id}`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const user = await response.json();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUser(user: CrearUsuarioDTO): Promise<UsuarioDTO> {
    try {
      const response = await this.api.fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }

      const newUser = await response.json();
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    id: number,
    user: ActualizarUsuarioDTO,
  ): Promise<void> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/${id}`, {
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

  async changePassword(
    passwordChange: CambiarContrasenaDTO,
  ): Promise<RespuestaCambioContrasenaDTO> {
    try {
      const response = await this.api.fetch(
        'https://localhost:5001/api/auth/cambiar-contrasena',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passwordChange),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();


      return {
        successful:
          result.successful !== undefined
            ? result.successful
            : result.Successful,
        message: result.message || result.Message || '',
        errors: result.errors || result.Errors,
      };
    } catch (error) {
      throw error;
    }
  }
}
