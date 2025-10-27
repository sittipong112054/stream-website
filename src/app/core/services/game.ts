import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Constants } from '../../config/constants';

export interface GameDto {
  id: number;
  title: string;
  price: number;
  categoryId: number;
  categoryName?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  releasedAt?: string | null;
  releaseDate?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient, private constants: Constants) {}

  /* ---------------- Helpers ---------------- */

  /** url เป็น absolute ไหม */
  private isAbsolute(url: string) {
    return /^https?:\/\//i.test(url);
  }

  /** ถ้าเป็น localhost ให้รีไรท์เป็นโดเมนจริง */
  private fixLocalhost(url: string): string {
    const m = url.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(.+)$/i);
    if (m) {
      const rest = m[1].replace(/^\/+/, '');
      return `${this.constants.API_URL}/${rest}`;
    }
    return url;
  }

  /** เติม base URL ให้ path และกันเคสที่ backend ส่งเป็น absolute + localhost */
  private withBase(path?: string | null): string | null {
    if (!path) return null;
    if (this.isAbsolute(path)) return this.fixLocalhost(path);
    const clean = String(path).replace(/^\/+/, '');
    return `${this.constants.API_URL}/${clean}`;
  }

  /** normalize ชื่อฟิลด์ + แปลงรูป */
  private normalize(g: any): GameDto {
    const imgPath =
      g.imageUrl ??
      g.image_path ??
      g.image ??
      g.cover_path ??
      null;

    return {
      id: Number(g.id),
      title: g.title,
      price: Number(g.price),
      categoryId: g.categoryId ?? g.category_id,
      categoryName: g.categoryName ?? g.category_name ?? null,
      imageUrl: this.withBase(imgPath),
      description: g.description ?? null,
      releasedAt: g.releasedAt ?? g.releaseDate ?? g.released_at ?? null,
      releaseDate: g.releaseDate ?? null,
      status: g.status ?? 'ACTIVE',
    };
  }

  /* ---------------- Public APIs ---------------- */

  getAll(): Observable<{ ok: boolean; data: GameDto[] }> {
    return this.http
      .get<{ ok: boolean; data: any[] }>(`${this.constants.API_URL}/games`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => ({
          ok: res.ok,
          data: (res.data || []).map((g) => this.normalize(g)),
        }))
      );
  }

  getById(id: number): Observable<{ ok: boolean; data: GameDto }> {
    return this.http
      .get<{ ok: boolean; data: any }>(`${this.constants.API_URL}/games/${id}`)
      .pipe(
        map((res) => ({
          ok: res.ok,
          data: this.normalize(res.data),
        }))
      );
  }

  /** -------- admin -------- */

  list(): Observable<{ ok: boolean; data: GameDto[] }> {
    return this.http
      .get<{ ok: boolean; data: any[] }>(`${this.constants.API_URL}/admin/games`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => ({
          ok: res.ok,
          data: (res.data || []).map((g) => this.normalize(g)),
        }))
      );
  }

  getOneAdmin(id: number): Observable<{ ok: boolean; data: GameDto }> {
    return this.http
      .get<{ ok: boolean; data: any }>(`${this.constants.API_URL}/admin/games/${id}`, {
        withCredentials: true,
      })
      .pipe(
        map((res) => ({
          ok: res.ok,
          data: this.normalize(res.data),
        }))
      );
  }

  create(p: {
    title: string;
    price: number;
    categoryId: number;
    description?: string;
    releasedAt?: string;
    image?: File | null;
  }): Observable<{ ok: true }> {
    const fd = new FormData();
    fd.append('title', p.title);
    fd.append('price', String(p.price));
    fd.append('categoryId', String(p.categoryId));
    if (p.description) fd.append('description', p.description);
    if (p.releasedAt) fd.append('releasedAt', p.releasedAt);
    if (p.image) fd.append('image', p.image);

    return this.http.post<{ ok: true }>(
      `${this.constants.API_URL}/admin/games`,
      fd,
      { withCredentials: true }
    );
  }

  update(
    id: number,
    p: {
      title: string;
      price: number;
      categoryId: number;
      description?: string;
      releasedAt?: string;
      image?: File | null;
    }
  ): Observable<{ ok: true }> {
    const fd = new FormData();
    fd.append('title', p.title);
    fd.append('price', String(p.price));
    fd.append('categoryId', String(p.categoryId));
    if (p.description) fd.append('description', p.description);
    if (p.releasedAt) fd.append('releasedAt', p.releasedAt);
    if (p.image) fd.append('image', p.image);

    return this.http.put<{ ok: true }>(
      `${this.constants.API_URL}/admin/games/${id}`,
      fd,
      { withCredentials: true }
    );
  }

  delete(id: number): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(
      `${this.constants.API_URL}/admin/games/${id}`,
      { withCredentials: true }
    );
  }

  getCategories(): Observable<{ ok: boolean; data: any[] }> {
    return this.http.get<{ ok: boolean; data: any[] }>(
      `${this.constants.API_URL}/admin/categories`,
      { withCredentials: true }
    );
  }
}
