import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
  id?: number | string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  private toApiId(id: string | number): string | number {
    if (typeof id === 'number') {
      return id;
    }

    const trimmed = id.trim();
    return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: string | number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${this.toApiId(id)}`);
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string | number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${this.toApiId(id)}`, user);
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.toApiId(id)}`);
  }
}
