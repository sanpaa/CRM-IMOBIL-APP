import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../../models/site-config.model';

@Component({
  selector: 'app-sobre-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sobre-section.component.html'
})
export class SobreSectionComponent {
  @Input() config: (SiteConfig & { whatsappLink?: string }) | null = null;
}
