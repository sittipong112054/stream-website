import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
export type Role = 'USER' | 'ADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'auth_token';
  private ROLE_KEY = 'auth_role';

  loggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
  role$ = new BehaviorSubject<Role | null>((localStorage.getItem(this.ROLE_KEY) as Role) || null);

  // ===== helpers แบบ sync สำหรับ guard/router =====
  isLoggedIn(): boolean { return this.loggedIn$.getValue(); }
  role(): Role | null { return this.role$.getValue(); }

  login(email: string, password: string, role: Role = 'USER') {
    // mock; ต่อ API จริงทีหลัง
    localStorage.setItem(this.TOKEN_KEY, 'fake-jwt');
    localStorage.setItem(this.ROLE_KEY, role);
    this.loggedIn$.next(true);
    this.role$.next(role);
    return true;
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.loggedIn$.next(false);
    this.role$.next(null);
  }
}
