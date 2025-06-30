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
  @Input() conversationId: Signal<string> = signal('');
  @Input() messages: { 
    messageType: Signal<'user' | 'ai'>, 
    content: Signal<string>, 
    userTokens: Signal<number>, 
    model: Signal<string>,
    id?: Signal<string>
  }[] = [
    {
      messageType: signal<'user' | 'ai'>('user'),
      content: signal('Hello, how can I create a new Angular component?'),
      userTokens: signal(15),
      model: signal('')
    },
    {
      messageType: signal<'user' | 'ai'>('ai'),
      content: signal('You can create a new component using the Angular CLI command: `ng generate component component-name`'),
      userTokens: signal(30),
      model: signal('GPT-3.5')
    }
  ];

  getMessageId(message: any, index: number): Signal<string> {
    return message.id || signal('msg-' + index);
  }
}
