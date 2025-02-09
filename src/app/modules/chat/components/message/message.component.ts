import { NgIf } from '@angular/common';
import { Component, Input, Signal, signal } from '@angular/core';

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
}
