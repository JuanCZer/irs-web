import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsuariosService,
  CrearUsuarioDTO,
  CatRol,
} from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-usuario.component.html',
  styleUrl: './registrar-usuario.component.less',
})
export class RegistrarUsuarioComponent implements OnInit {
  user = {
    firstNames: '',
    firstSurname: '',
    secondSurname: '',
    user: '',
    alias: '',
    password: '',
    confirmPassword: '',
    role: '',
  };

  showPassword = false;
  showPasswordConfirmation = false;

  roles: CatRol[] = [];
  rolesLoading = false;
  registering = false;


  isAdminFlag = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private usersService: UsuariosService,
    private authService: AuthService,
  ) {}

  async ngOnInit() {

    this.clearForm();
    await this.loadRoles();

    this.isAdminFlag = this.authService.isAdmin();
  }

  async loadRoles() {
    try {
      this.rolesLoading = true;
      this.roles = await this.usersService.getRoles();
    } catch (error) {
      this.errorMessage =
        'Error al cargar el catálogo de roles. Por favor, recargue la página.';
    } finally {
      this.rolesLoading = false;
    }
  }

  get passwordValidation() {
    const password = this.user.password;
    return {
      minimumLength: password.length >= 15,
      validMaximum:
        password.length <= 64 && new TextEncoder().encode(password).length <= 72,
    };
  }

  get passwordsMatch(): boolean {
    return (
      this.user.password === this.user.confirmPassword &&
      this.user.confirmPassword !== ''
    );
  }

  get formValid(): boolean {
    const val = this.passwordValidation;
    return (
      this.user.firstNames !== '' &&
      this.user.firstSurname !== '' &&
      this.user.user !== '' &&
      this.user.role !== '' &&
      val.minimumLength &&
      val.validMaximum &&
      this.passwordsMatch
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  togglePasswordConfirmation(): void {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  async registerUser() {

    if (!this.isAdmin()) {
      this.errorMessage =
        'Solo los administradores pueden crear nuevos usuarios.';
      this.successMessage = '';
      return;
    }

    if (!this.formValid) {
      this.errorMessage =
        'Por favor, complete todos los campos requeridos correctamente.';
      this.successMessage = '';
      return;
    }

    try {
      this.registering = true;
      this.errorMessage = '';
      this.successMessage = '';

      const newUser: CrearUsuarioDTO = {
        name: this.user.firstNames,
        firstSurname: this.user.firstSurname,
        secondSurname: this.user.secondSurname || undefined,
        alias: this.user.alias || undefined,
        user: this.user.user,
        password: this.user.password,
        status: 1,
        roleId: parseInt(this.user.role),
      };

      await this.usersService.createUser(newUser);

      this.successMessage = `Usuario "${newUser.user}" registrado correctamente.`;
      this.errorMessage = '';


      setTimeout(() => {
        this.clearForm();
      }, 2000);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? `Error: ${error.message}`
          : 'Error al registrar el usuario. Por favor, intente nuevamente.';
      this.successMessage = '';
    } finally {
      this.registering = false;
    }
  }

  clearForm(): void {
    this.user = {
      firstNames: '',
      firstSurname: '',
      secondSurname: '',
      user: '',
      alias: '',
      password: '',
      confirmPassword: '',
      role: '',
    };
    this.successMessage = '';
    this.errorMessage = '';
  }
}
