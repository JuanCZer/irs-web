import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DISPATCH_DRAFT_STORAGE_KEY } from './despacho.service';

export interface LoginCredentials {
  user: string;
  password: string;
}

export interface UsuarioAutenticado {
  userId: number;
  name?: string;
  firstSurname?: string;
  secondSurname?: string;
  alias?: string;
  user: string;
  roleId?: number;
  roleName?: string;
  lastAccess?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:5001/api/auth';
  private readonly currentUserSubject: BehaviorSubject<UsuarioAutenticado | null>;
  private validationInProgress: Promise<boolean> | null = null;
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

  async validateSession(): Promise<boolean> {
    if (this.validationInProgress) return this.validationInProgress;

    this.validationInProgress = this.validateSessionInternal();
    try {
      return await this.validationInProgress;
    } finally {
      this.validationInProgress = null;
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

    const user: UsuarioAutenticado = await response.json();
    this.setUser(user);
    return user;
  }

  async logout(): Promise<void> {
    try {
      await this.api.fetch(`${this.apiUrl}/logout`, { method: 'POST' });
    } catch {

    } finally {
      this.clearLocalSession();
      await this.router.navigate(['/login']);
    }
  }

  getFullName(): string {
    const user = this.currentUserValue;
    if (!user) return 'Usuario';

    const nameParts = [user.name, user.firstSurname, user.secondSurname].filter(
      (part) => part && part.trim() !== '',
    );
    return nameParts.length > 0 ? nameParts.join(' ') : user.user;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.roleName?.toUpperCase() === 'ADMIN';
  }

  isDispatch(): boolean {
    const user = this.currentUserValue;
    return (
      user?.roleId === 6 ||
      user?.roleName?.trim().toUpperCase() === 'DESPACHO'
    );
  }

  private async validateSessionInternal(): Promise<boolean> {
    try {
      const response = await this.api.fetch(`${this.apiUrl}/me`);
      if (!response.ok) {
        this.clearLocalSession();
        return false;
      }

      const user: UsuarioAutenticado = await response.json();
      this.setUser(user);
      return true;
    } catch {
      this.clearLocalSession();
      return false;
    }
  }

  private setUser(user: UsuarioAutenticado): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearLocalSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem(DISPATCH_DRAFT_STORAGE_KEY);
    this.currentUserSubject.next(null);
  }
}
