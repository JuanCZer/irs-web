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
  sidebarActive = true;
  sidebarCollapsed = false;
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

  get isDispatchRole(): boolean {
    return this.authService.isDispatch();
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

      this.sidebarCollapsed = !this.sidebarCollapsed;

      this.navbarService.setSidebarCollapsed(this.sidebarCollapsed);

      if (this.sidebarCollapsed) {
        this.submenuOpen = {};
      }
    }
  }

  toggleSubmenu(menu: string) {

    const wasOpen = this.submenuOpen[menu];


    Object.keys(this.submenuOpen).forEach((key) => {
      this.submenuOpen[key] = false;
    });


    this.submenuOpen[menu] = !wasOpen;


    if (this.sidebarCollapsed && this.submenuOpen[menu]) {
      this.sidebarCollapsed = false;
    }
  }





  handleSubmenuClick(event: MouseEvent, menu: string) {
    event.preventDefault();

    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
      this.navbarService.setSidebarCollapsed(this.sidebarCollapsed);


      Object.keys(this.submenuOpen).forEach(
        (key) => (this.submenuOpen[key] = false),
      );

      setTimeout(() => {
        this.submenuOpen[menu] = true;
      }, 10);
      return;
    }


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

  logOut() {
    this.closeSidebarOnMobile();
    this.authService.logout();
  }
}
