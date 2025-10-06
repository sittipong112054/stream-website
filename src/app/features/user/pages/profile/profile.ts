import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserProfile, UserStore } from '../../../../stores/user.store';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';

type TxType = 'TOPUP' | 'BUY';

interface Tx {
  id: string;
  type: TxType;
  title: string;
  amount: number;
  at: string;
}

interface GameItem {
  id: string;
  title: string;
  cover: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  // ต้องเป็น public เพื่อใช้ใน template
  public user = inject(UserStore);
  public auth = inject(AuthService);
  public router = inject(Router);

  // ถ้า profile$.next(...) เป็น null ได้ ให้ใส่ | null ไว้ด้วย
  public profile$: Observable<UserProfile | null> = this.user.profile$;

  // mock (ยังใช้แสดงหน้าได้ ถ้าอยากเอาออกก็ได้)
  avatar = signal('/assets/sample/avatar-1.jpg');
  username = signal('NameProfile');
  email = signal('emailaddress@gmail.com');

  balance = signal(500.0);
  quickAdd = [100, 200, 500];
  customAdd = signal<number | null>(null);

  games = signal<GameItem[]>([
    { id: '1', title: 'Mass Effect', cover: '/assets/Mass Effect.jpg' },
    { id: '2', title: 'DOOM', cover: '/assets/Mass Effect.jpg' },
    { id: '3', title: 'Borderlands 2', cover: '/assets/Mass Effect.jpg' },
    { id: '4', title: 'Skyrim', cover: '/assets/Mass Effect.jpg' },
    { id: '5', title: 'Black Mesa', cover: '/assets/Mass Effect.jpg' },
    { id: '6', title: 'Crysis', cover: '/assets/Mass Effect.jpg' },
    { id: '7', title: 'Garry’s Mod', cover: '/assets/Mass Effect.jpg' },
    { id: '8', title: 'Fallout 4', cover: '/assets/Mass Effect.jpg' },
    { id: '9', title: 'BioShock', cover: '/assets/Mass Effect.jpg' },
    { id: '10', title: 'Half-Life 2', cover: '/assets/Mass Effect.jpg' },
  ]);

  transactions = signal<Tx[]>([
    { id: 't3', type: 'TOPUP', title: 'Add Funds', amount: +500, at: '10:24' },
    { id: 't2', type: 'BUY', title: 'Buy DOOM', amount: -400, at: '09:12' },
    { id: 't1', type: 'BUY', title: 'Buy Black Mesa', amount: -100, at: '08:30' },
  ]);

  onCustomAddChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const v = input.valueAsNumber;
    this.customAdd.set(Number.isFinite(v) ? v : 0);
  }

  addFunds(amount: number) {
    if (amount <= 0) return;
    this.balance.update((b) => +(b + amount).toFixed(2));
    this.transactions.update((list) => [
      {
        id: crypto.randomUUID(),
        type: 'TOPUP',
        title: 'Add Funds',
        amount,
        at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...list,
    ]);
    this.customAdd.set(null);
  }

  addCustom() {
    const v = Number(this.customAdd() ?? 0);
    if (!Number.isFinite(v) || v <= 0) return;
    this.addFunds(v);
  }

  logout() {
    this.auth.logout$().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
