import { Injectable, signal, WritableSignal, Signal } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';

/**
 * Interface for user messages stored in LocalStorage
 */
export interface UserMessage {
  id: string;
  content: string;
  conversationId: string;
  timestamp: string;
  order: number;
}

/**
 * Interface for rebuild progress tracking
 */
export interface RebuildProgress {
  current: number;
  total: number;
  status: 'idle' | 'rebuilding' | 'completed' | 'error';
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserMessagesService {
  private readonly STORAGE_KEY = 'userMessages';
  private userMessages: WritableSignal<UserMessage[]> = signal([]);
  private rebuildProgress: WritableSignal<RebuildProgress> = signal({
    current: 0,
    total: 0,
    status: 'idle'
  });

  constructor() {
    this.loadUserMessages();
  }

  /**
   * Load user messages from LocalStorage
   */
  private loadUserMessages(): void {
    try {
      const savedMessages = localStorage.getItem(this.STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as UserMessage[];
        this.userMessages.set(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading user messages from LocalStorage:', error);
      this.userMessages.set([]);
    }
  }

  /**
   * Save user messages to LocalStorage
   */
  private saveUserMessages(): void {
    try {
      const data = JSON.stringify(this.userMessages());
      localStorage.setItem(this.STORAGE_KEY, data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Consider clearing old messages.');
        // Optionally, you could implement automatic cleanup here
      } else {
        console.error('Error saving user messages to LocalStorage:', error);
      }
      throw error; // Re-throw to let calling code handle the error
    }
  }

  /**
   * Get all user messages as a readonly signal
   */
  getUserMessages(): Signal<UserMessage[]> {
    return this.userMessages.asReadonly();
  }

  /**
   * Get user messages for a specific conversation
   */
  getUserMessagesForConversation(conversationId: string): UserMessage[] {
    return this.userMessages().filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Add a new user message
   */
  addUserMessage(content: string, conversationId: string): UserMessage {
    const existingMessages = this.getUserMessagesForConversation(conversationId);
    const nextOrder = existingMessages.length > 0 
      ? Math.max(...existingMessages.map(m => m.order)) + 1 
      : 1;

    const newMessage: UserMessage = {
      id: this.generateUniqueId(),
      content: content.trim(),
      conversationId,
      timestamp: new Date().toISOString(),
      order: nextOrder
    };

    try {
      this.userMessages.update(messages => [...messages, newMessage]);
      this.saveUserMessages();
      return newMessage;
    } catch (error) {
      console.error('Error adding user message:', error);
      // Revert the in-memory changes if save failed
      this.loadUserMessages();
      throw error; // Re-throw to let calling code handle the error
    }
  }

  /**
   * Update an existing user message
   */
  updateUserMessage(messageId: string, newContent: string): boolean {
    try {
      const messages = this.userMessages();
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex === -1) {
        console.warn(`User message with ID '${messageId}' not found in LocalStorage`);
        return false;
      }

      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: newContent.trim(),
        timestamp: new Date().toISOString()
      };

      this.userMessages.set(updatedMessages);
      this.saveUserMessages();
      return true;
    } catch (error) {
      console.error('Error updating user message:', error);
      // Revert the in-memory changes if save failed
      this.loadUserMessages();
      return false;
    }
  }

  /**
   * Delete a user message
   */
  deleteUserMessage(messageId: string): boolean {
    const messages = this.userMessages();
    const filteredMessages = messages.filter(msg => msg.id !== messageId);
    
    if (filteredMessages.length === messages.length) {
      return false; // Message not found
    }

    this.userMessages.set(filteredMessages);
    this.saveUserMessages();
    return true;
  }

  /**
   * Clear all user messages for a conversation
   */
  clearConversationMessages(conversationId: string): void {
    const messages = this.userMessages();
    const filteredMessages = messages.filter(msg => msg.conversationId !== conversationId);
    this.userMessages.set(filteredMessages);
    this.saveUserMessages();
  }

  /**
   * Get rebuild progress signal
   */
  getRebuildProgress(): Signal<RebuildProgress> {
    return this.rebuildProgress.asReadonly();
  }

  /**
   * Update rebuild progress
   */
  updateRebuildProgress(progress: Partial<RebuildProgress>): void {
    this.rebuildProgress.update(current => ({ ...current, ...progress }));
  }

  /**
   * Reset rebuild progress
   */
  resetRebuildProgress(): void {
    this.rebuildProgress.set({
      current: 0,
      total: 0,
      status: 'idle'
    });
  }

  /**
   * Generate a unique ID for messages
   */
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Export user messages for backup
   */
  exportUserMessages(): string {
    return JSON.stringify(this.userMessages(), null, 2);
  }

  /**
   * Import user messages from backup
   */
  importUserMessages(jsonData: string): boolean {
    try {
      const importedMessages = JSON.parse(jsonData) as UserMessage[];
      
      // Validate the structure
      if (!Array.isArray(importedMessages)) {
        throw new Error('Invalid data format');
      }

      for (const msg of importedMessages) {
        if (!msg.id || !msg.content || !msg.conversationId || !msg.timestamp) {
          throw new Error('Invalid message structure');
        }
      }

      this.userMessages.set(importedMessages);
      this.saveUserMessages();
      return true;
    } catch (error) {
      console.error('Error importing user messages:', error);
      return false;
    }
  }
}