import { Injectable } from '@angular/core';

export interface IrsRuntimeConfig {
  /**
   * Base pública de la API. Si se omite, se utiliza `/api` en el mismo host
   * desde el que se sirve Angular.
   */
  apiBaseUrl?: string;
}

declare global {
  interface Window {
    __IRS_CONFIG__?: IrsRuntimeConfig;
  }
}

const DEFAULT_API_BASE_URL = '/api';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiBaseUrl = this.resolveApiBaseUrl();

  fetch(endpoint: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    const method = (init.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      headers.set('X-IRS-Request', '1');
    }

    return fetch(this.buildUrl(endpoint), {
      ...init,
      credentials: 'include',
      headers,
    });
  }

  buildUrl(endpoint: string): string {
    const trimmedEndpoint = endpoint.trim();

    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(trimmedEndpoint)) {
      throw new Error('Los endpoints de la API deben ser rutas relativas.');
    }

    const normalizedEndpoint = trimmedEndpoint.replace(/^\/+/, '');
    const endpointPath = normalizedEndpoint.split(/[?#]/, 1)[0];
    if (endpointPath.split('/').some((segment) => segment === '..')) {
      throw new Error('El endpoint de la API contiene una ruta no permitida.');
    }

    return normalizedEndpoint
      ? `${this.apiBaseUrl}/${normalizedEndpoint}`
      : this.apiBaseUrl;
  }

  private resolveApiBaseUrl(): string {
    if (typeof window === 'undefined') {
      return DEFAULT_API_BASE_URL;
    }

    const configuredUrl = window.__IRS_CONFIG__?.apiBaseUrl?.trim();
    if (!configuredUrl) {
      return DEFAULT_API_BASE_URL;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(configuredUrl, window.location.origin);
    } catch {
      throw new Error('La URL base configurada para la API no es válida.');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('La URL base de la API debe utilizar HTTP o HTTPS.');
    }

    parsedUrl.search = '';
    parsedUrl.hash = '';
    return parsedUrl.toString().replace(/\/+$/, '');
  }
}
