import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dispatchGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated && !(await authService.validateSession())) {
    return router.createUrlTree(['/login']);
  }

  return authService.isDispatch()
    ? true
    : router.createUrlTree(['/inicio']);
};
