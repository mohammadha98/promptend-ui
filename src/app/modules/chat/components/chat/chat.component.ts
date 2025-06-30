import { Component, Input, Signal, signal, WritableSignal } from '@angular/core';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { AIChatService } from '../../services/ai.chat.service';
import { ChatSidebarComponent } from "../chat-sidebar/sidebar.component";
import { ChatListsComponent } from "../chat-lists/chat-lists.component";
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatHeaderComponent } from "../chat-header/chat-header.component";
import { MessageModel } from '../../models/message.model';

import { ChatHistoryItem } from '../../models/message-list.model';
import { Socket } from 'ngx-socket-io';
import { map } from 'rxjs';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-chat',
  imports: [ChatInputComponent, MessageListComponent, ChatHeaderComponent, ChatSidebarComponent, ChatListsComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @Input() isSidebarVisible: WritableSignal<boolean> = signal(true);

  conversId: string | undefined = undefined;
  currentConversationId: WritableSignal<string> = signal('');
  constructor(private chatservice: AIChatService, private socket: Socket, private themeService: ThemeService) { }
  messages: WritableSignal<{
    messageType: Signal<'user' | 'ai'>,
    content: Signal<string>,
    userTokens: Signal<number>,
    model: Signal<string>
  }[]> = signal([]);

  handleSendMessage(messageContent: string) {
    if (!messageContent.trim()) return;

    // Add user message to the UI immediately
    const userMessage = {
      messageType: signal<'user' | 'ai'>('user'),
      content: signal(messageContent),
      userTokens: signal(0), // Placeholder, will be updated later
      model: signal(''), // Placeholder
    };
    this.messages.update(currentMessages => [...currentMessages, userMessage]);

    if (!this.conversId) {
      // No conversation yet, create a new one
      this.chatservice.addConversation(messageContent).subscribe({
        next: (response) => {
          this.conversId = response.id;
          this.currentConversationId.set(response.id);
          this.sendMessageToServer(messageContent, this.conversId!);
        },
        error: (err) => console.error('Error creating conversation:', err)
      });
    } else {
      // Existing conversation, just send the message
      this.sendMessageToServer(messageContent, this.conversId);
    }
  }

  private sendMessageToServer(message: string, chatId: string): void {
    this.chatservice.sendMessage(message, chatId).subscribe({
      next: (aiResponse) => {
        const aiMessage = {
          messageType: signal<'user' | 'ai'>('ai'),
          content: signal(aiResponse.content),
          userTokens: signal(aiResponse.userTokens),
          model: signal(aiResponse.model),
        };
        this.messages.update(currentMessages => [...currentMessages, aiMessage]);
      },
      error: (err) => {
        console.error('Error sending message:', err);
        // Optionally, show an error message in the UI
        const errorMessage = {
          messageType: signal<'user' | 'ai'>('ai'),
          content: signal('Sorry, something went wrong. Please try again.'),
          userTokens: signal(0),
          model: signal('error'),
        };
        this.messages.update(currentMessages => [...currentMessages, errorMessage]);
      }
    });
  }

  toggleSidebar($event: boolean) {
    this.isSidebarVisible.set($event);
  }
}
