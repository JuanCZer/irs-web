import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.less',
})
export class ThemeToggleComponent {
  constructor(readonly themeService: ThemeService) {}

  get isDark(): boolean {
    return this.themeService.theme() === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
