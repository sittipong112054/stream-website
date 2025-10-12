// import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterLink } from '@angular/router';

// type Game = {
//   id: string;
//   title: string;
//   price: number;
//   genre: string;
//   cover: string;
//   rank?: number;    // 1–5 แสดงป้ายอันดับขายดีเฉพาะที่มี
// };
// @Component({
//   selector: 'app-store',
//   imports: [CommonModule, FormsModule, FormsModule, RouterLink],
//   templateUrl: './store.html',
//   styleUrl: './store.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class Store {
//   // mock banner
//   bannerUrl = 'assets/summer-sale.jpg'; // เปลี่ยน path ตามโปรเจกต์

//   // ฟิลเตอร์
//   q = signal('');
//   genre = signal<string>('');

//   // mock ข้อมูลเกม >= 10 รายการ
//   games = signal<Game[]>([
//     { id: '1', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Action', cover: 'assets/Mass Effect.jpg', rank: 1 },
//     { id: '2', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Adventure', cover: 'assets/Mass Effect.jpg', rank: 2 },
//     { id: '3', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Racing', cover: 'assets/Mass Effect.jpg', rank: 3 },
//     { id: '4', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Adventure', cover: 'assets/Mass Effect.jpg', rank: 4 },
//     { id: '5', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Racing', cover: 'assets/Mass Effect.jpg', rank: 5 },
//     { id: '6', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Action', cover: 'assets/Mass Effect.jpg' },
//     { id: '7', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Action', cover: 'assets/Mass Effect.jpg' },
//     { id: '8', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Action', cover: 'assets/Mass Effect.jpg' },
//     { id: '9', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Action', cover: 'assets/Mass Effect.jpg', rank: 10 },
//     { id: '9', title: 'Mass Effect: Legendary Edition', price: 1599, genre: 'Action', cover: 'assets/Mass Effect.jpg', rank: 11 },
//   ]);

//   genres = computed(() => Array.from(new Set(this.games().map(g => g.genre))));

//   filtered = computed(() => {
//     const q = this.q().trim().toLowerCase();
//     const g = this.genre();
//     return this.games().filter(x => {
//       const matchQ = !q || x.title.toLowerCase().includes(q);
//       const matchG = !g || x.genre === g;
//       return matchQ && matchG;
//     });
//   });

//   resetFilters() { this.q.set(''); this.genre.set(''); }
// }
// src/app/features/store/pages/store/store.ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../../../core/services/store';

type Game = {
  id: number;
  title: string;
  price: number;
  genre: string;   // มาจาก categories.name
  cover: string;   // image url เต็มจาก API
  rank?: number;   // ถ้ามี ก็คงไว้ใช้แสดงป้าย
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
  bannerUrl = 'assets/summer-sale.jpg';

  q = signal('');
  genre = signal<string>('');
  
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  games = signal<Game[]>([]);

  constructor() {
    this.loadGames();
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
          rank: r.rank ?? undefined,
        }));
        this.games.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[Store] loadGames error', err);
        this.errorMsg.set(err?.error?.error ?? 'โหลดรายการเกมไม่สำเร็จ');
        this.loading.set(false);
      },
    });
  }

  genres = computed(() => Array.from(new Set(this.games().map((g) => g.genre).filter(Boolean))));

  filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    const selected = this.genre();
    return this.games().filter((x) => {
      const matchQ = !q || x.title.toLowerCase().includes(q);
      const matchG = !selected || x.genre === selected;
      return matchQ && matchG;
    });
  });

  resetFilters() {
    this.q.set('');
    this.genre.set('');
  }
}
