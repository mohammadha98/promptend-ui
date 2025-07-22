import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, output, signal, computed } from '@angular/core';
import { RebuildService } from '../../services/rebuild.service';
import { UserMessagesService } from '../../services/user-messages.service';

@Component({
  selector: 'chat-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [NgClass, NgIf],
  styleUrls: ['./sidebar.component.scss'],
})
export class ChatSidebarComponent {
  @Input() conversationId: string | undefined;
  @Output() rebuildRequested = new EventEmitter<{
    preserveIntent: boolean;
    aggressiveness: 'conservative' | 'balanced' | 'aggressive';
  }>();

  isModelSectionExpanded: boolean = false;
  isRebuildSectionExpanded: boolean = false;
  isOptimizationSectionExpanded: boolean = false;

  // Rebuild options
  preserveIntent = signal(true);
  aggressiveness = signal<'conservative' | 'balanced' | 'aggressive'>('balanced');

  constructor(
    private rebuildService: RebuildService,
    private userMessagesService: UserMessagesService
  ) {}

  toggleModelSection() {
    this.isModelSectionExpanded = !this.isModelSectionExpanded;
  }

  toggleRebuildSection() {
    this.isRebuildSectionExpanded = !this.isRebuildSectionExpanded;
  }

  toggleOptimizationSection() {
    this.isOptimizationSectionExpanded = !this.isOptimizationSectionExpanded;
  }

  /**
   * Get rebuild status
   */
  get isRebuilding() {
    return this.rebuildService.getIsRebuilding();
  }

  /**
   * Get rebuild progress
   */
  rebuildProgress = computed(() => {
    return this.userMessagesService.getRebuildProgress();
  });

  /**
   * Get user messages count for current conversation
   */
  get userMessagesCount() {
    if (!this.conversationId) return 0;
    return this.userMessagesService.getUserMessagesForConversation(this.conversationId).length;
  }

  /**
   * Check if rebuild is possible
   */
  get canRebuild() {
    return this.conversationId && this.userMessagesCount > 0 && !this.isRebuilding();
  }

  /**
   * Get rebuild button text
   */
  get rebuildButtonText() {
    if (this.isRebuilding()) {
      const progress = this.rebuildProgress();
      if (progress) {
        return `Rebuilding ${progress().current}/${progress().total}`;
      }
      return 'Rebuilding...';
    }
    return 'Rebuild Thread';
  }

  /**
   * Handle rebuild button click
   */
  onRebuildClick() {
    if (!this.canRebuild) return;

    this.rebuildRequested.emit({
      preserveIntent: this.preserveIntent(),
      aggressiveness: this.aggressiveness()
    });
  }

  /**
   * Handle cancel rebuild
   */
  onCancelRebuild() {
    this.rebuildService.cancelRebuild();
  }

  /**
   * Set preserve intent option
   */
  setPreserveIntent(value: boolean) {
    this.preserveIntent.set(value);
  }

  /**
   * Set aggressiveness option
   */
  setAggressiveness(value: 'conservative' | 'balanced' | 'aggressive') {
    this.aggressiveness.set(value);
  }
}
