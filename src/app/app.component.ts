import { Component } from '@angular/core';
import { ChatComponent } from './modules/chat/components/chat/chat.component';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'promptend';
}
