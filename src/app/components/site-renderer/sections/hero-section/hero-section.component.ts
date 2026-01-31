import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../../models/site-config.model';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html'
})
export class HeroSectionComponent {
  @Input() config: (SiteConfig & { whatsappLink?: string }) | null = null;
}
