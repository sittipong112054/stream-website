import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserStore, UserProfile } from '../../stores/user.store';
import { Constants } from '../../config/constants';

export type Role = 'USER' | 'ADMIN';

@Injectable({ providedIn: 'root' })
export class AuthService {
  topup(amount: number): Observable<unknown> {
    throw new Error('Method not implemented.');
  }
  getMyTransactions() {
    throw new Error('Method not implemented.');
  }
  private ROLE_KEY = 'auth_role';

  // ให้ค่าเริ่มต้น = ยังไม่รู้ (false/null) แล้วค่อยอัปเดตจาก me$()
  loggedIn$ = new BehaviorSubject<boolean>(false);
  role$ = new BehaviorSubject<Role | null>(null);

  constructor(
    private http: HttpClient,
    private userStore: UserStore,
    private constants: Constants
  ) {}

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
  isLoggedIn(): boolean {
    return this.loggedIn$.getValue();
  }

  role(): Role | null {
    return this.role$.getValue();
  }

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
        }),
        map(() => true)
      );
  }

  logout$() {
    return this.http
      .post(
        `${this.constants.API_URL}/auth/logout`,
        {}, // ❌ ไม่ต้องส่ง token
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          // ❌ ไม่ต้องยุ่ง localStorage token แล้ว
          localStorage.removeItem(this.ROLE_KEY);
          this.loggedIn$.next(false);
          this.role$.next(null);
          this.userStore.setProfile(null as any);
        })
      );
  }

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
          // อัปเดต store + สถานะ auth
          this.userStore.setProfile(profile as any);
          const ok = !!profile;
          this.loggedIn$.next(ok);
          // ถ้า response /me ไม่มี role (ปกติมี) ก็ไม่แก้ role$
          if (ok) {
            // เลือก role จาก store เดิมหรือจาก /me (ถ้าคุณส่งมา)
            // this.role$.next((res.user.role as Role) ?? this.role$.value);
          } else {
            this.role$.next(null);
          }
        }),
        catchError((err) => {
          // ไม่มี session หรือ 401
          this.loggedIn$.next(false);
          this.role$.next(null);
          this.userStore.setProfile(null as any);
          return of(null);
        })
      );
  }
}
