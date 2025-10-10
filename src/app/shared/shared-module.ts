import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { SwipeCardComponent } from './components/swipe-card/swipe-card.component';

const MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  IonicModule
];

const COMPONENTS = [
  ChatMessageComponent,
  SwipeCardComponent,
  // PassionBadgeComponent,
  // UserCardComponent,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [...MODULES],
  exports: [...MODULES, ...COMPONENTS]
})
export class SharedModule { }
