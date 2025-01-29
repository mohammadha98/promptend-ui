import { NgFor } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

@Component({
  selector: 'app-chat',
  imports: [ChatInputComponent, MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
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

  handleSendMessage(messageContent: string) {
    if (messageContent.trim()) {
      this.messages.push({
        type: 'sent',
        content: messageContent
      });

      // اینجا می‌توانید منطق ارسال پیام به سرور یا پاسخ ربات را اضافه کنید
    }
  }
}
