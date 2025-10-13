import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';
import { Observable } from 'rxjs';

export type DiscountType = 'PERCENT' | 'AMOUNT';

export interface DiscountCodeDto {
  id: number;
  code: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  per_user_limit: number;
  used_count: number;
  active: boolean;
  start_at?: string | null;
  end_at?: string | null;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class DiscountCodesService {
  private http = inject(HttpClient);
  private c = inject(Constants);

  list() {
    return this.http.get<{ ok: boolean; data: DiscountCodeDto[] }>(
      `${this.c.API_URL}/admin/discount-codes`,
      { withCredentials: true }
    );
  }

  getOne(id: number) {
    return this.http.get<{ ok: boolean; data: DiscountCodeDto }>(
      `${this.c.API_URL}/admin/discount-codes/${id}`,
      { withCredentials: true }
    );
  }

  create(payload: Partial<DiscountCodeDto>) {
    return this.http.post<{ ok: boolean }>(
      `${this.c.API_URL}/admin/discount-codes`,
      payload,
      { withCredentials: true }
    );
  }

  update(id: number, payload: Partial<DiscountCodeDto>) {
    return this.http.put<{ ok: boolean }>(
      `${this.c.API_URL}/admin/discount-codes/${id}`,
      payload,
      { withCredentials: true }
    );
  }

  remove(id: number) {
    return this.http.delete<{ ok: boolean }>(
      `${this.c.API_URL}/admin/discount-codes/${id}`,
      { withCredentials: true }
    );
  }
}
