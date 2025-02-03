import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Output() sendMessage = new EventEmitter<string>();
  message: string = '';

  onSubmit() {
    if (!this.message.trim()) return;
    this.sendMessage.emit(this.message);
    this.message = '';
  }
}
