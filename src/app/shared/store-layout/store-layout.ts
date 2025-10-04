import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { StoreSubheader } from '../layouts/store-subheader/subheader';

@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, StoreSubheader],
  templateUrl: './store-layout.html',
  styleUrl: './store-layout.scss'
})
export class StoreLayout {
  cartCount = 0;                     // ต่อ CartService เพื่อให้นับจริง
  cats = ['ทั้งหมด', 'Action', 'RPG', 'Strategy', 'Sports', 'Indie'];

  onCategory(cat: string) { /* ส่งต่อให้ StoreComponent ผ่าน service/shared state */ }
  onSearch(q: string) { /* ส่งต่อให้ GameService หรือ Global Store */ }
}
