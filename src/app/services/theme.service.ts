import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ColorTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'irs-color-theme';
  private readonly currentTheme = signal<ColorTheme>('light');

  readonly theme = this.currentTheme.asReadonly();

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    this.applyTheme(this.getInitialTheme());
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ColorTheme): void {
    this.applyTheme(theme);

    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.storageKey, theme);
      } catch {
        // El tema sigue funcionando aunque el navegador bloquee el almacenamiento.
      }
    }
  }

  private getInitialTheme(): ColorTheme {
    if (!isPlatformBrowser(this.platformId)) return 'light';

    try {
      const storedTheme = localStorage.getItem(this.storageKey);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    } catch {
      // Si no hay acceso al almacenamiento, usamos la preferencia del sistema.
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private applyTheme(theme: ColorTheme): void {
    this.currentTheme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;

    const themeColor = theme === 'dark' ? '#10171c' : '#f3f5f6';
    this.document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', themeColor);
  }
}
