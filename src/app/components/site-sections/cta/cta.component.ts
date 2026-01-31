import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../models/site-config.model';
import { TemplateSection, TemplateTheme } from '../../../models/template-definition.model';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-section-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss']
})
export class CtaComponent {
  @Input() config: SiteConfig | null = null;
  @Input() theme: TemplateTheme | null = null;
  @Input() section: TemplateSection | null = null;
  @Input() properties: Property[] = [];

  get variant(): string {
    return this.section?.variant || 'default';
  }

  get title(): string {
    return (this.section?.config?.['title'] as string) || 'Pronto para encontrar seu imovel?';
  }

  get text(): string {
    return (this.section?.config?.['text'] as string) || (this.config?.contactText || '');
  }
}
