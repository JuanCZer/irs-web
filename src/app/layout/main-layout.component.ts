import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { AuthService } from '../services/auth.service';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.less',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  currentPageTitle = 'Inicio';
  sidebarCollapsed = false;
  nombreUsuario = 'Usuario';
  nombreRol = 'Usuario autorizado';
  userInitials = 'US';

  private subscription = new Subscription();

  private readonly routeTitles: Array<[string, string]> = [
    ['/fichas/registrar', 'Registrar ficha'],
    ['/fichas/borradores', 'Borradores'],
    ['/consultar-fichas/dia', 'Fichas del día'],
    ['/consultar-fichas/todas', 'Consulta histórica'],
    ['/mapa-fichas', 'Mapa de fichas'],
    ['/estadisticas', 'Estadísticas'],
    ['/despacho', 'Despacho'],
    ['/admin-usuarios/registrar', 'Registrar usuario'],
    ['/admin-usuarios/editar', 'Administración de usuarios'],
    ['/perfil', 'Seguridad de la cuenta'],
    ['/inicio', 'Resumen operativo'],
  ];

  constructor(
    private navbarService: NavbarService,
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.updatePageTitle(this.router.url);

    this.subscription.add(
      this.navbarService.sidebarCollapsed$.subscribe((collapsed) => {
        this.sidebarCollapsed = collapsed;
      }),
    );

    this.subscription.add(
      this.authService.currentUser.subscribe((user) => {
        this.nombreUsuario = this.authService.getNombreCompleto();
        this.nombreRol = user?.nombreRol || 'Usuario autorizado';
        this.userInitials = this.getInitials(this.nombreUsuario);
      }),
    );

    this.subscription.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.updatePageTitle((event as NavigationEnd).urlAfterRedirects);
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updatePageTitle(url: string): void {
    const match = this.routeTitles.find(([route]) => url.startsWith(route));
    this.currentPageTitle = match?.[1] || 'Sistema IRS';
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'US';

    const first = parts[0].charAt(0);
    const second = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return `${first}${second}`.toUpperCase();
  }
}
