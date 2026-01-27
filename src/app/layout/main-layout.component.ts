import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { NavbarService } from '../services/navbar.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.less',
})
export class  MainLayoutComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  sidebarCollapsed = false;
  nombreUsuario = 'Usuario';
  private subscription: Subscription = new Subscription();

  constructor(
    private navbarService: NavbarService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.navbarService.sidebarCollapsed$.subscribe((collapsed) => {
        this.sidebarCollapsed = collapsed;
      })
    );

    // Actualizar nombre del usuario cuando cambie
    this.subscription.add(
      this.authService.currentUser.subscribe((user) => {
        this.nombreUsuario = this.authService.getNombreCompleto();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
