import { Component, OnInit } from '@angular/core';
import { ChatComponent } from './modules/chat/components/chat/chat.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // ThemeService is initialized and will apply the correct theme
  }
  title = 'promptend';
}
