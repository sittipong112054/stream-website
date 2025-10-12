// src/app/core/services/game.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/constants';

export interface GameDto {
  id: number;
  title: string;
  price: number;
  categoryId: number;
  categoryName?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  releasedAt?: string | null;   // datetime
  releaseDate?: string | null;  // date (virtual)
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient, private constants: Constants) {}

  // ===== PUBLIC (store/detail) =====
  getAll(): Observable<{ ok: boolean; data: GameDto[] }> {
    return this.http.get<{ ok: boolean; data: GameDto[] }>(
      `${this.constants.API_URL}/games`,
      { withCredentials: true }
    );
  }

  getById(id: number): Observable<{ ok: boolean; data: GameDto }> {
    return this.http.get<{ ok: boolean; data: GameDto }>(
      `${this.constants.API_URL}/games/${id}`
    );
  }

  // ===== ADMIN =====
  list(): Observable<{ ok: boolean; data: GameDto[] }> {
    return this.http.get<{ ok: boolean; data: GameDto[] }>(
      `${this.constants.API_URL}/admin/games`,
      { withCredentials: true }
    );
  }

  getOneAdmin(id: number): Observable<{ ok: boolean; data: GameDto }> {
    return this.http.get<{ ok: boolean; data: GameDto }>(
      `${this.constants.API_URL}/admin/games/${id}`,
      { withCredentials: true }
    );
  }

  create(p: {
    title: string;
    price: number;
    categoryId: number;
    description?: string;
    releasedAt?: string;     // 'YYYY-MM-DD'
    image?: File | null;
  }): Observable<{ ok: true }> {
    const fd = new FormData();
    fd.append('title', p.title);
    fd.append('price', String(p.price));
    fd.append('categoryId', String(p.categoryId));
    if (p.description) fd.append('description', p.description);
    if (p.releasedAt)  fd.append('releasedAt', p.releasedAt);
    if (p.image)       fd.append('image', p.image);

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
    if (p.releasedAt)  fd.append('releasedAt', p.releasedAt);
    if (p.image)       fd.append('image', p.image);

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
