import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';


// ป้องกันหน้าที่ต้องล็อกอิน + เช็ค role จาก route.data.roles
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const needRoles = route.data?.['roles'] as string[] | undefined;
  const userRole = auth.role();

  if (needRoles && (!userRole || !needRoles.includes(userRole))) {
    // ถ้า role ไม่ตรง ส่งกลับหน้าหลักตามบทบาท
    return router.createUrlTree(userRole === 'ADMIN' ? ['/admin'] : ['/user']);
  }

  return true;
};

// กันหน้า login/register เมื่อ "ล็อกอินแล้ว"
export const loginGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const userRole = auth.role();
    return router.createUrlTree(userRole === 'ADMIN' ? ['/admin'] : ['/user']);
  }
  return true;
};
