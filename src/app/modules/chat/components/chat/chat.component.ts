import { Component, Input } from '@angular/core';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatService } from '../../services/chat.service';
import { ChatSidebarComponent } from "../chat-sidebar/sidebar.component";
import { ChatListsComponent } from "../chat-lists/chat-lists.component";
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatHeaderComponent } from "../chat-header/chat-header.component";
import { MessageModel } from '../../models/message.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [ChatInputComponent,NgClass, MessageListComponent, ChatHeaderComponent, ChatSidebarComponent, ChatListsComponent, ChatHeaderComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
 @Input() isSidebarVisible: boolean = true;

  constructor(private chatservice:ChatService) {}
  messages: MessageModel[] = [
    { messageType: 'user', content: 'Hello!', userTokens: 10, model: 'GPT-3' },
    { messageType: 'user', content: 'Hello!', userTokens: 10, model: 'GPT-3' },
    { messageType: 'ai', content: 'Hi there!', userTokens: 0, model: 'GPT-3' },
    { messageType: 'ai', content: 'Hi there!', userTokens: 0, model: 'GPT-3' },
    { messageType: 'user', content: 'How are you?', userTokens: 10, model: 'GPT-3' },
    { messageType: 'ai', content: 'I am just a program, but I am functioning as expected!', userTokens: 0, model: 'GPT-3' },
    { messageType: 'user', content: 'What can you do?', userTokens: 10, model: 'GPT-3' },
    { messageType: 'ai', content: 'I can assist with various tasks, such as answering questions and providing information.', userTokens: 0, model: 'GPT-3' }
  ];

  handleSendMessage(messageContent: string) {
    this.messages.push({ messageType: 'user', content: messageContent, userTokens: 10, model: 'GPT-3' });
    // Add logic to handle AI response if needed
  }
  
  toggleSidebar($event: boolean) {
    console.log('toggleSidebar', $event);
    
    this.isSidebarVisible = $event;
  }
}
