import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {

  constructor(private http: HttpClient,
    private constants: Constants  
  ) {}

  list() {
    return this.http.get<{ ok: boolean; data: Category[] }>(this.constants.API_URL, {
      withCredentials: true,
    });
  }
}
