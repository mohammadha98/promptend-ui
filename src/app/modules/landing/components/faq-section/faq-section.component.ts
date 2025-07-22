import { Component } from '@angular/core';

@Component({
  selector: 'app-faq-section',
  templateUrl: './faq-section.component.html',
  styleUrls: ['./faq-section.component.scss']
})
export class FaqSectionComponent {
  // FAQ data
  faqs = [
    {
      question: 'What is Prompt-End?',
      answer: 'Prompt-End is a browser extension designed for LLM-based chat interfaces like ChatGPT. It enhances your AI conversation experience by providing features such as pausing/resuming conversations, hierarchical snapshots, branching capabilities, navigate mode, and message collapsing/expanding.',
      isOpen: true
    },
    {
      question: 'Which chat platforms does Prompt-End support?',
      answer: 'Prompt-End currently supports major LLM-based chat interfaces including ChatGPT, Claude, Bard, and other popular AI assistants. We regularly update our extension to ensure compatibility with new platforms.',
      isOpen: false
    },
    {
      question: 'How does the conversation branching feature work?',
      answer: 'Conversation branching allows you to create multiple divergent paths from a single point in your chat history. This is useful for exploring different ideas or approaches without starting a new conversation. Simply select the message you want to branch from and click the branch button to start a new conversation thread from that point.',
      isOpen: false
    },
    {
      question: 'What browsers are supported?',
      answer: 'Prompt-End is available for all major browsers including Chrome, Firefox, and Edge. We ensure cross-browser compatibility to provide a seamless experience regardless of your preferred browser.',
      isOpen: false
    },
    {
      question: 'Is Prompt-End free to use?',
      answer: 'Prompt-End offers both free and premium tiers. The free version includes essential features like pausing/resuming and basic conversation management. The premium version unlocks advanced features such as unlimited branching, hierarchical organization, and enhanced navigation tools.',
      isOpen: false
    },
    {
      question: 'How do I get started with Prompt-End?',
      answer: 'Getting started is easy! Simply install the extension from your browser\'s extension store, and Prompt-End will automatically integrate with your supported chat interfaces. No additional setup or configuration is required to begin using the basic features.',
      isOpen: false
    }
  ];
  
  // Toggle FAQ item
  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}