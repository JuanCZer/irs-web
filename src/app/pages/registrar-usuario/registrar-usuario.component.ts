import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UsuariosService,
  CrearUsuarioDTO,
  CatRol,
} from '../../services/usuarios.service';

@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-usuario.component.html',
  styleUrl: './registrar-usuario.component.less',
})
export class RegistrarUsuarioComponent implements OnInit {
  usuario = {
    nombres: '',
    primerApellido: '',
    segundoApellido: '',
    usuario: '',
    alias: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: '',
  };

  mostrarContrasena = false;
  mostrarConfirmarContrasena = false;

  roles: CatRol[] = [];
  cargandoRoles = false;
  registrando = false;

  mensajeExito = '';
  mensajeError = '';

  constructor(private usuariosService: UsuariosService) {}

  async ngOnInit() {
    await this.cargarRoles();
  }

  async cargarRoles() {
    try {
      this.cargandoRoles = true;
      console.log('🔄 Cargando catálogo de roles...');
      this.roles = await this.usuariosService.obtenerRoles();
      console.log('✅ Roles cargados:', this.roles);
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
      this.mensajeError =
        'Error al cargar el catálogo de roles. Por favor, recargue la página.';
    } finally {
      this.cargandoRoles = false;
    }
  }

  get validacionPassword() {
    const password = this.usuario.contrasena;
    return {
      longitudMinima: password.length >= 8,
      tieneMayuscula: /[A-Z]/.test(password),
      tieneMinuscula: /[a-z]/.test(password),
      tieneNumero: /\d/.test(password),
      tieneEspecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }

  get passwordsCoinciden(): boolean {
    return (
      this.usuario.contrasena === this.usuario.confirmarContrasena &&
      this.usuario.confirmarContrasena !== ''
    );
  }

  get formularioValido(): boolean {
    const val = this.validacionPassword;
    return (
      this.usuario.nombres !== '' &&
      this.usuario.primerApellido !== '' &&
      this.usuario.usuario !== '' &&
      this.usuario.rol !== '' &&
      val.longitudMinima &&
      val.tieneMayuscula &&
      val.tieneMinuscula &&
      val.tieneNumero &&
      val.tieneEspecial &&
      this.passwordsCoinciden
    );
  }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarConfirmarContrasena(): void {
    this.mostrarConfirmarContrasena = !this.mostrarConfirmarContrasena;
  }

  async registrarUsuario() {
    if (!this.formularioValido) {
      this.mensajeError =
        'Por favor, complete todos los campos requeridos correctamente.';
      this.mensajeExito = '';
      return;
    }

    try {
      this.registrando = true;
      this.mensajeError = '';
      this.mensajeExito = '';

      console.log('📝 Preparando datos para registro...');

      // Construir el DTO para crear usuario
      const nuevoUsuario: CrearUsuarioDTO = {
        nombre: this.usuario.nombres,
        app: this.usuario.primerApellido,
        apm: this.usuario.segundoApellido || undefined,
        alias: this.usuario.alias || undefined,
        usuario: this.usuario.usuario,
        password: this.usuario.contrasena,
        status: 1, // Activo por defecto
        idRol: parseInt(this.usuario.rol),
      };

      console.log('🚀 Registrando usuario:', nuevoUsuario.usuario);

      // Llamar al servicio para crear el usuario
      await this.usuariosService.crearUsuario(nuevoUsuario);

      console.log('✅ Usuario registrado exitosamente');

      // Mostrar mensaje de éxito
      this.mensajeExito = `Usuario "${nuevoUsuario.usuario}" registrado correctamente.`;
      this.mensajeError = '';

      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        this.limpiarFormulario();
      }, 2000);
    } catch (error) {
      console.error('❌ Error al registrar usuario:', error);
      this.mensajeError =
        error instanceof Error
          ? `Error: ${error.message}`
          : 'Error al registrar el usuario. Por favor, intente nuevamente.';
      this.mensajeExito = '';
    } finally {
      this.registrando = false;
    }
  }

  limpiarFormulario(): void {
    this.usuario = {
      nombres: '',
      primerApellido: '',
      segundoApellido: '',
      usuario: '',
      alias: '',
      contrasena: '',
      confirmarContrasena: '',
      rol: '',
    };
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  verTutorial(): void {
    console.log('Ver tutorial de registro de usuarios');
    // Aquí iría la lógica para mostrar el tutorial
  }
}
