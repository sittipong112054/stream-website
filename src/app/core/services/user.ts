import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

// src/app/core/services/user.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private BASE = 'http://localhost:3002/users';
  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get<{ ok: boolean; user: any }>(
      `${this.BASE}/me`,
      { withCredentials: true } // ← สำคัญมาก
    );
  }

  uploadMyAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.http.post<{ ok: boolean; avatarUrl: string }>(
      `${this.BASE}/me/avatar`,
      fd,
      { withCredentials: true } // ← สำคัญ
    );
  }

  updateMe(body: { username?: string; email?: string }) {
    return this.http.put(`${this.BASE}/me`, body, { withCredentials: true });
  }

  deleteMyAvatar() {
    return this.http.delete(`${this.BASE}/me/avatar`, { withCredentials: true });
  }
}
