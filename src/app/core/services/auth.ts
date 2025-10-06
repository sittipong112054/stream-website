import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserStore, UserProfile } from '../../stores/user.store';

export type Role = 'USER' | 'ADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'auth_token';
  private ROLE_KEY = 'auth_role';
  private API_URL = 'http://localhost:3002/auth';

  loggedIn$ = new BehaviorSubject<boolean>(
    !!localStorage.getItem(this.TOKEN_KEY)
  );
  role$ = new BehaviorSubject<Role | null>(
    (localStorage.getItem(this.ROLE_KEY) as Role) || null
  );

  constructor(private http: HttpClient, private userStore: UserStore) {}

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

    return this.http.post(`${this.API_URL}/register`, fd, {
      withCredentials: true,
    });
  }
  isLoggedIn(): boolean {
    return this.loggedIn$.getValue();
  }

  role(): Role | null {
    return this.role$.getValue();
  }

  login$(usernameOrEmail: string, password: string) {
    return this.http
      .post<any>(
        `${this.API_URL}/login`,
        { usernameOrEmail, password },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          const { token, user } = res;
          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.ROLE_KEY, user.role);
          this.loggedIn$.next(true);
          this.role$.next(user.role);
        }),
        map(() => true)
      );
  }

  logout$() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return this.http
      .post(`${this.API_URL}/logout`, { token }, { withCredentials: true })
      .pipe(
        tap(() => {
          localStorage.removeItem(this.TOKEN_KEY);
          localStorage.removeItem(this.ROLE_KEY);
          this.loggedIn$.next(false);
          this.role$.next(null);
          this.userStore.setProfile(null as any);
        })
      );
  }

  /** โหลดโปรไฟล์ */
  me$() {
    const API_BASE = 'http://localhost:3002';
    return this.http
      .get<any>(`${this.API_URL}/me`, { withCredentials: true })
      .pipe(
        
        map((res) => {
          const u = res?.user ?? {};
          return {
            id: u.id,
            displayName: u.username,
            email: u.email,
            walletBalance: u.wallet_balance ?? 0,
            avatarUrl: u.avatarUrl ?? null,
          }as UserProfile;
        }),
        tap((profile) => this.userStore.setProfile(profile)),
        tap((profile) => {
          console.log('[me$] profile loaded', profile);
          this.userStore.setProfile(profile);
        }),

        catchError(() => {
          this.userStore.setProfile(null as any);
          return of(null);
        })
      );
  }
}
