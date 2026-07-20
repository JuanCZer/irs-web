import { Component, HostListener, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarService } from '../../services/navbar.service';
import { AuthService } from '../../services/auth.service';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.less',
})
export class NavbarComponent implements OnDestroy {
  sidebarActive = true; // Empezar con sidebar abierto
  sidebarCollapsed = false; // Nueva propiedad para colapsar
  submenuOpen: { [key: string]: boolean } = {};
  isMobile = false;
  private routerSubscription = new Subscription();

  constructor(
    private router: Router,
    private navbarService: NavbarService,
    public authService: AuthService,
  ) {
    this.checkScreenSize();
    if (this.isMobile) {
      this.sidebarActive = false;
    }

    this.syncActiveSection();
    this.routerSubscription.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => this.syncActiveSection()),
    );
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

    if (this.isMobile && this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
      this.navbarService.setSidebarCollapsed(false);
    }

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

  /**
   * Handle clicks on submenu toggles so that when the sidebar is collapsed
   * it behaves like `toggleSidebar()` (expands) and then opens the submenu.
   */
  handleSubmenuClick(event: MouseEvent, menu: string) {
    event.preventDefault();
    // If collapsed, expand and open the submenu
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
      this.navbarService.setSidebarCollapsed(this.sidebarCollapsed);
      // open the submenu
      // close others first
      Object.keys(this.submenuOpen).forEach(
        (key) => (this.submenuOpen[key] = false),
      );
      // small delay to allow CSS/layout update (next tick)
      setTimeout(() => {
        this.submenuOpen[menu] = true;
      }, 10);
      return;
    }

    // Default behaviour when not collapsed
    this.toggleSubmenu(menu);
  }

  closeSidebarOnMobile() {
    if (this.isMobile) {
      this.sidebarActive = false;
      this.closeAllSubmenus();
    }
  }

  closeAllSubmenus() {
    Object.keys(this.submenuOpen).forEach((key) => {
      this.submenuOpen[key] = false;
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  isActiveSection(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  private syncActiveSection(): void {
    this.submenuOpen = {};

    if (this.router.url.startsWith('/fichas')) {
      this.submenuOpen['fichas'] = true;
    } else if (this.router.url.startsWith('/consultar-fichas')) {
      this.submenuOpen['consultar-fichas'] = true;
    } else if (this.router.url.startsWith('/admin-usuarios')) {
      this.submenuOpen['admin-usuarios'] = true;
    }
  }

  cerrarSesion() {
    this.closeSidebarOnMobile();
    this.authService.logout();
  }
}
