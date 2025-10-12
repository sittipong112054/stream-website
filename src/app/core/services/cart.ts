import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export type CartItem = {
  itemId: number;   // id แถวในตะกร้า
  gameId: number;
  title: string;
  cover: string | null;
  price: number;
  discount?: number; // 0-100
  qty: number;
  platform?: string;
};

export type CouponResp = { code: string; amount: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private http: HttpClient, private constants: Constants) {}

  items = signal<CartItem[]>([]);
  coupon = signal<CouponResp | null>(null);

  // ราคา/ยอดรวม
  private itemFinal = (it: CartItem) =>
    it.discount ? +(it.price * (100 - it.discount) / 100).toFixed(2) : it.price;

  subtotal = computed(() =>
    this.items().reduce((s, it) => s + this.itemFinal(it) * it.qty, 0)
  );
  discountTotal = computed(() => this.coupon()?.amount ?? 0);
  total = computed(() => Math.max(0, +(this.subtotal() - this.discountTotal()).toFixed(2)));

  // ---------- API calls ----------
  load() {
    return this.http
      .get<{ ok: boolean; data: CartItem[] }>(`${this.constants.API_URL}/cart`, {
        withCredentials: true,
      })
      .subscribe(({ data }) => this.items.set(data));
  }

  // ให้ component เป็นคน subscribe เอง (เพื่อ navigate หลังเพิ่มสำเร็จ)
  add(gameId: number, qty = 1): Observable<{ ok: boolean; data: CartItem }> {
    return this.http
      .post<{ ok: boolean; data: CartItem }>(
        `${this.constants.API_URL}/cart`,
        { gameId, qty },
        { withCredentials: true }
      )
      .pipe(tap(({ data }) => this.items.set([...this.items(), data])));
  }

  setQty(itemId: number, qty: number) {
    return this.http
      .patch<{ ok: boolean; data: CartItem }>(
        `${this.constants.API_URL}/cart/${itemId}`,
        { qty },
        { withCredentials: true }
      )
      .subscribe(({ data }) => {
        this.items.set(this.items().map((i) => (i.itemId === itemId ? data : i)));
      });
  }

  remove(itemId: number) {
    return this.http
      .delete<{ ok: boolean }>(`${this.constants.API_URL}/cart/${itemId}`, {
        withCredentials: true,
      })
      .subscribe(() => this.items.set(this.items().filter((i) => i.itemId !== itemId)));
  }

  applyCoupon(code: string) {
    return this.http
      .post<{ ok: boolean; data: CouponResp }>(
        `${this.constants.API_URL}/cart/validate-coupon`,
        { code, subtotal: this.subtotal() },
        { withCredentials: true }
      )
      .subscribe({
        next: ({ data }) => this.coupon.set(data),
        error: () => alert('คูปองไม่ถูกต้อง'),
      });
  }

  removeCoupon() {
    this.coupon.set(null);
  }

  checkout() {
    const payload = {
      itemIds: this.items().map((i) => i.itemId),
      coupon: this.coupon(),
    };

    return this.http.post<{ ok: boolean; orderId: number; status: string; total: number }>(
      `${this.constants.API_URL}/cart/checkout`, // ✅ แก้ URL ให้ถูก
      payload,
      { withCredentials: true }
    );
  }
}
