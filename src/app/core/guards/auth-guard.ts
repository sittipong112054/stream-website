import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';


export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const needRoles = route.data?.['roles'] as string[] | undefined;
  const userRole = auth.role();

  if (needRoles && (!userRole || !needRoles.includes(userRole))) {
    if (userRole === 'ADMIN') {
      return router.createUrlTree(['/admin']);
    } else if (userRole === 'USER') {
      return router.createUrlTree(['/user']);
    } else {
      return router.createUrlTree(['/login']);
    }
  }

  return true;
};

export const loginGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const userRole = auth.role();
    return router.createUrlTree(userRole === 'ADMIN' ? ['/admin'] : ['/user']);
  }

  return true;
};
