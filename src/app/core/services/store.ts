import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private API = 'http://localhost:3002/store';

  constructor(private http: HttpClient) {}

  getGames(): Observable<{ ok: boolean; data: any[] }> {
    return this.http.get<{ ok: boolean; data: any[] }>(`${this.API}/games`);
  }
}
