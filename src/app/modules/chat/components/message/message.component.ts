import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [NgIf],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() isUserMessage: boolean = false;
  @Input() userMessage: string = '';
  @Input() userTokens: number = 0;
  @Input() userModel: string = '';
  @Input() aiResponse: string = '';
}
