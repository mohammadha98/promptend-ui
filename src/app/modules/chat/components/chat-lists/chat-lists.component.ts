import { Component, Input, Signal, signal, WritableSignal } from '@angular/core';
import { ChatHistoryItem } from '../../models/message-list.model';
import { NgClass, NgFor } from '@angular/common';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'chat-lists',
  imports: [NgClass],
  templateUrl: './chat-lists.component.html',
  styleUrls: ['./chat-lists.component.scss']
})
export class ChatListsComponent {
  
  chatHistory: any;

  constructor(private chatStateService: ChatService) {
    this.chatHistory = this.chatStateService.getChatHistory();
  }

  toggleBranchVisibility(item: ChatHistoryItem, isOpen: boolean) {
    item.isOpen = isOpen;
  }

  addChatItem(newItem: ChatHistoryItem) {
    this.chatHistory.update((currentHistory:any) => [...currentHistory, newItem]);
  }
}
