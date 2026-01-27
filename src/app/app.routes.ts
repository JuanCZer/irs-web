import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./pages/inicio/inicio.component').then(
            (m) => m.InicioComponent
          ),
      },
      {
        path: 'fichas/registrar',
        loadComponent: () =>
          import('./pages/fichas/fichas.component').then(
            (m) => m.FichasComponent
          ),
      },
      {
        path: 'fichas/borradores',
        loadComponent: () =>
          import('./pages/fichas-borradores/fichas-borradores.component').then(
            (m) => m.FichasBorradoresComponent
          ),
      },
      {
        path: 'consultar-fichas/dia',
        loadComponent: () =>
          import('./pages/consultar-fichas/consultar-fichas.component').then(
            (m) => m.ConsultarFichasComponent
          ),
      },
      {
        path: 'consultar-fichas/todas',
        loadComponent: () =>
          import(
            './pages/consultar-todas-fichas/consultar-todas-fichas.component'
          ).then((m) => m.ConsultarTodasFichasComponent),
      },
      {
        path: 'mapa-fichas',
        loadComponent: () =>
          import('./pages/mapa-fichas/mapa-fichas.component').then(
            (m) => m.MapaFichasComponent
          ),
      },
      {
        path: 'rutas/generar',
        loadComponent: () =>
          import('./pages/rutas/rutas.component').then((m) => m.RutasComponent),
      },
      {
        path: 'rutas/asignadas',
        loadComponent: () =>
          import('./pages/rutas/rutas.component').then((m) => m.RutasComponent),
      },
      {
        path: 'rutas/mis-rutas',
        loadComponent: () =>
          import('./pages/rutas/rutas.component').then((m) => m.RutasComponent),
      },
      {
        path: 'clientes/registrar',
        loadComponent: () =>
          import('./pages/clientes/clientes.component').then(
            (m) => m.ClientesComponent
          ),
      },
      {
        path: 'clientes/editar',
        loadComponent: () =>
          import('./pages/clientes/clientes.component').then(
            (m) => m.ClientesComponent
          ),
      },
      {
        path: 'personal/registrar',
        loadComponent: () =>
          import('./pages/personal/personal.component').then(
            (m) => m.PersonalComponent
          ),
      },
      {
        path: 'personal/editar',
        loadComponent: () =>
          import('./pages/personal/personal.component').then(
            (m) => m.PersonalComponent
          ),
      },
      {
        path: 'admin-usuarios/registrar',
        loadComponent: () =>
          import('./pages/registrar-usuario/registrar-usuario.component').then(
            (m) => m.RegistrarUsuarioComponent
          ),
      },
      {
        path: 'admin-usuarios/editar',
        loadComponent: () =>
          import('./pages/editar-usuario/editar-usuario.component').then(
            (m) => m.EditarUsuarioComponent
          ),
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./pages/estadisticas/estadisticas.component').then(
            (m) => m.EstadisticasComponent
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil.component').then(
            (m) => m.PerfilComponent
          ),
      },
      {
        path: 'despacho',
        loadComponent: () =>
          import('./pages/despacho/despacho.component').then(
            (m) => m.DespachoComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
