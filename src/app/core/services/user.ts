import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../../config/constants';
import { Observable } from 'rxjs';

export interface OwnedGameDto {
  id: string;
  title: string;
  cover: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient, private constants: Constants) {}

  getMe() {
    return this.http.get<{ ok: boolean; user: any }>(
      `${this.constants.API_URL}/users/me`,
      { withCredentials: true }
    );
  }

  uploadMyAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.http.post<{ ok: boolean; avatarUrl: string }>(
      `${this.constants.API_URL}/users/me/avatar`,
      fd,
      { withCredentials: true }
    );
  }

  updateMe(payload: { username?: string; email?: string }) {
    return this.http.put(`${this.constants.API_URL}/users/me`, payload, {
      withCredentials: true,
    });
  }

  deleteMyAvatar() {
    return this.http.delete(`${this.constants.API_URL}/users/me/avatar`, {
      withCredentials: true,
    });
  }
 
topup(amount: number) {
  return this.http.post<{ ok: boolean; balance: number }>(
    `${this.constants.API_URL}/users/me/wallet/topup`,
    { amount },
    { withCredentials: true }
  );
}

getMyTransactions() {
  return this.http.get<{ ok: boolean; data: any[] }>(
    `${this.constants.API_URL}/users/me/wallet/transactions`,
    { withCredentials: true }
  );
}


  charge(gameId: number, qty = 1) {
    return this.http.post<{ ok: boolean; balance: number; orderId: number }>(
      `${this.constants.API_URL}users/me/wallet/charge`,
      { gameId, qty },
      { withCredentials: true }
    );
  }
  
  getMyGames(): Observable<{ ok: boolean; data: OwnedGameDto[] }> {
    return this.http.get<{ ok: boolean; data: OwnedGameDto[] }>(
      `${this.constants.API_URL}/me/games`,
      { withCredentials: true }
    );
  }

//   getMyPurchases() {
//   return this.http.get<{ ok: boolean; data: { orderId: number; title: string; cover: string | null; price: number; date: string; }[] }>(
//     `${this.constants.API_URL}/me/purchases`,
//     { withCredentials: true }
//   );
// }

}
