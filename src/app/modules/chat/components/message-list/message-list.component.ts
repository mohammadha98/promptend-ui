import { Component, Input, Signal, signal, inject, computed } from '@angular/core';
import { MessageModel } from '../../models/message.model';
import { MessageComponent } from '../message/message.component';
import { NavigateModeService } from '../../services/navigate-mode.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-message-list',
  imports: [MessageComponent, NgIf],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent {
  @Input() conversationId: Signal<string> = signal('');
  @Input() messages: { 
    messageType: Signal<'user' | 'ai'>, 
    content: Signal<string>, 
    userTokens: Signal<number>, 
    model: Signal<string>,
    id?: Signal<string>
  }[] = [
    {
      messageType: signal<'user' | 'ai'>('user'),
      content: signal('Hello, how can I create a new Angular component?'),
      userTokens: signal(15),
      model: signal('')
    },
    {
      messageType: signal<'user' | 'ai'>('ai'),
      content: signal('You can create a new component using the Angular CLI command: `ng generate component component-name`'),
      userTokens: signal(30),
      model: signal('GPT-3.5')
    }
  ];

  // Inject the NavigateModeService to access the isNavigateModeActive signal
  private navigateModeService = inject(NavigateModeService);
  
  // Expose the isNavigateModeActive signal to the template
  isNavigateModeActive = this.navigateModeService.getNavigateModeState();

  getMessageId(message: any, index: number): Signal<string> {
    return message.id || signal('msg-' + index);
  }
  
  // Track the collapse state of all messages
  private messageCollapseStates = new Map<string, boolean>();

  // Computed signal to check if all messages are collapsed
  areAllMessagesCollapsed = computed(() => {
    if (this.messages.length === 0) return false;
    
    // Check if all messages have a collapse state of true
    for (const [_, isCollapsed] of this.messageCollapseStates.entries()) {
      if (!isCollapsed) return false;
    }
    return true;
  });

  // Handle message collapse toggle events from child components
  onMessageToggleCollapse(event: { messageId: string, isCollapsed: boolean }): void {
    // Update the local collapse state map
    this.messageCollapseStates.set(event.messageId, event.isCollapsed);
    
    // Call the service method
    this.navigateModeService.toggleMessageCollapse(event.messageId, event.isCollapsed);
  }

  // Toggle all messages collapse/expand state
  toggleAllMessages(): void {
    const shouldCollapse = !this.areAllMessagesCollapsed();
    
    // Set all messages collapse state in the service
    this.navigateModeService.setAllMessagesCollapseState(shouldCollapse);
    
    // Update all messages
    this.messages.forEach((message, index) => {
      const messageId = this.getMessageId(message, index)();
      
      // Update the local collapse state map
      this.messageCollapseStates.set(messageId, shouldCollapse);
      
      // Emit events for each message to update their state
      this.onMessageToggleCollapse({
        messageId: messageId,
        isCollapsed: shouldCollapse
      });
    });
  }
}
