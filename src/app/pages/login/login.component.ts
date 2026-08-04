import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.less',
})
export class LoginComponent implements OnInit {
  currentYear = new Date().getFullYear();

  credentials = {
    user: '',
    password: '',
  };

  showPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    if (
      this.authService.currentUserValue &&
      (await this.authService.validateSession())
    ) {
      await this.router.navigate(['/inicio']);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (!this.credentials.user || !this.credentials.password) {
      this.errorMessage = 'Por favor, ingrese usuario y contraseña';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';

      await this.authService.login(this.credentials);


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
