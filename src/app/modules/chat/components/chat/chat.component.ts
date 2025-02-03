import { NgFor } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatService } from '../../services/chat.service';
import { ChatSidebarComponent } from "../chat-sidebar/sidebar.component";
import { SidebarComponent } from '../../../../shared/sidebar/sidebar.component';
import { ChatListsComponent } from "../chat-lists/chat-lists.component";
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatHeaderComponent } from "../chat-header/chat-header.component";

@Component({
  selector: 'app-chat',
  imports: [ChatInputComponent, MessageListComponent, ChatHeaderComponent, ChatSidebarComponent, SidebarComponent, ChatListsComponent, ChatHeaderComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {

  constructor(private chatservice:ChatService) {}
  messages = [
    { isUserMessage: true, userMessage: 'Hello!', userTokens: 10, userModel: 'GPT-3', aiResponse: '' },
    { isUserMessage: false, userMessage: '', userTokens: 0, userModel: '', aiResponse: 'Hi there!' }
  ];

  handleSendMessage(messageContent: string) {
    this.messages.push({ isUserMessage: true, userMessage: messageContent, userTokens: 10, userModel: 'GPT-3', aiResponse: '' });
    // Add logic to handle AI response if needed
  }
}
