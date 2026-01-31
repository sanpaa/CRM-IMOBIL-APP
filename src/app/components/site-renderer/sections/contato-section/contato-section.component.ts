import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../../models/site-config.model';

@Component({
  selector: 'app-contato-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contato-section.component.html'
})
export class ContatoSectionComponent {
  @Input() config: (SiteConfig & { whatsappLink?: string }) | null = null;
}
