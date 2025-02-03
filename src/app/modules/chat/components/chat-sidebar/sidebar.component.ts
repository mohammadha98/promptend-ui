import { NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, output } from '@angular/core';

@Component({
  selector: 'chat-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [ NgClass],
  styleUrls: ['./sidebar.component.scss'],
})
export class ChatSidebarComponent {
  isModelSectionExpanded: boolean = true;
  isRebuildSectionExpanded: boolean = true;

  toggleModelSection() {
    this.isModelSectionExpanded = !this.isModelSectionExpanded;
  }

  toggleRebuildSection() {
    this.isRebuildSectionExpanded = !this.isRebuildSectionExpanded;
  }

}
