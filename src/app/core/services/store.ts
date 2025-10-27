import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/constants';

@Injectable({ providedIn: 'root' })
export class StoreService {

  constructor(private http: HttpClient, private constants: Constants) {}

  getGames(): Observable<{ ok: boolean; data: any[] }> {
    return this.http.get<{ ok: boolean; data: any[] }>(
      `${this.constants.API_URL}/games`
    );
  }
}
