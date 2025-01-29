import { NgFor } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  imports: [ChatInputComponent, MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {

  constructor(private chatservice:ChatService) {}
  messages: any[] = [
    {
      type: 'received',
      content: 'Hello! How can I assist you today? 😊'
    },
    {
      type: 'sent',
      content: 'Hi! Can you help me with Tailwind CSS?'
    }
  ];

  handleSendMessage(messageContent: any) {
    console.log("chat cmp :",messageContent);

    if (messageContent.trim()) {
      this.messages.push({
        type: 'sent',
        content: messageContent
      });

      // Send the message to the chat server
       this.chatservice.sendMessage(messageContent,).subscribe(response => {
        console.log(response);
        
       });

    }
  }
}
