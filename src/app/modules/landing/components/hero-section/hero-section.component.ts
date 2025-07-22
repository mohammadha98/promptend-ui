import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  // Hero section data
  heroData = {
    title: 'Supercharge Your LLM Conversations',
    subtitle: 'Prompt-End is a browser extension that enhances your interaction with AI chat interfaces like ChatGPT through powerful conversation management tools.',
    ctaText: 'Install Now',
    ctaLink: '#install',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '#features',
    webVersionText: 'Try our web version with even more features in the Playground',
    webVersionLink: '/chat'
  };
}