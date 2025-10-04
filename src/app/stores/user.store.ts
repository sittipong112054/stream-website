import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserProfile {
    displayName: string;
    avatarUrl?: string;
    walletBalance: number;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
    profile$ = new BehaviorSubject<UserProfile>({
        displayName: 'NameProfile',
        avatarUrl: 'assets/avatar-sample.jpg',
        walletBalance: 50000,
    });

    setWallet(amount: number) {
        const p = this.profile$.getValue();
        this.profile$.next({ ...p, walletBalance: amount });
    }
    setProfile(next: Partial<UserProfile>) {
        this.profile$.next({ ...this.profile$.getValue(), ...next });
    }
}
