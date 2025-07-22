import { Component } from '@angular/core';

@Component({
  selector: 'app-cta-section',
  templateUrl: './cta-section.component.html',
  styleUrls: ['./cta-section.component.scss']
})
export class CtaSectionComponent {
  // CTA data
  ctaData = {
    title: 'Ready to Transform Your AI Chat Experience?',
    subtitle: 'Install Prompt-End now and start enjoying more productive, organized, and insightful conversations with AI.',
    primaryButtonText: 'Install Extension',
    primaryButtonLink: 'https://chrome.google.com/webstore', // Replace with actual extension store link
    secondaryButtonText: 'Learn More',
    secondaryButtonLink: '#features',
    browserIcons: [
      {
        name: 'Chrome',
        icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-5.5-7a7 7 0 0 1 5.5-5.5v5.5H6.5zm5.5 2.5H9.67a7 7 0 0 0 4.33 2.5v-2.5zm0-2.5V6.5a7 7 0 0 1 5.5 5.5H12z'
      },
      {
        name: 'Firefox',
        icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-3-7a3 3 0 1 1 6 0 3 3 0 0 1-6 0z'
      },
      {
        name: 'Edge',
        icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-3-7a3 3 0 1 1 6 0 3 3 0 0 1-6 0z'
      }
    ]
  };
}