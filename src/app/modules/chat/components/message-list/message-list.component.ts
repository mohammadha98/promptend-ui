import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-message-list',
  imports: [NgFor, MessageComponent],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss'
})
export class MessageListComponent {
  @Input() messages: { isUserMessage: boolean, userMessage: string, userTokens: number, userModel: string, aiResponse: string }[] = [];

}
