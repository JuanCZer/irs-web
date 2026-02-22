import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private apiUrl = 'https://localhost:5001/api/auth';
  private currentUserSubject: BehaviorSubject<UsuarioAutenticado | null>;
  public currentUser: Observable<UsuarioAutenticado | null>;

  constructor(private router: Router) {
    // Cargar usuario del localStorage si existe
    const userJson = localStorage.getItem('currentUser');
    const user = userJson ? JSON.parse(userJson) : null;
    this.currentUserSubject = new BehaviorSubject<UsuarioAutenticado | null>(
      user,
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UsuarioAutenticado | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  async login(credentials: LoginCredentials): Promise<UsuarioAutenticado> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
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

      // Guardar usuario en localStorage y actualizar observable
      localStorage.setItem('currentUser', JSON.stringify(usuario));
      this.currentUserSubject.next(usuario);

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  logout(): void {
    // Limpiar localStorage y observable
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  getNombreCompleto(): string {
    const user = this.currentUserValue;
    if (!user) return 'Usuario';

    const partes = [user.nombre, user.app, user.apm].filter(
      (p) => p && p.trim() !== '',
    );
    return partes.length > 0 ? partes.join(' ') : user.usuario;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    console.log('Verificando rol de usuario:', user);
    return user?.nombreRol?.toUpperCase() === 'ADMIN';
  }
}
