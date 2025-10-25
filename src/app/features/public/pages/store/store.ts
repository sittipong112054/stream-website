// src/app/features/store/pages/store/store.ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

import { StoreService } from '../../../../core/services/store';
import { Constants } from '../../../../config/constants';

type Game = {
  id: number;
  title: string;
  price: number;
  genre: string;
  cover: string;
  rank?: number; 
};

type PublicRankItem = {
  gameId: number;
  title: string;
  cover: string | null;
  qty: number;
  revenue: number;
};

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './store.html',
  styleUrl: './store.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Store {
  private api = inject(StoreService);
  private http = inject(HttpClient);
  private c = inject(Constants);

  bannerUrl = 'assets/summer-sale.jpg';

  q = signal('');
  genre = signal<string>('');

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  games = signal<Game[]>([]);

  private rankMap = signal<Map<number, number>>(new Map());


  private today = new Date().toISOString().slice(0, 10);

  constructor() {
    this.loadGames();
    this.loadRanks();
  }

  loadGames() {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.api.getGames().subscribe({
      next: (res) => {
        const data: Game[] = (res.data || []).map((r: any) => ({
          id: Number(r.id),
          title: r.title,
          price: Number(r.price),
          genre: r.genre ?? r.categoryName ?? '-',
          cover: r.cover ?? r.imageUrl ?? '/assets/placeholder-wide.jpg',
        }));
        this.games.set(data);
        this.loadRanks(5);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[Store] loadGames error', err);
        this.errorMsg.set(err?.error?.error ?? 'โหลดรายการเกมไม่สำเร็จ');
        this.loading.set(false);
      },
    });
  }

  loadRanks(limit = 5) {
  const params = new HttpParams()
    .set('sort', 'qty')
    .set('limit', String(limit));

  this.http.get<{ ok: boolean; data: { gameId:number; rank:number }[] }>(
    `${this.c.API_URL}/rankings/top`,
    { params, withCredentials: false }
  ).subscribe({
    next: (res) => {
      const map = new Map<number, number>();
      for (const item of res.data || []) {
        map.set(Number(item.gameId), Number(item.rank ?? 0));
      }
      this.rankMap.set(map);
    },
    error: (e) => console.error('[Store] loadRanks error', e),
  });
}

  private gamesWithRank = computed<Game[]>(() => {
    const map = this.rankMap();
    return this.games().map((g) => ({
      ...g,
      rank: map.get(g.id) ?? undefined,
    }));
  });

  genres = computed(() =>
    Array.from(
      new Set(
        this.games()
          .map((g) => g.genre)
          .filter(Boolean)
      )
    )
  );

  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    const selected = this.genre();

    const list = this.gamesWithRank().filter((x) => {
      const matchQ =
        !q ||
        x.title.toLowerCase().includes(q) ||
        x.genre.toLowerCase().includes(q);
      const matchG = !selected || x.genre === selected;
      return matchQ && matchG;
    });

    return list.sort((a, b) => {
      const ar = a.rank ?? Infinity;
      const br = b.rank ?? Infinity;
      if (ar !== br) return ar - br;
      return a.title.localeCompare(b.title);
    });
  });

  resetFilters() {
    this.q.set('');
    this.genre.set('');
  }
}
