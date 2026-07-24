import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
})
export class LoginComponent implements OnInit {
  currentYear = new Date().getFullYear();

  credentials = {
    usuario: '',
    password: '',
  };

  mostrarPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    if (
      this.authService.currentUserValue &&
      (await this.authService.validarSesion())
    ) {
      await this.router.navigate(['/inicio']);
    }
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async onSubmit(): Promise<void> {
    if (!this.credentials.usuario || !this.credentials.password) {
      this.errorMessage = 'Por favor, ingrese usuario y contraseña';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';

      await this.authService.login(this.credentials);

      // Redirigir al inicio después del login exitoso
      this.router.navigate(['/inicio']);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al iniciar sesión. Por favor, intente nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}
