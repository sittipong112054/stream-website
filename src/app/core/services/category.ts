import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private BASE = 'http://localhost:3002/categories';

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<{ ok: boolean; data: Category[] }>(this.BASE, {
      withCredentials: true,
    });
  }
}
