import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  register(user: { name: string; nickname: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, user);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      map(users => {
        const user = users.find(u => u.email === credentials.email);
        
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        
        if (user.password !== credentials.password) {
          throw new Error('Contraseña incorrecta');
        }
        
        const response = {
          token: 'fake-jwt-token-' + Date.now(),
          user: {
            _id: user._id,
            name: user.name,
            nickname: user.nickname,
            email: user.email,
            profile_picture: user.profile_picture
          }
        };
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}