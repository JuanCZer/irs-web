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
  // Datos del usuario logueado
  usuario: UsuarioAutenticado | null = null;
  nombreCompleto = '';
  ultimoAccesoFormateado = '';

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.usuario = this.authService.currentUserValue;
    if (this.usuario) {
      this.nombreCompleto = this.authService.getNombreCompleto();
      this.ultimoAccesoFormateado = this.formatearFecha(
        this.usuario.ultimoAcceso
      );
    }
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Formulario de cambio de contraseña
  cambioPassword = {
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  };

  // Estados del formulario
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;
  mostrarPasswordConfirmar = false;
  mensajeError = '';
  mensajeExito = '';
  cargando = false;

  // Validaciones de la contraseña
  get validacionPassword() {
    const password = this.cambioPassword.passwordNueva;
    return {
      longitudMinima: password.length >= 8,
      tieneMayuscula: /[A-Z]/.test(password),
      tieneMinuscula: /[a-z]/.test(password),
      tieneNumero: /[0-9]/.test(password),
      tieneCaracterEspecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password
      ),
    };
  }

  get passwordValida(): boolean {
    const val = this.validacionPassword;
    return (
      val.longitudMinima &&
      val.tieneMayuscula &&
      val.tieneMinuscula &&
      val.tieneNumero &&
      val.tieneCaracterEspecial
    );
  }

  get passwordsCoinciden(): boolean {
    return (
      this.cambioPassword.passwordNueva ===
        this.cambioPassword.passwordConfirmar &&
      this.cambioPassword.passwordConfirmar.length > 0
    );
  }

  toggleMostrarPassword(campo: string): void {
    switch (campo) {
      case 'actual':
        this.mostrarPasswordActual = !this.mostrarPasswordActual;
        break;
      case 'nueva':
        this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
        break;
      case 'confirmar':
        this.mostrarPasswordConfirmar = !this.mostrarPasswordConfirmar;
        break;
    }
  }

  cambiarPassword(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validaciones
    if (!this.cambioPassword.passwordActual) {
      this.mensajeError = 'Debes ingresar tu contraseña actual';
      return;
    }

    if (!this.cambioPassword.passwordNueva) {
      this.mensajeError = 'Debes ingresar una nueva contraseña';
      return;
    }

    if (!this.passwordValida) {
      this.mensajeError =
        'La nueva contraseña no cumple con todos los requisitos de seguridad';
      return;
    }

    if (!this.passwordsCoinciden) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    if (
      this.cambioPassword.passwordActual === this.cambioPassword.passwordNueva
    ) {
      this.mensajeError = 'La nueva contraseña debe ser diferente a la actual';
      return;
    }

    // Simular llamada al backend
    this.cargando = true;

    setTimeout(() => {
      this.cargando = false;
      this.mensajeExito = '¡Contraseña cambiada exitosamente!';

      // Limpiar el formulario
      this.cambioPassword = {
        passwordActual: '',
        passwordNueva: '',
        passwordConfirmar: '',
      };

      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        this.mensajeExito = '';
      }, 5000);
    }, 1500);
  }

  cancelar(): void {
    this.cambioPassword = {
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: '',
    };
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
