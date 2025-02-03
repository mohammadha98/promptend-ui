import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-chat-header',
  imports: [NgClass],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  isSidebarVisible: boolean = true;
 @Output() toggleSidebar = new EventEmitter<boolean>();

  onToggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.toggleSidebar.emit(this.isSidebarVisible);
  }

}
