import { Injectable, signal, WritableSignal, Signal } from '@angular/core';
import { MessageModel } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class NavigateModeService {
  // Global state for navigate mode
  private isNavigateModeActive: WritableSignal<boolean> = signal(false);
  
  // Track message collapse states
  private messageCollapseStates = new Map<string, boolean>();

  constructor() {}

  /**
   * Toggle navigate mode state
   * @param forceState Optional parameter to force a specific state
   * @returns The new state after toggling
   */
  toggleNavigateMode(forceState?: boolean): boolean {
    const newState = forceState !== undefined ? forceState : !this.isNavigateModeActive();
    this.isNavigateModeActive.set(newState);
    return newState;
  }

  /**
   * Get the current navigate mode state
   * @returns Signal with the current navigate mode state
   */
  getNavigateModeState(): Signal<boolean> {
    return this.isNavigateModeActive.asReadonly();
  }

  /**
   * Collapse all messages
   * @param messages Array of messages to collapse
   * @returns Updated array with all messages collapsed
   */
  collapseAllMessages(messages: MessageModel[]): MessageModel[] {
    return messages.map(message => ({
      ...message,
      isCollapsed: true
    }));
  }

  /**
   * Expand all messages
   * @param messages Array of messages to expand
   * @returns Updated array with all messages expanded
   */
  expandAllMessages(messages: MessageModel[]): MessageModel[] {
    return messages.map(message => ({
      ...message,
      isCollapsed: false
    }));
  }

  /**
   * Toggle collapse state for a specific message
   * @param messageId ID of the message to toggle
   * @param forceState Optional parameter to force a specific state
   * @returns The new collapse state
   */
  toggleMessageCollapse(messageId: string, forceState?: boolean): boolean {
    // Determine the new state
    const currentState = this.messageCollapseStates.get(messageId) || false;
    const newState = forceState !== undefined ? forceState : !currentState;
    
    // Update the state in our map
    this.messageCollapseStates.set(messageId, newState);
    
    return newState;
  }
  
  /**
   * Get the collapse state for a specific message
   * @param messageId ID of the message
   * @returns The current collapse state
   */
  getMessageCollapseState(messageId: string): boolean {
    return this.messageCollapseStates.get(messageId) || false;
  }
  
  /**
   * Set collapse state for all tracked messages
   * @param isCollapsed The collapse state to set
   */
  setAllMessagesCollapseState(isCollapsed: boolean): void {
    // Update all message states
    for (const messageId of this.messageCollapseStates.keys()) {
      this.messageCollapseStates.set(messageId, isCollapsed);
    }
  }

  /**
   * Get preview text for a collapsed message
   * @param content Full message content
   * @param maxLength Maximum length of preview text (default: 50)
   * @returns Truncated preview text with ellipsis
   */
  getMessagePreview(content: string, maxLength: number = 50): string {
    if (!content) return '';
    
    // If content is shorter than maxLength, return it as is
    if (content.length <= maxLength) return content;
    
    // Try to find the first period within the maxLength
    const periodIndex = content.substring(0, maxLength).lastIndexOf('.');
    
    // If a period is found, truncate at that point
    if (periodIndex > 0) {
      return content.substring(0, periodIndex + 1) + '...';
    }
    
    // Otherwise, truncate at maxLength
    return content.substring(0, maxLength) + '...';
  }
}