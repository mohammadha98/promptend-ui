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
  
  chatHistory = signal<ChatHistoryItem[]>([
    {
      title: 'Initial Chat',
      branches: 3,
      status: 'active',
      isOpen: true,
      lastUpdated:"2023-09-11 10:00:00",
      branchesDetails: [
        { name: 'Branch 1', timeAgo: '2m ago', color: 'blue' },
        { name: 'Branch 2', timeAgo: '5m ago', color: 'purple' },
        { name: 'Branch 3', timeAgo: '10m ago', color: 'green' },
      ]
    },
    {
      title: 'Follow-up Discussion',
      branches: 2,
       lastUpdated:"2023-09-11 10:00:00",
      status: 'inactive',
      isOpen: false,
      branchesDetails: [
        { name: 'Follow-up 1', timeAgo: '1h ago', color: 'blue' },
        { name: 'Follow-up 2', timeAgo: '2h ago', color: 'purple' },
      ]
    }
  ]);

  constructor(private chatStateService: ChatService) {
    // this.chatHistory = this.chatStateService.getChatHistory();
  }

  toggleBranchVisibility(item: ChatHistoryItem, isOpen: boolean) {
    item.isOpen = isOpen;
  }

  addChatItem(newItem: ChatHistoryItem) {
    this.chatHistory.update((currentHistory:any) => [...currentHistory, newItem]);
  }
}
