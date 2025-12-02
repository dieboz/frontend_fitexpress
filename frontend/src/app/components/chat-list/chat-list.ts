import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-chat-list',
  standalone: false,
  templateUrl: './chat-list.html',
  styleUrls: ['./chat-list.css'],
})
export class ChatListComponent implements OnInit {
  users: any[] = [];
  selectedUser: any = null;
  messages: any[] = [];
  newMessage: string = '';
  currentUser: any = null;
  chatId: string = '';
  currentChatObject: any = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Usuario actual:', this.currentUser);
    
    if (!this.currentUser || !this.currentUser._id) {
      console.error('No hay usuario autenticado');
      return;
    }
    
    this.loadUsers();
  }

  // Cargar lista de usuarios para chatear
  loadUsers(): void {
    console.log('=== CARGANDO USUARIOS ===');
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Usuarios obtenidos:', users);
        // Filtrar el usuario actual de la lista
        this.users = users.filter((u: any) => u._id !== this.currentUser._id);
        console.log('Usuarios filtrados para chat:', this.users);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  // Seleccionar un usuario para chatear
  selectUser(user: any): void {
    console.log('=== SELECCIONANDO USUARIO ===');
    console.log('Usuario seleccionado:', user);
    console.log('Usuario actual:', this.currentUser);
    
    this.selectedUser = user;
    this.messages = [];
    
    // Obtener o crear el chat entre los dos usuarios
    this.chatService.findOrCreateChat(this.currentUser._id, user._id).subscribe({
      next: (chat) => {
        console.log('✅ Chat obtenido/creado:', chat);
        this.currentChatObject = chat;
        this.chatId = chat._id;
        this.loadMessages();
      },
      error: (error) => {
        console.error('❌ Error al obtener/crear chat:', error);
        console.error('Detalles:', error.error);
        alert('Error al crear el chat: ' + (error.error?.error || error.message));
      }
    });
  }

  // Cargar mensajes del chat
  loadMessages(): void {
    console.log('=== CARGANDO MENSAJES ===');
    console.log('Chat ID:', this.chatId);
    
    this.chatService.getChatMessages(this.chatId).subscribe({
      next: (messages) => {
        console.log('✅ Mensajes cargados:', messages);
        this.messages = messages;
        this.scrollToBottom();
        
        // Marcar mensajes como leídos
        if (messages.length > 0) {
          this.chatService.markAllAsRead(this.chatId, this.currentUser._id).subscribe({
            next: () => console.log('Mensajes marcados como leídos'),
            error: (err) => console.error('Error al marcar como leídos:', err)
          });
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar mensajes:', error);
        console.error('Detalles:', error.error);
        this.messages = [];
      }
    });
  }

  // Enviar mensaje
  sendMessage(): void {
    console.log('=== ENVIANDO MENSAJE ===');
    console.log('Mensaje:', this.newMessage);
    console.log('Chat ID:', this.chatId);
    console.log('Sender:', this.currentUser._id);
    console.log('Receiver:', this.selectedUser._id);
    
    if (!this.newMessage.trim() || !this.selectedUser) {
      console.warn('⚠️ Mensaje vacío o no hay usuario seleccionado');
      return;
    }

    if (!this.chatId) {
      console.error('❌ No hay chat ID');
      alert('Error: No se pudo crear el chat');
      return;
    }

    const message = {
      chat_id: this.chatId,
      sender_id: this.currentUser._id,
      receiver_id: this.selectedUser._id,
      content: this.newMessage.trim()
    };

    console.log('Mensaje a enviar:', message);

    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        console.log('✅ Mensaje enviado exitosamente:', response);
        
        // Agregar el mensaje a la lista
        if (response.message) {
          this.messages.push(response.message);
        } else {
          this.messages.push(response);
        }
        
        this.newMessage = '';
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('❌ Error al enviar mensaje:', error);
        console.error('Detalles del error:', error.error);
        alert('Error al enviar mensaje: ' + (error.error?.error || error.message));
      }
    });
  }

  // Eliminar mensaje
  deleteMessage(messageId: string): void {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) {
      return;
    }

    console.log('Eliminando mensaje:', messageId);

    this.chatService.deleteMessage(messageId).subscribe({
      next: (response) => {
        console.log('✅ Mensaje eliminado:', response);
        this.messages = this.messages.filter(m => m._id !== messageId);
      },
      error: (error) => {
        console.error('❌ Error al eliminar mensaje:', error);
        alert('Error al eliminar mensaje: ' + (error.error?.error || error.message));
      }
    });
  }

  // Scroll al final de los mensajes
  scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  // Verificar si el mensaje es del usuario actual
  isMyMessage(message: any): boolean {
    const senderId = message.sender_id?._id || message.sender_id;
    return senderId === this.currentUser._id;
  }

  // Obtener nombre del sender
  getSenderName(message: any): string {
    if (message.sender_id?.name) {
      return message.sender_id.name;
    }
    return this.isMyMessage(message) ? 'Tú' : this.selectedUser?.name || 'Desconocido';
  }
}