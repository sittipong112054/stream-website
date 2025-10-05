import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

type GameDetailModel = {
  id: string;
  title: string;
  gallery: string[];
  cover: string;
  description: string[];
  tags: string[];
  // genre: string;
  developer?: string;
  publisher?: string;
  releaseDate: string;
  rating: number;
  price: number;
  discount?: number;
};

@Component({
  selector: 'app-game-detail',
  imports: [CommonModule],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameDetail {
  private route = inject(ActivatedRoute);

  // TODO: ต่อ GameService จริงตาม id
  game = signal<GameDetailModel>({
    id: this.route.snapshot.paramMap.get('id') ?? 'elden-ring',
    title: 'Elden Ring',
    gallery: [
      'assets/Elden Ring.avif',
      'assets/Elden Ring1.avif',
      'assets/Elden Ring2.avif',
      'assets/Elden Ring3.avif',
      'assets/Elden Ring4.avif',
    ],
    cover: 'assets/Elden Ring.avif',
    description: [
      'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord.',
      'A vast world with diverse situations and huge dungeons seamlessly connected.',
      'Create your own character with weapons, armor, and magic to suit your playstyle.',
      'Epic drama in fragments where thoughts of the characters intersect in the Lands Between.',
      'Unique asynchronous online elements loosely connect you to others.',
    ],
    tags: ['Souls-like', 'Action RPG', 'Open World', 'Dark Fantasy'],
    // genre: 'Action RPG',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    releaseDate: '2022-02-25',
    rating: 94.7,
    price: 1790,
    discount: 34,
  });

  // ✅ แกลเลอรีที่ใช้โลปรูปย่อย
  combinedGallery = computed(() => this.game().gallery ?? []);

  // ✅ รูปใหญ่: ใช้รูปแรกของ gallery (fallback เป็น cover)
  active = signal<string>('');
  constructor() {
    const g = this.game();
    this.active.set(g.gallery?.[0] ?? g.cover);
  }
  setActive(src: string) { this.active.set(src); }

  // ✅ คำบรรยายช่วงต้น: ย่อหน้าแรก
  shortDesc = computed(() => this.game().description?.[0] ?? '');

  // ราคาหลังส่วนลด
  finalPrice = computed(() => {
    const g = this.game();
    return g.discount ? Math.round(g.price * (100 - g.discount) / 100) : g.price;
  });

  addToCart() {
    // TODO: ต่อ CartService จริง
    alert('เพิ่มลงตะกร้าแล้ว 🎯');
  }
}