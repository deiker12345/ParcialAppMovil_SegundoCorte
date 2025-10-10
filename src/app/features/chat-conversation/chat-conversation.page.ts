import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from 'src/app/shared/service/auth.service';
import { ChatService } from 'src/app/shared/service/chat.service';
import { UserService } from 'src/app/shared/service/user.service';
import { ChatMessage, Chat } from 'src/app/core/model/chat.model';
import { AppUser } from 'src/app/core/model/user.model';

@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.page.html',
  styleUrls: ['./chat-conversation.page.scss'],
  standalone: false
})
export class ChatConversationPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  chatId: string = '';
  currentUserId: string = '';
  otherUser: AppUser | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';
    this.currentUserId = await this.authService.getCurrentUserId() || '';
    
    if (!this.chatId) {
      this.router.navigate(['/chat']);
      return;
    }

    await this.loadChatData();
    await this.loadMessages();
    this.scrollToBottom();
  }

  async loadChatData() {
    try {
      // Por ahora, simulamos datos del chat
      // En una implementación real, cargaríamos desde Firebase
      const mockOtherUserId = 'user2'; // Este vendría del chat real
      this.otherUser = await this.userService.getUserById(mockOtherUserId);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  }

  async loadMessages() {
    try {
      // Por ahora, simulamos mensajes
      // En una implementación real, cargaríamos desde Firebase
      this.messages = [
        {
          id: 'msg1',
          senderId: 'user2',
          text: '¡Hola! ¿Cómo estás?',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        {
          id: 'msg2',
          senderId: this.currentUserId,
          text: '¡Hola! Muy bien, gracias. ¿Y tú?',
          timestamp: new Date(Date.now() - 3000000),
          type: 'text'
        },
        {
          id: 'msg3',
          senderId: 'user2',
          text: 'Genial! ¿Te gustaría que nos conozcamos mejor?',
          timestamp: new Date(Date.now() - 1800000),
          type: 'text'
        }
      ];
      
      this.isLoading = false;
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      this.isLoading = false;
    }
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: this.currentUserId,
      text: this.newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    try {
      // Agregar mensaje localmente primero
      this.messages.push(message);
      this.newMessage = '';
      
      // Scroll al final
      setTimeout(() => this.scrollToBottom(), 100);

      // En una implementación real, enviaríamos a Firebase
      // await this.chatService.sendMessage(this.chatId, message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remover mensaje si falló el envío
      this.messages.pop();
    }
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  formatMessageTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  goBack() {
    this.router.navigate(['/chat']);
  }

}
