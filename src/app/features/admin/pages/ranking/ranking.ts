import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RankingsService, RankItem, Kpis } from '../../../../core/services/rankings';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ranking {
  private api = inject(RankingsService);

  today = new Date().toISOString().slice(0,10);
  start = signal(this.today);
  end   = signal(this.today);
  sort  = signal<'qty'|'revenue'>('qty');

  top = signal<RankItem[]>([]);
  kpis = signal<Kpis | null>(null);
  loading = signal(true);

  constructor() { this.reload(); }

  reload() {
    this.loading.set(true);
    const p = { start: this.start(), end: this.end(), sort: this.sort(), limit: 5 };

    this.api.getTop(p).subscribe({ next: r => this.top.set(r.data || []) });
    this.api.getKpis({ start: this.start(), end: this.end() }).subscribe({
      next: r => this.kpis.set(r.data),
      complete: () => this.loading.set(false)
    });
  }

  setToday() {
    const t = new Date().toISOString().slice(0,10);
    this.start.set(t); this.end.set(t); this.reload();
  }
}
