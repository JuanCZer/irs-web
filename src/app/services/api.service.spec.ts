import { ApiService } from './api.service';

describe('ApiService', () => {
  const originalRuntimeConfig = window.__IRS_CONFIG__;

  afterEach(() => {
    window.__IRS_CONFIG__ = originalRuntimeConfig;
  });

  it('utiliza /api sobre el host actual cuando no existe configuración', () => {
    window.__IRS_CONFIG__ = { apiBaseUrl: '' };
    const service = new ApiService();

    expect(service.buildUrl('usuarios')).toBe('/api/usuarios');
    expect(service.buildUrl('/roles?activos=true')).toBe(
      '/api/roles?activos=true',
    );
  });

  it('permite configurar otro origen en tiempo de despliegue', () => {
    window.__IRS_CONFIG__ = {
      apiBaseUrl: 'https://api.ejemplo.test/api/',
    };
    const service = new ApiService();

    expect(service.buildUrl('auth/login')).toBe(
      'https://api.ejemplo.test/api/auth/login',
    );
  });

  it('rechaza endpoints absolutos para evitar saltarse la configuración', () => {
    const service = new ApiService();

    expect(() => service.buildUrl('https://otro-host.test/api')).toThrowError(
      'Los endpoints de la API deben ser rutas relativas.',
    );
    expect(() => service.buildUrl('//otro-host.test/api')).toThrowError(
      'Los endpoints de la API deben ser rutas relativas.',
    );
  });
});
