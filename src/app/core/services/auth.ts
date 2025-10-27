import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap, catchError, of, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserStore, UserProfile } from '../../stores/user.store';
import { Constants } from '../../config/constants';

export type Role = 'USER' | 'ADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private ROLE_KEY = 'auth_role';
  private _sessionLoaded = false;

  // ✅ เริ่มต้นเป็น null = ยังไม่รู้สถานะ (จะไม่กะพริบ)
  loggedIn$ = new BehaviorSubject<boolean | null>(null);
  role$ = new BehaviorSubject<Role | null>(
    (localStorage.getItem(this.ROLE_KEY) as Role) || null
  );

  constructor(
    private http: HttpClient,
    private userStore: UserStore,
    private constants: Constants
  ) {}

  // ----------------- Register -----------------
  registerWithAvatar$(payload: {
    username: string;
    email: string;
    password: string;
    avatar: File | null;
  }): Observable<any> {
    const fd = new FormData();
    fd.append('username', payload.username);
    fd.append('email', payload.email);
    fd.append('password', payload.password);
    if (payload.avatar) fd.append('avatar', payload.avatar);

    return this.http.post(`${this.constants.API_URL}/auth/register`, fd, {
      withCredentials: true,
    });
  }

  // ----------------- Login -----------------
  login$(usernameOrEmail: string, password: string) {
    return this.http
      .post<any>(
        `${this.constants.API_URL}/auth/login`,
        { usernameOrEmail, password },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          const user = res?.user;
          this.loggedIn$.next(true);
          this.role$.next(user?.role ?? null);
          localStorage.setItem(this.ROLE_KEY, user?.role ?? '');
        }),
        map(() => true)
      );
  }

  // ----------------- Logout -----------------
  logout$() {
    return this.http
      .post(`${this.constants.API_URL}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          localStorage.removeItem(this.ROLE_KEY);
          this.loggedIn$.next(false);
          this.role$.next(null);
          this.userStore.setProfile(null as any);
        })
      );
  }

  // ----------------- Me -----------------
  me$() {
    return this.http
      .get<any>(`${this.constants.API_URL}/auth/me`, { withCredentials: true })
      .pipe(
        map((res) => {
          const u = res?.user ?? {};
          return {
            id: u.id,
            displayName: u.username,
            email: u.email,
            walletBalance: u.wallet_balance ?? 0,
            avatarUrl: u.avatarUrl ?? null,
          } as UserProfile;
        }),
        tap((profile) => {
          this.userStore.setProfile(profile);
          this.loggedIn$.next(!!profile);
        }),
        catchError(() => {
          this.userStore.setProfile(null as any);
          this.loggedIn$.next(false);
          return of(null);
        })
      );
  }

  // ----------------- Helper -----------------
  isLoggedIn(): boolean {
    return this.loggedIn$.getValue() === true;
  }

  role(): Role | null {
    return this.role$.getValue();
  }

  // ✅ เรียกจาก APP_INITIALIZER หรือ Guards
  ensureSession$() {
    if (this._sessionLoaded) return of(true);
    return this.me$().pipe(
      take(1),
      tap(() => (this._sessionLoaded = true)),
      map(() => true),
      catchError(() => of(true))
    );
  }
}
