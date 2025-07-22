import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIChatService } from '../../services/ai.chat.service';
import { MessageModel } from '../../models/message.model';
import { DialogRef } from '../../../../shared/services/dialog.service';

export interface RebuildModalData {
  conversationId: string;
  messageId: string;
  initialPrompt: string;
}

@Component({
  selector: 'app-rebuild-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rebuild-modal.component.html',
  styleUrl: './rebuild-modal.component.scss'
})
export class RebuildModalComponent implements OnInit {
  editedPrompt = signal('');
  isLoading = signal(false);
  errorMsg = signal('');
  
  // These will be injected by the DialogService
  data!: RebuildModalData;
  dialogRef!: DialogRef;
  
  constructor(private chatService: AIChatService) {}
  
  ngOnInit(): void {
    if (this.data?.initialPrompt) {
      this.editedPrompt.set(this.data.initialPrompt);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onRebuild(): void {
    if (!this.editedPrompt().trim()) {
      this.errorMsg.set('please enter prompt content...')
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    this.chatService
      .rebuildConversationFrom(
        this.data.conversationId,
        this.data.messageId,
        this.editedPrompt().trim()
      )
      .subscribe({
        next: (newConv: MessageModel[]) => {
          this.isLoading.set(false);
          this.dialogRef.close(newConv);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMsg.set(err.message || "Error On Rebuilding Conversation");
        }
      });
  }

  onPromptChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.editedPrompt.set(target.value);
  }
}