// src/app/features/admin/pages/transactions/transactions.ts
import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { AdminTransactionsService } from '../../../../core/services/admin-transactions';

type Tx = {
  id: number;
  type: 'TOPUP' | 'PURCHASE';
  amount: number;
  balance_after: number;
  note?: string | null;
  created_at: string;
};

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
  private api = inject(AdminTransactionsService);

  // sidebar users
  users = signal<{id:number; username:string; email:string; avatarUrl?:string|null}[]>([]);
  selectedUserId = signal<number | null>(null);
  selectedUser = computed(() => this.users().find(u => u.id === this.selectedUserId()) || null);

  // summary cards
  sumTotalCount = signal(0);
  sumTopup = signal(0);
  sumPurchase = signal(0);
  sumAvg = signal(0);

  // tx list
  loading = signal(false);
  txs = signal<Tx[]>([]);

  ngOnInit() {
    this.api.listUsers().subscribe({
      next: (res) => {
        this.users.set(res.data || []);
        if (this.users().length) {
          this.pickUser(this.users()[0].id);
        }
      }
    });
  }

  pickUser(id: number) {
    if (id === this.selectedUserId()) return;
    this.selectedUserId.set(id);
    this.loadSummary(id);
    this.loadTx(id);
  }

  private loadSummary(id: number) {
    this.api.getSummary(id).subscribe({
      next: ({data}) => {
        this.sumTotalCount.set(data.totalCount);
        this.sumTopup.set(data.totalTopup);
        this.sumPurchase.set(data.totalPurchase);
        this.sumAvg.set(data.avgAmount);
      }
    });
  }

  private loadTx(id: number) {
    this.loading.set(true);
    this.api.listTransactions(id).subscribe({
      next: (res) => {
        const rows = (res.data || []) as Tx[];
        this.txs.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // สำหรับ format ยอด (ให้ purchase ขึ้น - สีแดง)
  displayAmount(t: Tx) {
    const n = Number(t.amount || 0);
    return t.type === 'PURCHASE' ? -n : n;
  }

  txTitle(t: Tx) {
    return t.type === 'TOPUP' ? 'Top-up' : 'Purchase';
  }
  txSubtitle(t: Tx) {
    return t.type === 'TOPUP' ? 'Wallet top-up' : (t.note || 'Game purchase');
  }
}
