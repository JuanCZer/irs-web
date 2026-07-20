import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.less',
})
export class InicioComponent {
  readonly currentDate = this.formatCurrentDate();
  readonly greeting = this.getGreeting();
  readonly nombreUsuario: string;
  readonly nombreRol: string;

  constructor(private authService: AuthService) {
    const fullName = this.authService.getNombreCompleto();
    this.nombreUsuario = fullName.split(/\s+/)[0] || 'Usuario';
    this.nombreRol =
      this.authService.currentUserValue?.nombreRol || 'Usuario autorizado';
  }

  private formatCurrentDate(): string {
    const date = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    return date.charAt(0).toUpperCase() + date.slice(1);
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
