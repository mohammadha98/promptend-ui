import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.scss']
})
export class FeaturesSectionComponent {
  // Features data
  features = [
    {
      title: 'Pause & Resume Conversations',
      description: 'Take control of your AI interactions by pausing conversations mid-stream and resuming them when you\'re ready.',
      icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      title: 'Hierarchical Snapshots',
      description: 'Create and organize conversation snapshots in a hierarchical structure for better organization and retrieval.',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      title: 'Conversation Branching',
      description: 'Explore different conversation paths by creating branches from any point in your chat history.',
      icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
    },
    {
      title: 'Navigate Mode',
      description: 'Replay and review your conversations with a specialized navigate mode that provides context and insights.',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
    },
    {
      title: 'Collapse & Expand Messages',
      description: 'Reduce cognitive load by collapsing lengthy messages and expanding them only when needed.',
      icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4'
    },
    {
      title: 'Seamless Integration',
      description: 'Works directly within your favorite LLM chat interfaces with no additional setup required.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    }
  ];
}