import { Injectable, signal } from '@angular/core';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  cover: string;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  items = signal<CartItem[]>([]);

  add(item: CartItem) {
    const current = this.items();
    const existing = current.find((x) => x.id === item.id);

    if (existing) {
      // เพิ่มจำนวนถ้ามีอยู่แล้ว
      existing.qty += item.qty;
      this.items.set([...current]);
    } else {
      this.items.set([...current, item]);
    }
  }

  remove(id: string) {
    this.items.set(this.items().filter((x) => x.id !== id));
  }

  clear() {
    this.items.set([]);
  }

  total() {
    return this.items().reduce((sum, x) => sum + x.price * x.qty, 0);
  }
}
