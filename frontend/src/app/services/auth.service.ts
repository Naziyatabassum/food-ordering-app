import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:9090/api/auth';
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { email, password });
  }
  register(user: any): Observable<any> {
    return this.http.post(`${this.api}/register`, user);
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/users`);
  }
  setUser(user: any): void { localStorage.setItem('user', JSON.stringify(user)); }
  getUser(): any { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
  isLoggedIn(): boolean { return !!localStorage.getItem('user'); }
  isAdmin(): boolean { const u = this.getUser(); return u && u.role === 'ADMIN'; }
  logout(): void { localStorage.removeItem('user'); }
}
