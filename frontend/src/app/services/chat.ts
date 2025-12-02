import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesUrl = `${environment.apiUrl}/messages`;
  private chatsUrl = `${environment.apiUrl}/chats`;

  constructor(private http: HttpClient) {}

  // ============ ENDPOINTS DE CHATS ============

  // Obtener o crear un chat entre dos usuarios
  findOrCreateChat(user1_id: string, user2_id: string): Observable<any> {
    return this.http.post(`${this.chatsUrl}/find-or-create`, { user1_id, user2_id });
  }

  // Obtener todos los chats de un usuario
  getUserChats(userId: string): Observable<any> {
    return this.http.get(`${this.chatsUrl}/user/${userId}`);
  }

  // Obtener un chat específico por ID
  getChatById(chatId: string): Observable<any> {
    return this.http.get(`${this.chatsUrl}/${chatId}`);
  }

  // Crear un nuevo chat
  createChat(participants: string[]): Observable<any> {
    return this.http.post(this.chatsUrl, { participants });
  }

  // Actualizar último mensaje del chat
  updateLastMessage(chatId: string, sender_id: string, content: string): Observable<any> {
    return this.http.patch(`${this.chatsUrl}/${chatId}/last-message`, { sender_id, content });
  }

  // Eliminar un chat
  deleteChat(chatId: string): Observable<any> {
    return this.http.delete(`${this.chatsUrl}/${chatId}`);
  }

  // ============ ENDPOINTS DE MENSAJES ============

  // Enviar un nuevo mensaje
  sendMessage(message: { chat_id: string; sender_id: string; receiver_id: string; content: string }): Observable<any> {
    return this.http.post(this.messagesUrl, message);
  }

  // Obtener todos los mensajes de un chat
  getChatMessages(chatId: string): Observable<any> {
    return this.http.get(`${this.messagesUrl}/chat/${chatId}`);
  }

  // Obtener mensajes no leídos de un usuario
  getUnreadMessages(userId: string): Observable<any> {
    return this.http.get(`${this.messagesUrl}/unread/${userId}`);
  }

  // Marcar mensaje como leído
  markAsRead(messageId: string): Observable<any> {
    return this.http.patch(`${this.messagesUrl}/${messageId}/read`, {});
  }

  // Marcar todos los mensajes de un chat como leídos
  markAllAsRead(chatId: string, userId: string): Observable<any> {
    return this.http.patch(`${this.messagesUrl}/chat/${chatId}/read-all`, { userId });
  }

  // Eliminar un mensaje
  deleteMessage(messageId: string): Observable<any> {
    return this.http.delete(`${this.messagesUrl}/${messageId}`);
  }
}