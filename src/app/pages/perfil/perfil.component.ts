import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.less',
})
export class PerfilComponent implements OnInit {

  user: UsuarioAutenticado | null = null;
  fullName = '';
  formattedLastAccess = '';

  constructor(
    private authService: AuthService,
    private usersService: UsuariosService,
  ) {}

  ngOnInit(): void {

    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.fullName = this.authService.getFullName();
      this.formattedLastAccess = this.formatDate(
        this.user.lastAccess,
      );
    }
  }

  formatDate(date?: string): string {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    return parsedDate.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }


  passwordChange = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  showCurrentPassword = false;
  showNewPassword = false;
  showPasswordConfirmation = false;
  errorMessage = '';
  successMessage = '';
  loading = false;


  get passwordValidation() {
    const password = this.passwordChange.newPassword;
    return {
      minimumLength: password.length >= 15,
      validMaximum:
        password.length <= 64 && new TextEncoder().encode(password).length <= 72,
    };
  }

  get passwordValid(): boolean {
    const val = this.passwordValidation;
    return val.minimumLength && val.validMaximum;
  }

  get passwordsMatch(): boolean {
    return (
      this.passwordChange.newPassword ===
        this.passwordChange.confirmPassword &&
      this.passwordChange.confirmPassword.length > 0
    );
  }

  togglePassword(field: 'actual' | 'nueva' | 'confirmar'): void {
    switch (field) {
      case 'actual':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'nueva':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirmar':
        this.showPasswordConfirmation = !this.showPasswordConfirmation;
        break;
    }
  }

  private validatePasswordChange(): string | null {
    const current = this.passwordChange.currentPassword || '';
    const newValue = this.passwordChange.newPassword || '';
    const confirm = this.passwordChange.confirmPassword || '';

    if (!current) return 'Debes ingresar tu contraseña actual';
    if (!newValue) return 'Debes ingresar una nueva contraseña';
    if (!this.passwordValid)
      return 'La nueva contraseña no cumple con todos los requisitos de seguridad';
    if (newValue !== confirm) return 'Las contraseñas no coinciden';

    return null;
  }

  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const validError = this.validatePasswordChange();
    if (validError) {
      this.errorMessage = validError;
      return;
    }

    this.loading = true;

    const changedData = {
      currentPassword: this.passwordChange.currentPassword || '',
      newPassword: this.passwordChange.newPassword || '',
      confirmPassword: this.passwordChange.confirmPassword || '',
    };

    this.usersService
      .changePassword(changedData)
      .then((response) => {
        this.loading = false;
        if (response.successful) {
          this.successMessage = '¡Contraseña cambiada exitosamente!';

          this.passwordChange = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };

          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        } else {
          this.errorMessage =
            response.message || 'Error al cambiar la contraseña';
          if (response.errors && response.errors.length > 0) {
            this.errorMessage += ': ' + response.errors.join(', ');
          }
        }
      })
      .catch((error) => {
        this.loading = false;
        this.errorMessage = 'Error al cambiar la contraseña: ' + error.message;
      });
  }

  cancel(): void {
    this.passwordChange = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.errorMessage = '';
    this.successMessage = '';
  }
}
