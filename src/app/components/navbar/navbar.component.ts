import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarService } from '../../services/navbar.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less',
})
export class NavbarComponent {
  sidebarActive = true; // Empezar con sidebar abierto
  sidebarCollapsed = false; // Nueva propiedad para colapsar
  submenuOpen: { [key: string]: boolean } = {};
  isMobile = false;

  constructor(
    private router: Router,
    private navbarService: NavbarService,
    public authService: AuthService
  ) {
    this.checkScreenSize();
  }

  get esRolDespacho(): boolean {
    const usuario = this.authService.currentUserValue;
    return usuario?.idRol === 6;
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    // En desktop, el sidebar siempre está visible
    if (!this.isMobile) {
      this.sidebarActive = true;
    }
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarActive = !this.sidebarActive;
    } else {
      // En desktop, colapsar/expandir
      this.sidebarCollapsed = !this.sidebarCollapsed;
      // Notificar al servicio
      this.navbarService.setSidebarCollapsed(this.sidebarCollapsed);
      // Cerrar todos los submenus al colapsar
      if (this.sidebarCollapsed) {
        this.submenuOpen = {};
      }
    }
  }

  toggleSubmenu(menu: string) {
    // Cerrar otros submenus cuando se abre uno nuevo
    const wasOpen = this.submenuOpen[menu];

    // Cerrar todos los submenus
    Object.keys(this.submenuOpen).forEach((key) => {
      this.submenuOpen[key] = false;
    });

    // Abrir el submenu seleccionado (o cerrarlo si ya estaba abierto)
    this.submenuOpen[menu] = !wasOpen;

    // Si el sidebar está colapsado, expandirlo al abrir un submenu
    if (this.sidebarCollapsed && this.submenuOpen[menu]) {
      this.sidebarCollapsed = false;
    }
  }

  closeSidebarOnMobile() {
    if (this.isMobile) {
      this.sidebarActive = false;
    }
    // Cerrar todos los submenús cuando se navega a cualquier enlace
    this.closeAllSubmenus();
  }

  closeAllSubmenus() {
    Object.keys(this.submenuOpen).forEach((key) => {
      this.submenuOpen[key] = false;
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  cerrarSesion() {
    console.log('🚪 Cerrando sesión desde navbar...');
    this.closeSidebarOnMobile();
    this.authService.logout();
  }
}
