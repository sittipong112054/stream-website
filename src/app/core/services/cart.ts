import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export type CartItem = {
  itemId: number; 
  gameId: number;
  title: string;
  cover: string | null;
  price: number;
  discount?: number;
  qty: number;
  platform?: string;
};

export type CouponResp = { code: string; amount: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private http: HttpClient, private constants: Constants) {}

  items = signal<CartItem[]>([]);
  coupon = signal<CouponResp | null>(null);

  private itemFinal = (it: CartItem) =>
    it.discount ? +(it.price * (100 - it.discount) / 100).toFixed(2) : it.price;

  subtotal = computed(() =>
    this.items().reduce((s, it) => s + this.itemFinal(it) * it.qty, 0)
  );
  discountTotal = computed(() => this.coupon()?.amount ?? 0);
  total = computed(() => Math.max(0, +(this.subtotal() - this.discountTotal()).toFixed(2)));

  load() {
    return this.http
      .get<{ ok: boolean; data: CartItem[] }>(`${this.constants.API_URL}/cart`, {
        withCredentials: true,
      })
      .subscribe(({ data }) => this.items.set(data));
  }

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


  removeCoupon() {
    this.coupon.set(null);
  }

  checkout() {
    const payload = {
      itemIds: this.items().map((i) => i.itemId),
      coupon: this.coupon(),
    };

    return this.http.post<{ ok: boolean; orderId: number; status: string; total: number }>(
      `${this.constants.API_URL}/cart/checkout`,
      payload,
      { withCredentials: true }
    );
  }

applyCoupon(code: string) {
  return this.http.post<{ ok: boolean; data: CouponResp }>(
    `${this.constants.API_URL}/cart/validate-coupon`,
    { code, subtotal: this.subtotal() },
    { withCredentials: true }
  ).subscribe({
    next: ({ data }) => this.coupon.set(data),
    error: (e) => {
      const m = e?.error?.code as string;
      const msg =
        m === 'EXPIRED'      ? 'คูปองหมดอายุแล้ว'
      : m === 'NOT_STARTED'  ? 'คูปองยังไม่เริ่มใช้งาน'
      : m === 'INACTIVE'     ? 'คูปองถูกปิดใช้งาน'
      : m === 'EXHAUSTED'    ? 'คูปองครบโควตาแล้ว'
      : m === 'USER_LIMIT'   ? 'คุณใช้คูปองนี้ครบสิทธิ์แล้ว'
      : m === 'TOO_LOW'      ? 'ยอดสั่งซื้อยังไม่ถึงขั้นต่ำของคูปอง'
      : 'คูปองไม่ถูกต้อง';
      alert(msg);
    },
  });
}


}
