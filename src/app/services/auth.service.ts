import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface UsuarioAutenticado {
  idUsuario: number;
  nombre?: string;
  app?: string;
  apm?: string;
  alias?: string;
  usuario: string;
  idRol?: number;
  nombreRol?: string;
  ultimoAcceso?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:5001/api/auth';
  private readonly currentUserSubject: BehaviorSubject<UsuarioAutenticado | null>;
  private validacionEnCurso: Promise<boolean> | null = null;
  readonly currentUser: Observable<UsuarioAutenticado | null>;

  constructor(
    private router: Router,
    private api: ApiService,
  ) {
    const userJson = localStorage.getItem('currentUser');
    let user: UsuarioAutenticado | null = null;

    try {
      user = userJson ? JSON.parse(userJson) : null;
    } catch {
      localStorage.removeItem('currentUser');
    }

    this.currentUserSubject = new BehaviorSubject<UsuarioAutenticado | null>(
      user,
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): UsuarioAutenticado | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  async validarSesion(): Promise<boolean> {
    if (this.validacionEnCurso) return this.validacionEnCurso;

    this.validacionEnCurso = this.validarSesionInterna();
    try {
      return await this.validacionEnCurso;
    } finally {
      this.validacionEnCurso = null;
    }
  }

  async login(credentials: LoginCredentials): Promise<UsuarioAutenticado> {
    const response = await this.api.fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al iniciar sesión');
    }

    const usuario: UsuarioAutenticado = await response.json();
    this.establecerUsuario(usuario);
    return usuario;
  }

  async logout(): Promise<void> {
    try {
      await this.api.fetch(`${this.apiUrl}/logout`, { method: 'POST' });
    } catch {
      // La sesión local debe cerrarse aunque el servidor no esté disponible.
    } finally {
      this.limpiarSesionLocal();
      await this.router.navigate(['/login']);
    }
  }

  getNombreCompleto(): string {
    const user = this.currentUserValue;
    if (!user) return 'Usuario';

    const partes = [user.nombre, user.app, user.apm].filter(
      (parte) => parte && parte.trim() !== '',
    );
    return partes.length > 0 ? partes.join(' ') : user.usuario;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.nombreRol?.toUpperCase() === 'ADMIN';
  }

  private async validarSesionInterna(): Promise<boolean> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/me`);
      if (!response.ok) {
        this.limpiarSesionLocal();
        return false;
      }

      const usuario: UsuarioAutenticado = await response.json();
      this.establecerUsuario(usuario);
      return true;
    } catch {
      this.limpiarSesionLocal();
      return false;
    }
  }

  private establecerUsuario(usuario: UsuarioAutenticado): void {
    localStorage.setItem('currentUser', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
  }

  private limpiarSesionLocal(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
