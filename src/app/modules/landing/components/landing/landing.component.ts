import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { FeaturesSectionComponent } from '../features-section/features-section.component';
import { BenefitsSectionComponent } from '../benefits-section/benefits-section.component';
import { CtaSectionComponent } from '../cta-section/cta-section.component';
import { TestimonialsSectionComponent } from '../testimonials-section/testimonials-section.component';
import { FaqSectionComponent } from '../faq-section/faq-section.component';
import { FooterSectionComponent } from '../footer-section/footer-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroSectionComponent,
    FeaturesSectionComponent,
    BenefitsSectionComponent,
    CtaSectionComponent,
    TestimonialsSectionComponent,
    FaqSectionComponent,
    FooterSectionComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  // Navigation links for the landing page
  navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Benefits', href: '#benefits' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Playground', href: '/chat', isRouterLink: true }
  ];

  // Scroll to section with smooth behavior
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}