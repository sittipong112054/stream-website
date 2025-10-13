import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';

export type RankItem = { gameId: number; title: string; cover: string | null; qty: number; revenue: number; };
export type Kpis = { totalRevenue: number; totalSales: number; avgRevenue: number; topSeller: { gameId:number; title:string; qty:number; revenue:number } | null };

@Injectable({ providedIn: 'root' })
export class RankingsService {
  private http = inject(HttpClient);
  private c = inject(Constants);

  getTop(params: { start?: string; end?: string; sort?: 'qty'|'revenue'; limit?: number }) {
    const q = new URLSearchParams();
    if (params.start) q.set('start', params.start);
    if (params.end)   q.set('end', params.end);
    if (params.sort)  q.set('sort', params.sort);
    if (params.limit) q.set('limit', String(params.limit));
    return this.http.get<{ ok: boolean; data: RankItem[]; start: string; end: string; sort: string }>(
      `${this.c.API_URL}/admin/rankings/top?${q.toString()}`, { withCredentials: true }
    );
  }

  getKpis(params: { start?: string; end?: string }) {
    const q = new URLSearchParams();
    if (params.start) q.set('start', params.start);
    if (params.end)   q.set('end', params.end);
    return this.http.get<{ ok: boolean; data: Kpis; start: string; end: string }>(
      `${this.c.API_URL}/admin/rankings/kpis?${q.toString()}`, { withCredentials: true }
    );
  }
}
