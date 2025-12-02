import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  // ============ ENDPOINTS DE POSTS ============

  // Crear un nuevo post
  createPost(post: { user_id: string; content: string; image?: string }): Observable<any> {
    return this.http.post(this.baseUrl, post);
  }

  // Obtener todos los posts
  getAllPosts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all`);
  }

  // Obtener posts de un usuario específico
  getUserPosts(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  // Obtener un post específico por ID
  getPostById(postId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${postId}`);
  }

  // Actualizar un post
  updatePost(postId: string, content: string, image?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${postId}`, { content, image });
  }

  // Eliminar un post
  deletePost(postId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${postId}`);
  }

  // ============ LIKES ============

  // Dar like a un post
  likePost(postId: string, userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${postId}/like`, { user_id: userId });
  }

  // Quitar like de un post
  unlikePost(postId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${postId}/like`, { 
      body: { user_id: userId } 
    });
  }

  // ============ COMENTARIOS ============

  // Agregar comentario a un post
  addComment(postId: string, userId: string, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${postId}/comment`, { 
      user_id: userId, 
      text 
    });
  }
}