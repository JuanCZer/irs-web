import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';
import {
  UsuariosService,
  CambiarContrasenaDTO,
  RespuestaCambioContrasenaDTO,
} from '../../services/usuarios.service';

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
    private usuariosService: UsuariosService,
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.usuario = this.authService.currentUserValue;
    if (this.usuario) {
      this.nombreCompleto = this.authService.getNombreCompleto();
      this.ultimoAccesoFormateado = this.formatearFecha(
        this.usuario.ultimoAcceso,
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
        password,
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

  private validateCambioPassword(): string | null {
    const actual = (this.cambioPassword.passwordActual || '').trim();
    const nueva = (this.cambioPassword.passwordNueva || '').trim();
    const confirmar = (this.cambioPassword.passwordConfirmar || '').trim();

    if (!actual) return 'Debes ingresar tu contraseña actual';
    if (!nueva) return 'Debes ingresar una nueva contraseña';
    if (!this.passwordValida)
      return 'La nueva contraseña no cumple con todos los requisitos de seguridad';
    if (nueva !== confirmar) return 'Las contraseñas no coinciden';
    if (actual === nueva)
      return 'La nueva contraseña debe ser diferente a la actual';

    return null;
  }

  cambiarPassword(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validaciones (centralizadas)
    const validError = this.validateCambioPassword();
    if (validError) {
      this.mensajeError = validError;
      return;
    }

    // Llamada real al backend
    this.cargando = true;

    const datoCambio = {
      idUsuario: this.usuario?.idUsuario || 0,
      contraseñaActual: (this.cambioPassword.passwordActual || '').trim(),
      contraseñaNueva: (this.cambioPassword.passwordNueva || '').trim(),
      confirmarContraseña: (this.cambioPassword.passwordConfirmar || '').trim(),
    };

    this.usuariosService
      .cambiarContrasena(datoCambio)
      .then((respuesta) => {
        this.cargando = false;
        if (respuesta.exitoso) {
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
        } else {
          this.mensajeError =
            respuesta.mensaje || 'Error al cambiar la contraseña';
          if (respuesta.errores && respuesta.errores.length > 0) {
            this.mensajeError += ': ' + respuesta.errores.join(', ');
          }
        }
      })
      .catch((error) => {
        this.cargando = false;
        this.mensajeError = 'Error al cambiar la contraseña: ' + error.message;
      });
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
