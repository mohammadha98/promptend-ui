import { NgIf } from '@angular/common';
import { Component, Input, Signal, signal } from '@angular/core';
import { DialogService } from '../../../../shared/services/dialog.service';
import { RebuildModalComponent } from '../rebuild-modal/rebuild-modal.component';
import { MessageModel } from '../../models/message.model';

@Component({
  selector: 'app-message',
  imports: [NgIf],
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

  constructor(private dialogService: DialogService) {}

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
}
