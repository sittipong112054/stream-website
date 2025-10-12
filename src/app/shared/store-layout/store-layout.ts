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
  cartCount = 0;                    
  cats = ['ทั้งหมด', 'Action', 'RPG', 'Strategy', 'Sports', 'Indie'];

  onCategory(cat: string) {}
  onSearch(q: string) {}
}
