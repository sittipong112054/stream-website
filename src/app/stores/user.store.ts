import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
  id: number;
  displayName: string;
  email: string;
  walletBalance: number;
  avatarUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private _profile$ = new BehaviorSubject<UserProfile | null>(null);
  /** Observable สำหรับใช้ใน template หรือ subscribe */
  profile$ = this._profile$.asObservable();

  /** ใช้ตอนต้องการอัปเดตเฉพาะบาง field */
  setProfile(next: Partial<UserProfile> | UserProfile) {
    const cur = this._profile$.getValue() ?? {} as UserProfile;
    this._profile$.next({ ...cur, ...next });
  }

  /** ล้างข้อมูล (ตอน logout) */
  clearProfile() {
    this._profile$.next(null);
  }


  /** getter สำหรับใช้ใน service */
  getProfile(): UserProfile | null {
    return this._profile$.getValue();
  }
}
