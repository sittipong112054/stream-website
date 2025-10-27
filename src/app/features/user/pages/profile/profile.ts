import { Component, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserProfile, UserStore } from '../../../../stores/user.store';
import { firstValueFrom, Observable } from 'rxjs';
import { UserService } from '../../../../core/services/user';
import { AuthService } from '../../../../core/services/auth';
import { Constants } from '../../../../config/constants';

type TxType = 'TOPUP' | 'BUY';

interface Tx {
  id: string;
  type: TxType;
  title: string;
  amount: number;
  at: string;
}

interface PurchaseItem {
  orderId: number;
  title: string;
  cover: string;
  price: number;
  date: string;
}

interface GameItem { id: string; title: string; cover: string; }

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  public user = inject(UserStore);
  public auth = inject(AuthService);
  public router = inject(Router);
  private userApi: UserService = inject(UserService);
  private constants = inject(Constants);

  public profile$: Observable<UserProfile | null> = this.user.profile$;

  /** helpers สำหรับประกอบ URL */
  private isAbs(u: string) { return /^https?:\/\//i.test(u); }
  private fixLocal(u: string) {
    const m = u.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(.+)$/i);
    if (m) return `${this.constants.API_URL}/${m[1].replace(/^\/+/, '')}`;
    return u;
  }
  private withBase(u?: string | null) {
    if (!u) return null;
    if (this.isAbs(u)) return this.fixLocal(u);
    return `${this.constants.API_URL}/${u.replace(/^\/+/, '')}`;
  }

  avatarUrl = computed(() =>
    this.withBase(this.user.getProfile()?.avatarUrl ?? '') ||
    '/assets/sample/avatar-1.jpg'
  );

  displayName = computed(() => this.user.getProfile()?.displayName ?? '—');
  emailText   = computed(() => this.user.getProfile()?.email ?? '—');
  balance     = computed<number>(() => this.user.getProfile()?.walletBalance ?? 0);

  quickAdd = [100, 200, 500];
  customAdd = signal<number | null>(null);
  transactions = signal<Tx[]>([]);
  purchases = signal<PurchaseItem[]>([]);
  games = signal<GameItem[]>([]);

  ngOnInit() {
    // Transactions
    this.userApi.getMyTransactions().subscribe({
      next: (res) => {
        const mapped: Tx[] = (res.data || []).map((r: any) => {
          const typeRaw = String(r.type ?? '').toUpperCase();
          const isBuy = typeRaw === 'BUY' || typeRaw === 'PURCHASE';
          const at = new Date(r.created_at ?? r.at ?? Date.now()).toLocaleDateString('en-US', {
            month: 'numeric', day: 'numeric', year: 'numeric',
          });
          return {
            id: String(r.id),
            type: (isBuy ? 'BUY' : 'TOPUP') as TxType,
            title: isBuy ? `Buy "${r.title || 'Unknown Game'}"` : (r.title || 'Add Funds'),
            amount: Number(r.amount ?? 0) * (isBuy ? -1 : 1),
            at,
          };
        });
        this.transactions.set(mapped.slice(0, 10));
      },
      error: (err) => {
        console.warn('⚠️ โหลดประวัติธุรกรรมไม่สำเร็จ', err);
      },
    });

    // My Games
    this.userApi.getMyGames().subscribe({
      next: (res) => {
        const list: GameItem[] = (res.data || []).map((g: any) => ({
          id: String(g.id),
          title: g.title,
          cover:
            this.withBase(g.cover ?? g.image ?? g.imageUrl ?? g.image_path ?? g.cover_path) ||
            '/assets/placeholder-wide.jpg',
        }));
        this.games.set(list);
      },
      error: (err) => {
        console.warn('⚠️ โหลด My Games ไม่สำเร็จ', err);
      },
    });
  }

  onCustomAddChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const v = input.valueAsNumber;
    this.customAdd.set(Number.isFinite(v) ? v : 0);
  }

  async addFunds(amount: number) {
    if (amount <= 0) return;
    try {
      const balance = await firstValueFrom(this.userApi.topup(amount));
      const p = this.user.getProfile();
      if (p) {
        this.user.setProfile({ walletBalance: balance.balance });
      }
      this.transactions.update((list) => [
        {
          id: crypto.randomUUID(),
          type: 'TOPUP',
          title: 'Add Funds',
          amount: +amount,
          at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...list,
      ]);
      this.customAdd.set(null);
    } catch (e) {
      alert('เติมเงินไม่สำเร็จ');
      console.error(e);
    }
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
