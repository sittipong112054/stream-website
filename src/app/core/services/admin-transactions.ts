// src/app/core/services/admin-transactions.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';

@Injectable({ providedIn: 'root' })
export class AdminTransactionsService {
  constructor(private http: HttpClient, private constants: Constants) {}

  listUsers() {
    return this.http.get<{ ok: boolean; data: any[] }>(
      `${this.constants.API_URL}/admin/users`,
      { withCredentials: true }
    );
  }

  listTransactions(userId: number) {
    return this.http.get<{ ok: boolean; data: any[] }>(
      `${this.constants.API_URL}/admin/users/${userId}/transactions`,
      { withCredentials: true }
    );
  }

  getSummary(userId: number) {
    return this.http.get<{ ok: boolean; data: {
      totalCount: number; totalTopup: number; totalPurchase: number; avgAmount: number;
    } }>(
      `${this.constants.API_URL}/admin/users/${userId}/transactions/summary`,
      { withCredentials: true }
    );
  }
}
