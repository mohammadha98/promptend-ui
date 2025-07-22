import { Injectable, signal, WritableSignal, Signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ChatSession, Branch, BranchMessage, CreateBranchOptions, SwitchBranchOptions, BranchingError, CreateMessageInput } from '../models/chat-session.model';
import { MessageModel } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatBranchingService {
  private readonly STORAGE_KEY = 'chatSessions';
  private chatSessions: WritableSignal<ChatSession[]> = signal([]);
  private currentSession: WritableSignal<ChatSession | null> = signal(null);
  private currentBranch: WritableSignal<Branch | null> = signal(null);
  private lastError: WritableSignal<BranchingError | null> = signal(null);

  constructor() {
    console.log('ChatBranchingService initialized with STORAGE_KEY:', this.STORAGE_KEY);
    this.loadChatSessions();
  }

  /**
   * Load chat sessions from LocalStorage
   */
  private loadChatSessions(): void {
    try {
      const savedSessions = localStorage.getItem(this.STORAGE_KEY);
      console.log('Loading sessions from localStorage:', savedSessions);
      
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions) as ChatSession[];
        console.log('Parsed sessions:', parsedSessions);
        this.chatSessions.set(parsedSessions);
        
        // Set current session and active branch if exists
        const activeSession = parsedSessions.find(session => 
          session.branches.some(branch => branch.isActive)
        );
        console.log('Active session found:', activeSession);
        
        if (activeSession) {
          this.currentSession.set(activeSession);
          const activeBranch = activeSession.branches.find(branch => branch.isActive);
          this.currentBranch.set(activeBranch || null);
          console.log('Active branch set:', activeBranch);
        }
      } else {
        console.log('No saved sessions found in localStorage');
      }
    } catch (error) {
      console.error('Error loading chat sessions from LocalStorage:', error);
      this.setError({
        type: 'storage',
        message: 'خطا در بارگذاری جلسات چت از LocalStorage',
        retryable: true
      });
      this.chatSessions.set([]);
    }
  }

  /**
   * Save chat sessions to LocalStorage
   */
  private saveChatSessions(): void {
    try {
      const data = JSON.stringify(this.chatSessions());
      localStorage.setItem(this.STORAGE_KEY, data);
      this.clearError();
    } catch (error) {
      console.error('Error saving chat sessions to LocalStorage:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.setError({
          type: 'storage',
          message: 'فضای ذخیره‌سازی LocalStorage پر است. لطفاً برخی از جلسات قدیمی را پاک کنید.',
          retryable: false
        });
      } else {
        this.setError({
          type: 'storage',
          message: 'خطا در ذخیره‌سازی جلسات چت',
          retryable: true
        });
      }
      throw error;
    }
  }

  /**
   * Create a new chat session
   */
  createChatSession(title: string, initialMessages: MessageModel[] = []): ChatSession {
    const sessionId = this.generateUniqueId();
    const branchId = this.generateUniqueId();
    
    const initialBranch: Branch = {
      branchId,
      name: 'Branch 1',
      createdAt: new Date().toISOString(),
      isActive: true,
      messages: this.convertToBranchMessages(initialMessages)
    };

    const newSession: ChatSession = {
      id: sessionId,
      title,
      createdAt: new Date().toISOString(),
      branches: [initialBranch]
    };

    try {
      // Deactivate all other sessions
      this.deactivateAllBranches();
      
      this.chatSessions.update(sessions => [...sessions, newSession]);
      this.currentSession.set(newSession);
      this.currentBranch.set(initialBranch);
      this.saveChatSessions();
      
      return newSession;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  /**
   * Create a new branch from existing branch
   */
  createBranch(options: CreateBranchOptions): Observable<Branch> {
    try {
      const session = this.findSessionById(options.sessionId);
      if (!session) {
        return throwError(() => ({
          type: 'not_found',
          message: 'جلسه چت یافت نشد',
          retryable: false
        } as BranchingError));
      }

      const sourceBranch = session.branches.find(b => b.branchId === options.sourceBranchId);
      if (!sourceBranch) {
        return throwError(() => ({
          type: 'not_found',
          message: 'شاخه مبدأ یافت نشد',
          retryable: false
        } as BranchingError));
      }

      // Generate new branch
      const newBranchId = this.generateUniqueId();
      const branchNumber = session.branches.length + 1;
      const branchName = options.branchName || `Branch ${branchNumber}`;

      const newBranch: Branch = {
        branchId: newBranchId,
        name: branchName,
        createdAt: new Date().toISOString(),
        isActive: true,
        messages: this.deepCloneMessages(sourceBranch.messages),
        parentBranchId: sourceBranch.branchId
      };

      // Deactivate all branches in this session
      session.branches.forEach(branch => branch.isActive = false);
      
      // Add new branch
      session.branches.push(newBranch);
      
      // Update current references
      this.currentSession.set(session);
      this.currentBranch.set(newBranch);
      
      this.saveChatSessions();
      
      return of(newBranch);
    } catch (error) {
      console.error('Error creating branch:', error);
      return throwError(() => ({
        type: 'storage',
        message: 'خطا در ایجاد شاخه جدید',
        retryable: true
      } as BranchingError));
    }
  }

  /**
   * Switch to a different branch
   */
  switchToBranch(options: SwitchBranchOptions): Observable<Branch> {
    try {
      const session = this.findSessionById(options.sessionId);
      if (!session) {
        return throwError(() => ({
          type: 'not_found',
          message: 'جلسه چت یافت نشد',
          retryable: false
        } as BranchingError));
      }

      const targetBranch = session.branches.find(b => b.branchId === options.targetBranchId);
      if (!targetBranch) {
        return throwError(() => ({
          type: 'not_found',
          message: 'شاخه هدف یافت نشد',
          retryable: false
        } as BranchingError));
      }

      // Deactivate all branches in this session
      session.branches.forEach(branch => branch.isActive = false);
      
      // Activate target branch
      targetBranch.isActive = true;
      
      // Update current references
      this.currentSession.set(session);
      this.currentBranch.set(targetBranch);
      
      this.saveChatSessions();
      
      return of(targetBranch);
    } catch (error) {
      console.error('Error switching branch:', error);
      return throwError(() => ({
        type: 'storage',
        message: 'خطا در تغییر شاخه',
        retryable: true
      } as BranchingError));
    }
  }

  /**
   * Add message to current active branch
   */
  addMessageToCurrentBranch(messageInput: CreateMessageInput): void {
    const currentBranch = this.currentBranch();
    if (!currentBranch) {
      console.error('No active branch to add message to');
      return;
    }

    const branchMessage: BranchMessage = {
      id: this.generateUniqueId(),
      messageType: messageInput.messageType,
      content: messageInput.content,
      timestamp: new Date().toISOString(),
      userTokens: messageInput.userTokens,
      model: messageInput.model,
      order: currentBranch.messages.length + 1
    };

    currentBranch.messages.push(branchMessage);
    this.saveChatSessions();
  }

  /**
   * Get current active session
   */
  getCurrentSession(): Signal<ChatSession | null> {
    return this.currentSession.asReadonly();
  }

  /**
   * Get current active branch
   */
  getCurrentBranch(): Signal<Branch | null> {
    return this.currentBranch.asReadonly();
  }

  /**
   * Get all chat sessions
   */
  getChatSessions(): Signal<ChatSession[]> {
    return this.chatSessions.asReadonly();
  }

  /**
   * Get messages from current active branch
   */
  getCurrentBranchMessages(): BranchMessage[] {
    const currentBranch = this.currentBranch();
    return currentBranch ? currentBranch.messages.sort((a, b) => a.order - b.order) : [];
  }

  /**
   * Update messages in a specific branch
   */
  updateBranchMessages(branchId: string, updatedMessages: BranchMessage[]): boolean {
    try {
      // Find the session containing the branch
      const sessionIndex = this.chatSessions().findIndex(session => 
        session.branches.some(branch => branch.branchId === branchId)
      );
      
      if (sessionIndex === -1) {
        console.error('Session containing branch not found:', branchId);
        return false;
      }
      
      // Find the branch in the session
      const session = this.chatSessions()[sessionIndex];
      const branchIndex = session.branches.findIndex(branch => branch.branchId === branchId);
      
      if (branchIndex === -1) {
        console.error('Branch not found:', branchId);
        return false;
      }
      
      // Update the branch messages
      this.chatSessions.update(sessions => {
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex] = {
          ...updatedSessions[sessionIndex],
          branches: [
            ...updatedSessions[sessionIndex].branches.slice(0, branchIndex),
            {
              ...updatedSessions[sessionIndex].branches[branchIndex],
              messages: updatedMessages
            },
            ...updatedSessions[sessionIndex].branches.slice(branchIndex + 1)
          ]
        };
        return updatedSessions;
      });
      
      // Update current branch if it's the one being modified
      const currentBranch = this.currentBranch();
      if (currentBranch && currentBranch.branchId === branchId) {
        this.currentBranch.update(branch => {
          if (branch) {
            return {
              ...branch,
              messages: updatedMessages
            };
          }
          return branch;
        });
      }
      
      this.saveChatSessions();
      return true;
    } catch (error) {
      console.error('Error updating branch messages:', error);
      return false;
    }
  }

  /**
   * Get error state
   */
  getLastError(): Signal<BranchingError | null> {
    return this.lastError.asReadonly();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.lastError.set(null);
  }

  /**
   * Retry last failed operation
   */
  retryLastOperation(): void {
    this.clearError();
    this.loadChatSessions();
  }

  /**
   * Manually reload chat sessions from localStorage (for debugging)
   */
  reloadChatSessions(): void {
    console.log('Manually reloading chat sessions...');
    this.loadChatSessions();
  }

  // Private helper methods
  private findSessionById(sessionId: string): ChatSession | undefined {
    return this.chatSessions().find(session => session.id === sessionId);
  }

  private deactivateAllBranches(): void {
    this.chatSessions().forEach(session => {
      session.branches.forEach(branch => {
        branch.isActive = false;
      });
    });
  }

  private deepCloneMessages(messages: BranchMessage[]): BranchMessage[] {
    return messages.map(msg => ({
      id: this.generateUniqueId(), // Generate new ID for cloned message
      messageType: msg.messageType,
      content: msg.content,
      timestamp: msg.timestamp,
      userTokens: msg.userTokens,
      model: msg.model,
      order: msg.order
    }));
  }

  private convertToBranchMessages(messages: MessageModel[]): BranchMessage[] {
    return messages.map((msg, index) => ({
      id: this.generateUniqueId(),
      messageType: msg.messageType,
      content: msg.content,
      timestamp: new Date().toISOString(),
      userTokens: msg.userTokens,
      model: msg.model,
      order: index + 1
    }));
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private setError(error: BranchingError): void {
    this.lastError.set(error);
  }
}