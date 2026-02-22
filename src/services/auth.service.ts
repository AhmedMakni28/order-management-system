import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User, UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'currentUser';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly userService: UserService) {}

  private loadCurrentUser(): User | null {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Observable<User | null> {
    return this.userService.getUsers().pipe(
      map(users => {
        const user = users.find(u => u.email === email && u.password === password) ?? null;
        if (user) {
          localStorage.setItem(this.storageKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }

    const normalizedRole = user.role.trim().toLowerCase();
    return roles.map(role => role.trim().toLowerCase()).includes(normalizedRole);
  }
}
