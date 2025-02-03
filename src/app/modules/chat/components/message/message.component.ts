import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [NgIf],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() messageType: 'user' | 'ai' = 'user';
  @Input() content: string = '';
  @Input() userTokens: number = 0;
  @Input() model: string = '';
}
