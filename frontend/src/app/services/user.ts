import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`; 

  constructor(private http: HttpClient) {}

  // Buscar usuarios por nickname o nombre
  searchUsers(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/${query}`);
  }

  // Obtener todos los usuarios
  getUsers(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  // Obtener un usuario específico
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  // Crear un nuevo usuario
  createUser(user: any): Observable<any> {
    return this.http.post(this.baseUrl, user);
  }

  // Actualizar perfil de usuario completo
  updateProfile(userId: string, userData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${userId}`, userData);
  }

  // Eliminar usuario
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Cambiar contraseña
  changePassword(userId: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }
}