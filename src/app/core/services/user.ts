import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../../config/constants';


@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private http: HttpClient,
    private constants: Constants 
  ) {}

 
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
    return this.http.put(
      `${this.constants.API_URL}/users/me`,
      payload,
      { withCredentials: true }
    );
  }


  deleteMyAvatar() {
    return this.http.delete(
      `${this.constants.API_URL}/users/me/avatar`,
      { withCredentials: true }
    );
  }
}
