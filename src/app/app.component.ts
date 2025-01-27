import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './modules/chat/components/chat/chat.component';
import { SidebarComponent } from './modules/chat/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'promptend';
}
