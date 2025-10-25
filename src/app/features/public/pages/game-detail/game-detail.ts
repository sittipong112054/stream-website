// import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';

// type GameDetailModel = {
//   id: string;
//   title: string;
//   gallery: string[];
//   cover: string;
//   description: string[];
//   tags: string[];
//   // genre: string;
//   developer?: string;
//   publisher?: string;
//   releaseDate: string;
//   rating: number;
//   price: number;
//   discount?: number;
// };

// @Component({
//   selector: 'app-game-detail',
//   imports: [CommonModule],
//   templateUrl: './game-detail.html',
//   styleUrl: './game-detail.scss',
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class GameDetail {
//   private route = inject(ActivatedRoute);

//   // TODO: ต่อ GameService จริงตาม id
//   game = signal<GameDetailModel>({
//     id: this.route.snapshot.paramMap.get('id') ?? 'elden-ring',
//     title: 'Elden Ring',
//     gallery: [
//       'assets/Elden Ring.avif',
//       'assets/Elden Ring1.avif',
//       'assets/Elden Ring2.avif',
//       'assets/Elden Ring3.avif',
//       'assets/Elden Ring4.avif',
//     ],
//     cover: 'assets/Elden Ring.avif',
//     description: [
//       'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord.',
//       'A vast world with diverse situations and huge dungeons seamlessly connected.',
//       'Create your own character with weapons, armor, and magic to suit your playstyle.',
//       'Epic drama in fragments where thoughts of the characters intersect in the Lands Between.',
//       'Unique asynchronous online elements loosely connect you to others.',
//     ],
//     tags: ['Souls-like', 'Action RPG', 'Open World', 'Dark Fantasy'],
//     // genre: 'Action RPG',
//     developer: 'FromSoftware',
//     publisher: 'Bandai Namco',
//     releaseDate: '2022-02-25',
//     rating: 1,
//     price: 1599.99,
//     discount: 34,
//   });

//   // ✅ แกลเลอรีที่ใช้โลปรูปย่อย
//   combinedGallery = computed(() => this.game().gallery ?? []);

//   // ✅ รูปใหญ่: ใช้รูปแรกของ gallery (fallback เป็น cover)
//   active = signal<string>('');
//   constructor() {
//     const g = this.game();
//     this.active.set(g.gallery?.[0] ?? g.cover);
//   }
//   setActive(src: string) { this.active.set(src); }

//   // ✅ คำบรรยายช่วงต้น: ย่อหน้าแรก
//   shortDesc = computed(() => this.game().description?.[0] ?? '');

//   // ราคาหลังส่วนลด
//   finalPrice = computed(() => {
//     const g = this.game();
//     return g.discount
//       ? (g.price * (100 - g.discount) / 100).toFixed(2)
//       : g.price.toFixed(2);

//   });

//   addToCart() {    const id = this.game().id;   // id เกมจาก VM
//     this.cart.add(id, 1);        // POST /cart (service จะ subscribe เอง)
//     this.router.navigateByUrl('/cart'); // เด้งไปตะกร้า
//     alert('เพิ่มลงตะกร้าแล้ว 🎯');
//   }
// }

// src/app/features/public/pages/game-detail/detail.ts
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService, GameDto } from '../../../../core/services/game';
import { CartService } from '../../../../core/services/cart';
import { UserService } from '../../../../core/services/user';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Constants } from '../../../../config/constants';

type GameDetailModel = {
  id: number;
  title: string;
  gallery: string[];
  cover: string;
  description: string[];
  tags: string[];
  developer?: string;
  publisher?: string;
  releaseDate: string;
  rating: number;
  price: number;
  discount?: number;
};

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetail {
  private route = inject(ActivatedRoute);
  private gameApi = inject(GameService);
  private readonly placeholderCover = 'assets/placeholder-wide.jpg';
  private userApi = inject(UserService);
  private http = inject(HttpClient);
  private c = inject(Constants);
  ownedIds = signal<Set<number>>(new Set()); 
  rank = signal<number | null>(null);

  game = signal<GameDetailModel>({
    id: 0,
    title: '—',
    gallery: [],
    cover: this.placeholderCover,
    description: [],
    tags: [],
    developer: '-',
    publisher: '-',
    releaseDate: '',
    rating: 0,
    price: 0,
    discount: undefined,
  });

  combinedGallery = computed(() => this.game().gallery ?? []);
  active = signal<string>(this.placeholderCover);
  setActive(src: string) {
    this.active.set(src || this.placeholderCover);
  }

  shortDesc = computed(() => this.game().description?.[0] ?? '');
  finalPrice = computed(() => {
    const g = this.game();
    if (!g.discount) return g.price;
    return +((g.price * (100 - g.discount)) / 100).toFixed(2);
  });

constructor(private cart: CartService, private router: Router) {
  // 1) ลองอ่านจาก navigation state
  const nav = this.router.getCurrentNavigation();
  const navState = (nav?.extras?.state as { rank?: number } | undefined)?.rank;

  // 2) fallback: ถ้าเปิดหน้าโดยตรง/รีเฟรช ให้ใช้ history.state
  const histState = (history.state?.rank as number | undefined);

  const r = Number(navState ?? histState);
  if (Number.isFinite(r) && r > 0 && r <= 5) {
    this.rank.set(r);
  } else {
    this.rank.set(null);
  }

  this.fetch();
  this.loadOwned();
}

    private loadOwned() {
    this.userApi.getMyGames().subscribe({
      next: (res) => {
        const set = new Set<number>((res.data || []).map(g => Number(g.id)));
        this.ownedIds.set(set);
      },
      error: () => { /* เงียบได้ */ }
    });
  }
  isOwned = (id: number) => this.ownedIds().has(Number(id));

  private fetch() {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      console.error('[game-detail] invalid id:', raw);
      return;
    }

    this.gameApi.getById(id).subscribe({
      next: (res) => {
        const r: GameDto = res.data;

        const cover = r.imageUrl || this.placeholderCover;
        const gallery = [cover];

        const descLines = (r.description || '')
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);

        this.game.set({
          id: r.id,
          title: r.title,
          gallery,
          cover,
          description: descLines,
          tags: r.categoryName ? [r.categoryName] : [],
          developer: '-',
          publisher: '-',
          releaseDate:
            r.releaseDate ||
            (r.releasedAt ? String(r.releasedAt).slice(0, 10) : ''),
          rating: 0,
          price: Number(r.price) || 0,
          discount: undefined,
        });

        this.active.set(gallery[0] || cover || this.placeholderCover);
      },
      error: (err) => {
        console.error('[game-detail] load error', err);
      },
    });
  }



addToCart() {
  const id = this.game().id;
   if (!id || this.isOwned(id)) return; 

    this.cart.add(id, 1).subscribe({
      next: () => this.router.navigate(['/cart']),
      error: (err) => {
        console.error('[AddToCart Error]', err);
        if (err?.status === 409) {
          alert('คุณมีเกมนี้อยู่ในตะกร้าแล้ว');
        } else {
          alert('เพิ่มลงตะกร้าไม่สำเร็จ');
        }
      },
    });
  }

}
