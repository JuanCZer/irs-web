import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated && !(await authService.validateSession())) {
    return router.createUrlTree(['/login']);
  }

  return authService.isAdmin()
    ? true
    : router.createUrlTree(['/inicio']);
};
