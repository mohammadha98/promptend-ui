import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, Signal } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme.service';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { NavigateModeService } from '../../services/navigate-mode.service';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [NgClass, AsyncPipe, NgIf, IconComponent],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent implements OnInit {
  isSidebarVisible: boolean = true;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  @Output() toggleNavigateMode = new EventEmitter<boolean>();
  
  isNavigateModeActive: Signal<boolean>;

  constructor(
    public themeService: ThemeService,
    private navigateModeService: NavigateModeService
  ) {
    this.isNavigateModeActive = this.navigateModeService.getNavigateModeState();
  }

  ngOnInit(): void {
    // Subscribe to theme changes if needed for additional logic
  }

  onToggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.toggleSidebar.emit(this.isSidebarVisible);
  }
  
  onToggleNavigateMode() {
    const newState = this.navigateModeService.toggleNavigateMode();
    this.toggleNavigateMode.emit(newState);
  }

}
