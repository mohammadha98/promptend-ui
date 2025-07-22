import { NgIf, NgFor, SlicePipe } from '@angular/common';
import { Component, Input, Signal, signal, WritableSignal, inject, ElementRef, ViewChild, HostListener, Output, EventEmitter } from '@angular/core';
import { DialogService } from '../../../../shared/services/dialog.service';
import { RebuildModalComponent } from '../rebuild-modal/rebuild-modal.component';
import { DiffSpan, MessageModel, ExplainBlock } from '../../models/message.model';
import { DiffService } from '../../../../shared/services/diff.service';
import { AIChatService } from '../../services/ai.chat.service';
import { UserMessagesService } from '../../services/user-messages.service';
import { NavigateModeService } from '../../services/navigate-mode.service';
import { HighlightSpansPipe } from '../../pipes/highlight-spans.pipe';

@Component({
  selector: 'app-message',
  imports: [NgIf, NgFor, SlicePipe, HighlightSpansPipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() messageType: Signal<'user' | 'ai'> = signal('user');
  @Input() content: Signal<string> = signal('');
  @Input() userTokens: Signal<number> = signal(0);
  @Input() model: Signal<string> = signal('');
  @Input() messageId: Signal<string> = signal('');
  @Input() conversationId: Signal<string> = signal('');
  @Input() isNavigateModeActive: boolean = false;
  @Input() set isCollapsed(value: boolean) {
    // Update the message collapse state when input changes
    this.message.update(current => ({...current, isCollapsed: value}));
  }
  
  @Output() messageEdited = new EventEmitter<{ messageId: string; newContent: string }>();
  @Output() toggleCollapse = new EventEmitter<{ messageId: string, isCollapsed: boolean }>();

  // Local state for editing
  isEditing: WritableSignal<boolean> = signal(false);
  editedText: WritableSignal<string> = signal('');
  diffSpans: WritableSignal<DiffSpan[]> = signal([]);

  // Local state for explanations
  explanations: WritableSignal<ExplainBlock[]> = signal([]);
  showContextMenu: WritableSignal<boolean> = signal(false);
  contextMenuPosition: WritableSignal<{ x: number; y: number }> = signal({ x: 0, y: 0 });
  selectedText: WritableSignal<string> = signal('');
  selectedRange: WritableSignal<{ startOffset: number; endOffset: number } | null> = signal(null);

  @ViewChild('messageText', { static: false }) messageTextRef!: ElementRef;

  private diffService = inject(DiffService);
  private chatService = inject(AIChatService);
  private userMessagesService = inject(UserMessagesService);

  constructor(
    private dialogService: DialogService,
    private navigateModeService: NavigateModeService
  ) {
    // Initialize the message object
    this.message.update(current => ({
      ...current,
      id: '',
      messageType: this.messageType(),
      content: this.content(),
      userTokens: this.userTokens(),
      model: this.model(),
      isCollapsed: false
    }));
  }
  
  ngOnInit(): void {
    // Update the message object when inputs change
    this.updateMessageFromInputs();
  }
  
  ngOnChanges(): void {
    // Update the message object when inputs change
    this.updateMessageFromInputs();
  }
  
  private updateMessageFromInputs(): void {
    const messageId = this.messageId();
    
    // Get the collapse state from the service if available
    const isCollapsed = messageId ? 
      this.navigateModeService.getMessageCollapseState(messageId) : 
      false;
    
    this.message.update(current => ({
      ...current,
      id: messageId,
      messageType: this.messageType(),
      content: this.content(),
      userTokens: this.userTokens(),
      model: this.model(),
      isCollapsed: isCollapsed
    }));
  }

  onRebuildMessage(): void {
    this.dialogService.open(RebuildModalComponent, {
      data: {
        conversationId: this.conversationId(),
        messageId: this.messageId(),
        initialPrompt: this.content()
      }
    }).afterClosed().subscribe((newConv: MessageModel[]) => {
      if (newConv?.length) {
        // The conversation has been rebuilt
        // The parent component should handle the update
        console.log('Conversation rebuilt:', newConv);
      }
    });
  }

  /**
   * Start editing the message
   */
  startEdit(): void {
    if (this.messageType() === 'user') {
      this.isEditing.set(true);
      this.editedText.set(this.content());
    }
  }

  /**
   * Handle text changes in the textarea
   */
  onTextChange(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.editedText.set(text);
  }

  /**
   * Apply the edited text and update LocalStorage
   */
  applyEdit(): void { 
    const originalText = this.content();
    const newText = this.editedText().trim();
    
    // Don't apply if text is empty or unchanged
    if (!newText || newText === originalText) {
      this.dismissEdit();
      return;
    }
    
    // Calculate the difference between original and edited text
    const diffResult = this.diffService.computeWordDiff(originalText, newText);
    this.diffSpans.set(diffResult);
    
    // Only update LocalStorage for user messages
    if (this.messageType() === 'user') {
      const success = this.userMessagesService.updateUserMessage(this.messageId(), newText);
      
      if (success) {
        console.log('Message updated successfully in LocalStorage');
      } else {
        console.warn('Message not found in LocalStorage - this may be expected for older messages');
      }
    }
    
    // Always emit event to parent component for UI updates
    this.messageEdited.emit({
      messageId: this.messageId(),
      newContent: newText
    });
    
    // Exit editing mode
    this.isEditing.set(false);
  }

  /**
   * Dismiss the edit and revert to original text
   */
  dismissEdit(): void {
    this.isEditing.set(false);
    this.editedText.set(this.content());
  }

  /**
   * Prevent default context menu
   */
  onContextMenu(event: Event) {
    event.preventDefault();
    return false;
  }

  /**
   * Handle text selection in AI messages
   */
  onTextSelection(): void {
    if (this.messageType() !== 'ai') return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.hideContextMenu();
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    if (selectedText.length === 0) {
      this.hideContextMenu();
      return;
    }

    // Check if selection is within this message
    const messageElement = this.messageTextRef?.nativeElement;
    if (!messageElement || !messageElement.contains(range.commonAncestorContainer)) {
      this.hideContextMenu();
      return;
    }

    // Calculate text offsets
    const textContent = messageElement.textContent || '';
    const startOffset = this.getTextOffset(messageElement, range.startContainer, range.startOffset);
    const endOffset = startOffset + selectedText.length;

    // Store selection data
    this.selectedText.set(selectedText);
    this.selectedRange.set({ startOffset, endOffset });

    // Position context menu
    const rect = range.getBoundingClientRect();
    this.contextMenuPosition.set({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5
    });

    this.showContextMenu.set(true);
  }

  /**
   * Calculate text offset within an element
   */
  private getTextOffset(root: Node, node: Node, offset: number): number {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent?.length || 0;
    }

    return textOffset;
  }

  /**
   * Hide context menu
   */
  hideContextMenu(): void {
    this.showContextMenu.set(false);
    this.selectedText.set('');
    this.selectedRange.set(null);
  }

  /**
   * Start explanation for selected text
   */
  startExplain(): void {
    const selectedText = this.selectedText();
    const selectedRange = this.selectedRange();

    if (!selectedText || !selectedRange) return;

    // Create new explanation block
    const explainBlock: ExplainBlock = {
      id: this.generateUniqueId(),
      range: selectedRange,
      promptText: selectedText,
      isCollapsed: false,
      loading: true
    };

    // Add to explanations
    this.explanations.update(current => [...current, explainBlock]);

    // Hide context menu
    this.hideContextMenu();

    // Clear selection
    window.getSelection()?.removeAllRanges();

    // Request explanation from AI
    this.chatService.explainText(this.messageId(), selectedText).subscribe({
      next: (explanation) => {
        // Update the explanation block
        this.explanations.update(current => 
          current.map(block => 
            block.id === explainBlock.id 
              ? { ...block, content: explanation, loading: false }
              : block
          )
        );
      },
      error: (error) => {
        console.error('Error getting explanation:', error);
        // Update with error message
        this.explanations.update(current => 
          current.map(block => 
            block.id === explainBlock.id 
              ? { ...block, content: 'Sorry, I couldn\'t generate an explanation. Please try again.', loading: false }
              : block
          )
        );
      }
    });
  }

  /**
   * Toggle explanation collapse state
   */
  toggleExplain(block: ExplainBlock): void {
    this.explanations.update(current => 
      current.map(item => 
        item.id === block.id 
          ? { ...item, isCollapsed: !item.isCollapsed }
          : item
      )
    );
  }

  /**
   * Remove an explanation block
   */
  removeExplanation(blockId: string): void {
    this.explanations.update(current => 
      current.filter(block => block.id !== blockId)
    );
  }

  /**
   * Generate unique ID
   */
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Handle clicks outside context menu
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showContextMenu()) {
      this.hideContextMenu();
    }
  }
  
  // Local state for message collapse
  message: WritableSignal<MessageModel> = signal({
    id: '',
    messageType: 'user',
    content: '',
    userTokens: 0,
    model: '',
    isCollapsed: false
  });

  /**
   * Toggle message collapse state
   */
  onToggleCollapse(): void {
    if (!this.messageId()) return;
    
    const newState = !this.message().isCollapsed;
    this.message.update(current => ({...current, isCollapsed: newState}));
    this.toggleCollapse.emit({
      messageId: this.messageId(),
      isCollapsed: newState
    });
  }
  
  /**
   * Get preview text for collapsed message
   */
  getMessagePreview(): string {
    return this.navigateModeService.getMessagePreview(this.content());
  }

  /**
   * Handle escape key
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showContextMenu()) {
      this.hideContextMenu();
    }
  }
}
