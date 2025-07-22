import { Component, Input, Signal, signal, WritableSignal, computed, effect } from '@angular/core';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { AIChatService } from '../../services/ai.chat.service';
import { UserMessagesService } from '../../services/user-messages.service';
import { RebuildService } from '../../services/rebuild.service';
import { ChatBranchingService } from '../../services/chat-branching.service';
import { NavigateModeService } from '../../services/navigate-mode.service';
import { ChatSidebarComponent } from "../chat-sidebar/sidebar.component";
import { ChatListsComponent } from "../chat-lists/chat-lists.component";
import { MessageListComponent } from '../message-list/message-list.component';
import { ChatHeaderComponent } from "../chat-header/chat-header.component";
import { MessageModel } from '../../models/message.model';
import { BranchMessage, CreateMessageInput } from '../../models/chat-session.model';

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
  isDarkMode: boolean = false;
  
  constructor(
    private chatservice: AIChatService, 
    private userMessagesService: UserMessagesService,
    private rebuildService: RebuildService,
    private branchingService: ChatBranchingService,
    private navigateModeService: NavigateModeService,
    private socket: Socket, 
    private themeService: ThemeService
  ) {
    // Initialize signals after service injection
    this.currentSession = this.branchingService.getCurrentSession();
    this.currentBranch = this.branchingService.getCurrentBranch();
    
    // Effect to sync messages with current branch
    effect(() => {
      const currentBranch = this.currentBranch();
      if (currentBranch) {
        this.loadMessagesFromBranch(currentBranch.messages);
      }
    });
  }

  ngOnInit(): void {
    this.themeService.isDarkMode.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    
    // Initialize chat session if none exists
    this.initializeChatSession();
  }
  messages: WritableSignal<{
    messageType: Signal<'user' | 'ai'>,
    content: Signal<string>,
    userTokens: Signal<number>,
    model: Signal<string>
  }[]> = signal([]);

  // Get current session and branch from branching service
  currentSession!: Signal<any>;
  currentBranch!: Signal<any>;

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

    // Add message to current branch
    this.addMessageToBranch({
      messageType: 'user',
      content: messageContent,
      userTokens: 0,
      model: ''
    });

    if (!this.conversId) {
      // No conversation yet, create a new one
      this.chatservice.addConversation(messageContent).subscribe({
        next: (response) => {
          this.conversId = response.id;
          this.currentConversationId.set(response.id);
          
          // Create or update chat session
          this.ensureChatSession(messageContent);
          
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
        
        // Add AI response to current branch
        this.addMessageToBranch({
          messageType: 'ai',
          content: aiResponse.content,
          userTokens: aiResponse.userTokens,
          model: aiResponse.model
        });
      },
      error: (err) => {
        console.error('Error sending message:', err);
        // Optionally, show an error message in the UI
        const errorMessage = {
          messageType: signal<'user' | 'ai'>('ai'),
          content: signal('متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.'),
          userTokens: signal(0),
          model: signal('error'),
        };
        this.messages.update(currentMessages => [...currentMessages, errorMessage]);
        
        // Add error message to current branch
        this.addMessageToBranch({
          messageType: 'ai',
          content: 'متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.',
          userTokens: 0,
          model: 'error'
        });
      }
    });
  }

  toggleSidebar($event: boolean) {
    this.isSidebarVisible.set($event);
  }
  
  /**
   * Handle navigate mode toggle
   */
  handleNavigateModeToggle($event: boolean): void {
    // Update all messages' collapsed state based on navigate mode
    const currentBranch = this.currentBranch();
    if (currentBranch) {
      const updatedMessages = currentBranch.messages.map((msg:any) => ({
        ...msg,
        isCollapsed: $event
      }));
      
      // Update the branch with the new message states
      this.branchingService.updateBranchMessages(currentBranch.branchId, updatedMessages);
      
      // Reload messages to reflect changes
      this.loadMessagesFromBranch(updatedMessages);
    }
  }

  /**
   * Handle message editing
   */
  handleMessageEdit(messageId: string, newContent: string): void {
    if (!newContent.trim()) return;
    
    const success = this.userMessagesService.updateUserMessage(messageId, newContent);
    if (success) {
      console.log('Message updated successfully in LocalStorage');
    } else {
      console.error('Failed to update message in LocalStorage');
    }
  }

  /**
   * Handle rebuild conversation
   */
  handleRebuildConversation(options?: { preserveIntent?: boolean; aggressiveness?: 'conservative' | 'balanced' | 'aggressive' }): void {
    if (!this.conversId) {
      console.error('No active conversation to rebuild');
      return;
    }

    const rebuildOptions = {
      conversationId: this.conversId,
      preserveIntent: options?.preserveIntent ?? true,
      aggressiveness: options?.aggressiveness ?? 'balanced',
      mode: 'manual' as const
    };

    console.log('Starting rebuild with options:', rebuildOptions);
    console.log('User messages to rebuild:', this.getUserMessages());

    this.rebuildService.rebuildConversation(rebuildOptions).subscribe({
      next: (result) => {
        if (result.success) {
          console.log('Rebuild completed successfully');
          console.log('Rebuild result:', result);
          
          // Update UI with new messages
          this.updateMessagesFromRebuild(result.messages);
          
          // Note: The rebuild creates a new conversation, but we keep the current UI
          // The user can see the rebuilt conversation in the current view
        } else {
          console.error('Rebuild failed:', result.errorMessage);
        }
      },
      error: (err) => {
        console.error('Rebuild error:', err);
      }
    });
  }

  /**
   * Update messages in UI from rebuild results
   */
  private updateMessagesFromRebuild(rebuildMessages: MessageModel[]): void {
    // Clear current AI messages and rebuild from user messages + new AI responses
    const newMessages = rebuildMessages.map(msg => ({
      messageType: signal<'user' | 'ai'>(msg.messageType),
      content: signal(msg.content),
      userTokens: signal(msg.userTokens),
      model: signal(msg.model)
    }));
    
    this.messages.set(newMessages);
  }

  /**
   * Get rebuild progress
   */
  getRebuildProgress() {
    return this.userMessagesService.getRebuildProgress();
  }

  /**
   * Get rebuild status
   */
  getIsRebuilding() {
    return this.rebuildService.getIsRebuilding();
  }

  /**
   * Cancel ongoing rebuild
   */
  cancelRebuild(): void {
    this.rebuildService.cancelRebuild();
  }

  /**
   * Get user messages for current conversation
   */
  getUserMessages() {
    if (!this.conversId) return [];
    return this.userMessagesService.getUserMessagesForConversation(this.conversId);
  }

  /**
   * Get rebuild statistics
   */
  getRebuildStatistics() {
    if (!this.conversId) return null;
    return this.rebuildService.getRebuildStatistics(this.conversId);
  }

  private initializeChatSession(): void {
    const currentSession = this.branchingService.getCurrentSession()();
    if (!currentSession) {
      // Create initial chat session
      this.branchingService.createChatSession('ّFirst Thread');
    }
  }

  private ensureChatSession(firstMessage: string): void {
    const currentSession = this.branchingService.getCurrentSession()();
    if (!currentSession) {
      this.branchingService.createChatSession(firstMessage.substring(0, 30) + '...');
    }
  }

  private addMessageToBranch(messageInput: CreateMessageInput): void {
    try {
      this.branchingService.addMessageToCurrentBranch(messageInput);
    } catch (error) {
      console.error('Failed to add message to branch:', error);
    }
  }

  private loadMessagesFromBranch(branchMessages: BranchMessage[]): void {
    const uiMessages = branchMessages.map(msg => ({
      messageType: signal<'user' | 'ai'>(msg.messageType),
      content: signal(msg.content),
      userTokens: signal(msg.userTokens),
      model: signal(msg.model)
    }));
    
    this.messages.set(uiMessages);
  }
}
