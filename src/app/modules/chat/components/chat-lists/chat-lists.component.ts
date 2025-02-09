import { Component, signal, WritableSignal } from '@angular/core';
import { ChatHistoryItem } from '../../models/message-list.model';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'chat-lists',
  imports: [NgClass],
  templateUrl: './chat-lists.component.html',
  styleUrls: ['./chat-lists.component.scss']
})
export class ChatListsComponent {
  
  chatHistory: WritableSignal<ChatHistoryItem[]> = signal([
    {
      title: 'Main Conversation Flow',
      branches: 3,
      status: 'active',
      lastUpdated: '2h ago',
      branchesDetails: [
        { name: 'Technical Clarifications', timeAgo: '2h ago', color: 'blue' },
        { name: 'Creative Variations', timeAgo: '1h ago', color: 'purple' }
      ]
    },
    {
      title: 'Secondary Flow',
      branches: 2,
      status: 'inactive',
      lastUpdated: '5h ago',
      branchesDetails: [
        { name: 'Follow-up Questions', timeAgo: '3h ago', color: 'green' }
      ]
    }
  ]);

  toggleBranchVisibility(item: ChatHistoryItem, isOpen: boolean) {
    item.isOpen = isOpen;
  }
}
