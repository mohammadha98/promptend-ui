import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private readonly DARK_THEME = 'dark';
  private readonly LIGHT_THEME = 'light';

  public isDarkMode: BehaviorSubject<boolean>;

  constructor() {
    // Initialize theme from localStorage or default to system preference
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial value based on saved preference or system preference
    const initialDarkMode = savedTheme === this.DARK_THEME || 
      (savedTheme === null && prefersDark);
    
    this.isDarkMode = new BehaviorSubject<boolean>(initialDarkMode);
    
    // Apply theme on service initialization
    this.applyTheme(initialDarkMode);
  }

  /**
   * Enable dark mode
   */
  public enableDark(): void {
    this.isDarkMode.next(true);
    this.saveTheme(true);
    this.applyTheme(true);
  }

  /**
   * Enable light mode
   */
  public enableLight(): void {
    this.isDarkMode.next(false);
    this.saveTheme(false);
    this.applyTheme(false);
  }

  /**
   * Toggle between dark and light mode
   */
  public toggleTheme(): void {
    const newDarkModeValue = !this.isDarkMode.value;
    this.isDarkMode.next(newDarkModeValue);
    this.saveTheme(newDarkModeValue);
    this.applyTheme(newDarkModeValue);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(isDark: boolean): void {
    localStorage.setItem(this.THEME_KEY, isDark ? this.DARK_THEME : this.LIGHT_THEME);
  }

  /**
   * Apply theme by adding or removing 'dark' class from document.documentElement
   */
  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}