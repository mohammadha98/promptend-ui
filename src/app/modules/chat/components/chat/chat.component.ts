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
  imports: [ChatInputComponent, MessageListComponent, ChatHeaderComponent, ChatSidebarComponent, ChatListsComponent, ChatHeaderComponent,NgIf],
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
  }[]> = signal([
    { messageType: signal('user'), content: signal('Hello!'), userTokens: signal(10), model: signal('GPT-3') },
    { messageType: signal('user'), content: signal('Hello!'), userTokens: signal(10), model: signal('GPT-3') },
    { messageType: signal('ai'), content: signal('Hi there!'), userTokens: signal(0), model: signal('GPT-3') },
    { messageType: signal('ai'), content: signal('Hi there!'), userTokens: signal(0), model: signal('GPT-3') },
    { messageType: signal('user'), content: signal('How are you?'), userTokens: signal(10), model: signal('GPT-3') },
    { messageType: signal('ai'), content: signal('I am just a program, but I am functioning as expected!'), userTokens: signal(0), model: signal('GPT-3') },
    { messageType: signal('user'), content: signal('What can you do?'), userTokens: signal(10), model: signal('GPT-3') },
    { messageType: signal('ai'), content: signal('I can assist with various tasks, such as answering questions and providing information.'), userTokens: signal(0), model: signal('GPT-3') }
  ]);

  handleSendMessage(messageContent: string) {
    console.log(messageContent);
    
    this.messages.set([...this.messages(), { messageType: signal('user'), content: signal(messageContent), userTokens: signal(10), model: signal('GPT-3') }]);
    console.log(this.messages());
    
  }

  toggleSidebar($event: boolean) {
    this.isSidebarVisible.set($event);
  }
}
