import { Component, Input, Signal, signal, WritableSignal, computed, effect } from '@angular/core';
import { ChatHistoryItem, BranchDetail } from '../../models/message-list.model';
import { ChatSession, Branch } from '../../models/chat-session.model';
import { ChatBranchingService } from '../../services/chat-branching.service';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'chat-lists',
  imports: [NgClass],
  templateUrl: './chat-lists.component.html',
  styleUrls: ['./chat-lists.component.scss']
})
export class ChatListsComponent {
  
  // Convert ChatSession data to ChatHistoryItem format for UI compatibility
  chatHistory = computed<ChatHistoryItem[]>(() => {
    const sessions = this.branchingService.getChatSessions()();
    console.log('ChatListsComponent - Sessions from service:', sessions);
    const historyItems = sessions.map(session => this.convertSessionToHistoryItem(session));
    console.log('ChatListsComponent - Converted history items:', historyItems);
    return historyItems;
  });

  constructor(private branchingService: ChatBranchingService) {
    // Initialize signals after service injection
    this.currentSession = this.branchingService.getCurrentSession();
    this.currentBranch = this.branchingService.getCurrentBranch();
    this.lastError = this.branchingService.getLastError();

    // Effect to handle error display
    effect(() => {
      const error = this.lastError();
      if (error) {
        console.error('Branching error:', error.message);
        // You can add toast notification here
      }
    });
  }

  toggleBranchVisibility(item: ChatHistoryItem, isOpen: boolean) {
    item.isOpen = isOpen;
  }

  /**
   * Create a new conversation session
   */
  createNewConversation(): void {
    const timestamp = new Date().toLocaleString();
    const title = `New Chat - ${timestamp}`;
    
    try {
      const newSession = this.branchingService.createChatSession(title);
      console.log('New conversation session created:', newSession);
      // The UI will automatically update through computed signals
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  }

  /**
   * Create a new branch from the active branch of a session
   */
  createNewBranch(sessionId: string): void {
    const session = this.findSessionById(sessionId);
    if (!session) {
      console.error('Session not found for creating new branch');
      return;
    }

    const activeBranch = session.branches.find(branch => branch.isActive);
    if (!activeBranch) {
      console.error('No active branch found in session');
      return;
    }

    this.branchingService.createBranch({
      sessionId: sessionId,
      sourceBranchId: activeBranch.branchId
    }).subscribe({
      next: (newBranch) => {
        console.log('New branch created successfully:', newBranch);
        // The UI will automatically update through computed signals
      },
      error: (error) => {
        console.error('Failed to create new branch:', error);
        // Error handling is managed by the service
      }
    });
  }

  /**
   * Switch to a specific branch
   */
  switchToBranch(sessionId: string, branchId: string): void {
    this.branchingService.switchToBranch({
      sessionId: sessionId,
      targetBranchId: branchId
    }).subscribe({
      next: (branch) => {
        console.log('Switched to branch:', branch);
        // The UI will automatically update through computed signals
      },
      error: (error) => {
        console.error('Failed to switch branch:', error);
      }
    });
  }

  /**
   * Retry last failed operation
   */
  retryLastOperation(): void {
    this.branchingService.retryLastOperation();
  }

  /**
   * Debug method to manually reload data
   */
  // debugReload(): void {
  //   console.log('Debug reload triggered from component');
  //   this.branchingService.reloadChatSessions();
  // }

  /**
   * Get session ID from ChatHistoryItem
   */
  getSessionId(item: ChatHistoryItem): string {
    return item.id || '';
  }

  /**
   * Check if a branch is currently active
   */
  isBranchActive(sessionId: string, branchName: string): boolean {
    const session = this.findSessionById(sessionId);
    if (!session) return false;
    
    const branch = session.branches.find(b => b.name === branchName);
    return branch?.isActive || false;
  }


  currentSession!: Signal<any>;
  currentBranch!: Signal<any>;
  lastError!: Signal<any>;

  /**
   * Find branch ID by branch name
   */
  findBranchIdByName(sessionId: string, branchName: string): string {
    const session = this.findSessionById(sessionId);
    if (!session) return '';
    
    const branch = session.branches.find(b => b.name === branchName);
    return branch?.branchId || '';
  }

  // Private helper methods
  private findSessionById(sessionId: string): ChatSession | undefined {
    return this.branchingService.getChatSessions()().find(session => session.id === sessionId);
  }

  private convertSessionToHistoryItem(session: ChatSession): ChatHistoryItem {
    const activeBranch = session.branches.find(branch => branch.isActive);
    const branchesDetails: BranchDetail[] = session.branches.map((branch, index) => ({
      name: branch.name,
      timeAgo: this.getTimeAgo(branch.createdAt),
      color: this.getBranchColor(index)
    }));

    return {
      id: session.id,
      title: session.title,
      branches: session.branches.length,
      status: activeBranch ? 'active' : 'inactive',
      lastUpdated: this.getTimeAgo(session.createdAt),
      branchesDetails: branchesDetails,
      isOpen: false // Default to closed, can be managed by UI state
    };
  }

  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }

  private getBranchColor(index: number): string {
    const colors = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'];
    return colors[index % colors.length];
  }
}
