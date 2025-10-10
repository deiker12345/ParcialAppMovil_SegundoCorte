import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatConversationPageRoutingModule } from './chat-conversation-routing.module';

import { ChatConversationPage } from './chat-conversation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatConversationPageRoutingModule
  ],
  declarations: [ChatConversationPage]
})
export class ChatConversationPageModule {}
