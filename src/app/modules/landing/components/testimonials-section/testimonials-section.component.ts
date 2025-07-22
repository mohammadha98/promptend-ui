import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials-section',
  templateUrl: './testimonials-section.component.html',
  styleUrls: ['./testimonials-section.component.scss']
})
export class TestimonialsSectionComponent {
  // Testimonials data
  testimonials = [
    {
      quote: 'Prompt-End has completely transformed how I interact with AI. The ability to pause and branch conversations has made my research work so much more efficient.',
      author: 'Dr. Emily Chen',
      role: 'AI Researcher',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      quote: 'As a developer, I need to explore multiple solutions with AI. Prompt-End\'s branching feature lets me compare different approaches side by side. It\'s a game-changer!',
      author: 'Marcus Johnson',
      role: 'Senior Developer',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      quote: 'The collapse feature is brilliant for managing long conversations. I can focus on what matters without getting overwhelmed by walls of text.',
      author: 'Sophia Williams',
      role: 'Content Strategist',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
    },
    {
      quote: 'I use AI assistants daily for my work, and Prompt-End has boosted my productivity by at least 30%. The hierarchical organization of conversations is exactly what I needed.',
      author: 'James Rodriguez',
      role: 'Product Manager',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
    }
  ];
  
  // Stats data
  stats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '4.8/5', label: 'Average Rating' },
    { value: '30%', label: 'Productivity Boost' }
  ];
}