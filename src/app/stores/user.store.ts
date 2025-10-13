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
  [x: string]: any;
  topup(amount: number): import("rxjs").Observable<unknown> {
    throw new Error('Method not implemented.');
  }
  private _profile$ = new BehaviorSubject<UserProfile | null>(null);
  profile$ = this._profile$.asObservable();

  setProfile(next: Partial<UserProfile> | UserProfile) {
    const cur = this._profile$.getValue() ?? {} as UserProfile;
    this._profile$.next({ ...cur, ...next });
  }

  clearProfile() {
    this._profile$.next(null);
  }


  getProfile(): UserProfile | null {
    return this._profile$.getValue();
  }
}
