import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/service/auth.service';
import { ChatService } from 'src/app/shared/service/chat.service';
import { UserService } from 'src/app/shared/service/user.service';
import { Chat } from 'src/app/core/model/chat.model';
import { AppUser } from 'src/app/core/model/user.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {

  chats: Chat[] = [];
  currentUserId: string = '';
  userProfiles: { [key: string]: AppUser } = {};

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.currentUserId = await this.authService.getCurrentUserId() || '';
    await this.loadChats();
  }

  async loadChats() {
    try {
      // Aquí implementaremos la lógica para cargar los chats del usuario
      // Por ahora, creamos datos de ejemplo
      this.chats = [
        {
          id: 'chat1',
          users: [this.currentUserId, 'user2'],
          lastMessage: {
            id: 'msg1',
            senderId: 'user2',
            text: '¡Hola! ¿Cómo estás?',
            timestamp: new Date()
          }
        },
        {
          id: 'chat2',
          users: [this.currentUserId, 'user3'],
          lastMessage: {
            id: 'msg2',
            senderId: this.currentUserId,
            text: 'Nos vemos mañana',
            timestamp: new Date(Date.now() - 3600000) // 1 hora atrás
          }
        }
      ];

      // Cargar perfiles de usuarios para mostrar nombres y fotos
      await this.loadUserProfiles();
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }

  async loadUserProfiles() {
    const userIds = new Set<string>();
    this.chats.forEach(chat => {
      chat.users.forEach(userId => {
        if (userId !== this.currentUserId) {
          userIds.add(userId);
        }
      });
    });

    for (const userId of userIds) {
      try {
        const user = await this.userService.getUserById(userId);
        if (user) {
          this.userProfiles[userId] = user;
        }
      } catch (error) {
        console.error(`Error loading user ${userId}:`, error);
      }
    }
  }

  getOtherUserId(chat: Chat): string {
    return chat.users.find(userId => userId !== this.currentUserId) || '';
  }

  getOtherUserProfile(chat: Chat): AppUser | null {
    const otherUserId = this.getOtherUserId(chat);
    return this.userProfiles[otherUserId] || null;
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  getCurrentDate(): Date {
    return new Date();
  }

  openChat(chat: Chat) {
    this.router.navigate(['/chat-conversation', chat.id]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

}