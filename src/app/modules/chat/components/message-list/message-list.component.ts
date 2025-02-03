import { Component, Input } from '@angular/core';
import { MessageModel } from '../../models/message.model';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-message-list',
  imports: [MessageComponent],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageListComponent {
  @Input() messages: MessageModel[] = [];

  
}
