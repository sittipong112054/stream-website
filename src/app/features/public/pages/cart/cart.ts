import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../../../core/services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  cart: CartService = inject(CartService);
  code = signal<string>('');
  private router = inject(Router);
  isPaying = signal<boolean>(false);

  items = computed(() => this.cart.items());
  subtotal = computed(() => this.cart.subtotal());
  coupon = computed(() => this.cart.coupon());
  discount = computed(() => this.cart.discountTotal());
  total = computed(() => this.cart.total());

    finalUnit(it: CartItem) {
    const unit = it.discount ? (it.price * (100 - it.discount)) / 100 : it.price;
    return +unit.toFixed(2);
  }
  
    lineTotal(it: CartItem) {
    return +(this.finalUnit(it) * it.qty).toFixed(2);
  }

  ngOnInit() { this.cart.load(); }

  inc(it: CartItem) { this.cart.setQty(it.itemId, it.qty + 1); }
  dec(it: CartItem) { if (it.qty > 1) this.cart.setQty(it.itemId, it.qty - 1); }
  remove(it: CartItem) { this.cart.remove(it.itemId); }

  apply() {
    const v = this.code().trim();
    if (!v) return;
    this.cart.applyCoupon(v);
    this.code.set('');
  }
  removeCoupon() { this.cart.removeCoupon(); }

  checkout() {
    if (!this.items().length || this.isPaying()) return;

    this.isPaying.set(true);

    this.cart.checkout().subscribe({
      next: ({ orderId, status, total }) => {
        this.cart.load();
        this.cart.removeCoupon();

        if (status === 'PAID') {
          alert(`ชำระเงินสำเร็จ!\nเลขที่คำสั่งซื้อ #${orderId}\nยอดสุทธิ ฿ ${total.toLocaleString()}`);

        } else {
          alert(`ยอดสุทธิ ฿ ${total.toLocaleString()} — ยอดเงินในวอลเล็ตไม่พอ\nโปรดเติมเงินเพื่อชำระคำสั่งซื้อ #${orderId}`);
          this.router.navigate(['/wallet/topup'], { queryParams: { orderId } });
        }
      },
      error: (err) => {
        console.error('[checkout] error', err);
        alert('ชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      },
      complete: () => this.isPaying.set(false),
    });
  }
}
