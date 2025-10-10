import { Component, Input } from '@angular/core';
import { ChatMessage } from 'src/app/core/model/chat.model';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  standalone: false 
})
export class ChatMessageComponent {
  
  @Input() message!: ChatMessage;

  @Input() currentUserId!: string;

  get isOwnMessage(): boolean {
    return this.message.senderId === this.currentUserId;
  }
}
