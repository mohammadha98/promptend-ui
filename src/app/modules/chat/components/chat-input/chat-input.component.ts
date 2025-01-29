import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  imports: [FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Output() sendMessage = new EventEmitter<string>();
 @ViewChild('inputMessaage') message!: ElementRef;

  onSubmit() {
    if(!this.message) return;
    this.sendMessage.emit(this.message.nativeElement.value as string);
    this.message.nativeElement.value = '';
  }
}
