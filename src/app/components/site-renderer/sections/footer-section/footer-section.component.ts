import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../../models/site-config.model';

@Component({
  selector: 'app-footer-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-section.component.html'
})
export class FooterSectionComponent {
  @Input() config: (SiteConfig & { whatsappLink?: string }) | null = null;
  currentYear = new Date().getFullYear();
}
