import { Component, Input, Signal, signal, WritableSignal } from '@angular/core';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatService } from '../../services/chat.service';
import { ChatSidebarComponent } from "../chat-sidebar/sidebar.component";
import { ChatListsComponent } from "../chat-lists/chat-lists.component";
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatHeaderComponent } from "../chat-header/chat-header.component";
import { MessageModel } from '../../models/message.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [ChatInputComponent, MessageListComponent, ChatHeaderComponent, ChatSidebarComponent, ChatListsComponent, ChatHeaderComponent, NgIf],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @Input() isSidebarVisible: WritableSignal<boolean> = signal(true);

  constructor(private chatservice: ChatService) { }
  messages: WritableSignal<{ 
    messageType: Signal<'user' | 'ai'>, 
    content: Signal<string>, 
    userTokens: Signal<number>, 
    model: Signal<string> 
  }[]> = signal([]);

  handleSendMessage(messageContent: string) {
    console.log(messageContent);

    if (this.messages().length === 0) {
      this.chatservice.addConversation('New Conversation').subscribe(response => {
        console.log('Conversation added:', response);
        // Optionally, you can store the conversation ID or perform other actions here
      });
    }

    this.messages.set([...this.messages(), { messageType: signal('user'), content: signal(messageContent), userTokens: signal(10), model: signal('GPT-3') }]);
    console.log(this.messages());
  }

  toggleSidebar($event: boolean) {
    this.isSidebarVisible.set($event);
  }
}
