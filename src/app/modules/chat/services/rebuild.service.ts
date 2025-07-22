import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, from, of, throwError, EMPTY, concat } from 'rxjs';
import { catchError, map, tap, delay, switchMap, finalize } from 'rxjs/operators';
import { AIChatService } from './ai.chat.service';
import { UserMessagesService, UserMessage, RebuildProgress } from './user-messages.service';
import { MessageModel } from '../models/message.model';

/**
 * Interface for rebuild options
 */
export interface RebuildOptions {
  conversationId: string;
  preserveIntent?: boolean;
  aggressiveness?: 'conservative' | 'balanced' | 'aggressive';
  mode?: 'manual' | 'auto-optimize' | 'branch-preview';
}

/**
 * Interface for rebuild result
 */
export interface RebuildResult {
  success: boolean;
  messages: MessageModel[];
  errorMessage?: string;
  completedCount: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class RebuildService {
  private isRebuilding: WritableSignal<boolean> = signal(false);
  private rebuildResults: WritableSignal<MessageModel[]> = signal([]);

  constructor(
    private aiChatService: AIChatService,
    private userMessagesService: UserMessagesService
  ) {}

  /**
   * Get rebuilding status
   */
  getIsRebuilding() {
    return this.isRebuilding.asReadonly();
  }

  /**
   * Get rebuild results
   */
  getRebuildResults() {
    return this.rebuildResults.asReadonly();
  }

  /**
   * Start the rebuild process for a conversation
   */
  rebuildConversation(options: RebuildOptions): Observable<RebuildResult> {
    if (this.isRebuilding()) {
      return throwError(() => new Error('Rebuild already in progress'));
    }

    // Get user messages for the conversation
    const userMessages = this.userMessagesService.getUserMessagesForConversation(options.conversationId);
    
    if (userMessages.length === 0) {
      return throwError(() => new Error('No user messages found for this conversation'));
    }

    // Initialize rebuild state
    this.isRebuilding.set(true);
    this.rebuildResults.set([]);
    this.userMessagesService.updateRebuildProgress({
      current: 0,
      total: userMessages.length,
      status: 'rebuilding'
    });

    // Create a new conversation for the rebuild process
    const firstMessage = userMessages[0];
    return this.aiChatService.addConversation(`Rebuilt: ${firstMessage.content.substring(0, 50)}...`).pipe(
      switchMap(newConversation => {
        // Update options with new conversation ID for the rebuild
        const rebuildOptions = {
          ...options,
          conversationId: newConversation.id
        };
        
        // Process messages sequentially in the new conversation
        return this.processMessagesSequentially(userMessages, rebuildOptions);
      }),
      finalize(() => {
        this.isRebuilding.set(false);
      })
    );
  }

  /**
   * Process user messages sequentially to rebuild conversation
   */
  private processMessagesSequentially(
    userMessages: UserMessage[], 
    options: RebuildOptions
  ): Observable<RebuildResult> {
    const results: MessageModel[] = [];
    let currentIndex = 0;

    const processNext = (): Observable<RebuildResult> => {
      if (currentIndex >= userMessages.length) {
        // All messages processed successfully
        this.userMessagesService.updateRebuildProgress({
          current: userMessages.length,
          total: userMessages.length,
          status: 'completed'
        });
        
        return of({
          success: true,
          messages: results,
          completedCount: userMessages.length,
          totalCount: userMessages.length
        });
      }

      const currentMessage = userMessages[currentIndex];
      
      // Update progress
      this.userMessagesService.updateRebuildProgress({
        current: currentIndex + 1,
        total: userMessages.length,
        status: 'rebuilding'
      });

      // Add user message to results
      const userMessageModel: MessageModel = {
        id: currentMessage.id,
        messageType: 'user',
        content: currentMessage.content,
        userTokens: this.estimateTokens(currentMessage.content),
        model: ''
      };
      results.push(userMessageModel);

      // Send message to AI and get response
      return this.aiChatService.sendMessage(currentMessage.content, options.conversationId).pipe(
        tap(aiResponse => {
          // Add AI response to results
          const aiMessageModel: MessageModel = {
            id: this.generateUniqueId(),
            messageType: 'ai',
            content: aiResponse.content,
            userTokens: aiResponse.userTokens,
            model: aiResponse.model
          };
          results.push(aiMessageModel);
          
          // Update rebuild results signal
          this.rebuildResults.set([...results]);
        }),
        delay(500), // Small delay between requests to avoid rate limiting
        switchMap(() => {
          currentIndex++;
          return processNext();
        }),
        catchError(error => {
          console.error(`Error processing message ${currentIndex + 1}:`, error);
          
          // Update progress with error
          this.userMessagesService.updateRebuildProgress({
            current: currentIndex + 1,
            total: userMessages.length,
            status: 'error',
            errorMessage: `Failed at message ${currentIndex + 1}: ${error.message}`
          });

          // Return partial results with error
          return of({
            success: false,
            messages: results,
            errorMessage: error.message,
            completedCount: currentIndex,
            totalCount: userMessages.length
          });
        })
      );
    };

    return processNext();
  }

  /**
   * Cancel ongoing rebuild process
   */
  cancelRebuild(): void {
    if (this.isRebuilding()) {
      this.isRebuilding.set(false);
      this.userMessagesService.updateRebuildProgress({
        status: 'idle',
        errorMessage: 'Rebuild cancelled by user'
      });
    }
  }

  /**
   * Retry rebuild from a specific message index
   */
  retryRebuildFrom(options: RebuildOptions, fromIndex: number): Observable<RebuildResult> {
    const userMessages = this.userMessagesService.getUserMessagesForConversation(options.conversationId);
    
    if (fromIndex < 0 || fromIndex >= userMessages.length) {
      return throwError(() => new Error('Invalid retry index'));
    }

    // Get messages from the retry point
    const remainingMessages = userMessages.slice(fromIndex);
    
    // Update options for retry
    const retryOptions: RebuildOptions = {
      ...options,
      conversationId: options.conversationId
    };

    return this.processMessagesSequentially(remainingMessages, retryOptions);
  }

  /**
   * Clear rebuild results
   */
  clearRebuildResults(): void {
    this.rebuildResults.set([]);
    this.userMessagesService.resetRebuildProgress();
  }

  /**
   * Estimate tokens in text (simple approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate unique ID
   */
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Validate rebuild options
   */
  private validateRebuildOptions(options: RebuildOptions): boolean {
    if (!options.conversationId) {
      return false;
    }
    
    const validModes = ['manual', 'auto-optimize', 'branch-preview'];
    if (options.mode && !validModes.includes(options.mode)) {
      return false;
    }
    
    const validAggressiveness = ['conservative', 'balanced', 'aggressive'];
    if (options.aggressiveness && !validAggressiveness.includes(options.aggressiveness)) {
      return false;
    }
    
    return true;
  }

  /**
   * Get rebuild statistics
   */
  getRebuildStatistics(conversationId: string): {
    totalUserMessages: number;
    estimatedTokens: number;
    estimatedDuration: string;
  } {
    const userMessages = this.userMessagesService.getUserMessagesForConversation(conversationId);
    const totalTokens = userMessages.reduce((sum, msg) => sum + this.estimateTokens(msg.content), 0);
    
    // Estimate duration (rough calculation: ~2 seconds per message)
    const estimatedSeconds = userMessages.length * 2;
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    const estimatedDuration = minutes > 0 
      ? `${minutes}m ${seconds}s` 
      : `${seconds}s`;

    return {
      totalUserMessages: userMessages.length,
      estimatedTokens: totalTokens,
      estimatedDuration
    };
  }
}