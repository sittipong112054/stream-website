// src/app/core/guards/auth-guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';
import { of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';

/**
 * Guard สำหรับหน้าที่ต้องล็อกอินก่อนเข้า (ทั้ง USER / ADMIN)
 * จะรอให้ AuthService.ensureSession$() ดึงข้อมูล /auth/me เสร็จก่อน
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): any => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession$().pipe(
    take(1),
    map(() => {
      const loggedIn = auth.isLoggedIn();
      const role = auth.role();
      const needRoles = route.data?.['roles'] as string[] | undefined;

      // ❌ ยังไม่ล็อกอิน → กลับหน้า login
      if (!loggedIn) return router.createUrlTree(['/login']);

      // ❌ มี role ที่ไม่ตรงกับ route
      if (needRoles && role && !needRoles.includes(role)) {
        return router.createUrlTree(role === 'ADMIN' ? ['/admin'] : ['/user']);
      }

      return true;
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

/**
 * Guard สำหรับหน้า Login / Register
 * ถ้าล็อกอินอยู่แล้ว จะส่งกลับหน้า dashboard ตาม role
 */
export const loginGuard: CanActivateFn = (): any => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureSession$().pipe(
    take(1),
    map(() => {
      const loggedIn = auth.isLoggedIn();
      const role = auth.role();

      if (loggedIn) {
        return router.createUrlTree(role === 'ADMIN' ? ['/admin'] : ['/user']);
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
