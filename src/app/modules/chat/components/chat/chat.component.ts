import { Component, Input, Signal, signal, WritableSignal } from '@angular/core';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatService } from '../../services/chat.service';
import { ChatSidebarComponent } from "../chat-sidebar/sidebar.component";
import { ChatListsComponent } from "../chat-lists/chat-lists.component";
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatHeaderComponent } from "../chat-header/chat-header.component";
import { MessageModel } from '../../models/message.model';
import { NgIf } from '@angular/common';
import { ChatHistoryItem } from '../../models/message-list.model';

@Component({
  selector: 'app-chat',
  imports: [ChatInputComponent, MessageListComponent, ChatHeaderComponent, ChatSidebarComponent, ChatListsComponent, ChatHeaderComponent, NgIf],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @Input() isSidebarVisible: WritableSignal<boolean> = signal(true);

  conversId: string | undefined = undefined;
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
      this.chatservice.addConversation(messageContent).subscribe(response => {
        console.log(response.response.title);
        this.conversId = response.response._id;
        

        const newChatItem: ChatHistoryItem = {
          id:this.conversId,
          title: response.response.title,
          branches: 0,
          status: 'active',
          lastUpdated: 'just now',
          branchesDetails: []
        };
        this.chatservice.addChatItem(newChatItem);
      });
    }

    this.messages.set([...this.messages(), { messageType: signal('user'), content: signal(messageContent), userTokens: signal(10), model: signal('GPT-3') }]);
    console.log(this.messages());
  }

  toggleSidebar($event: boolean) {
    this.isSidebarVisible.set($event);
  }
}
