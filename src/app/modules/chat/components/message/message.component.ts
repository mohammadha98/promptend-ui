import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [NgClass],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() type: 'sent' | 'received' = 'received';
  @Input() content: string = '';
}
