import { Component, Input, Signal, signal } from '@angular/core';
import { MessageModel } from '../../models/message.model';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-message-list',
  imports: [MessageComponent],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent {
  @Input() messages: { 
    messageType: Signal<'user' | 'ai'>, 
    content: Signal<string>, 
    userTokens: Signal<number>, 
    model: Signal<string> 
  }[] = [];

}
