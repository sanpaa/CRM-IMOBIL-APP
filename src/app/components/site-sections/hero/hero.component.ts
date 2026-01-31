import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../models/site-config.model';
import { TemplateSection, TemplateTheme } from '../../../models/template-definition.model';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-section-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  @Input() config: SiteConfig | null = null;
  @Input() theme: TemplateTheme | null = null;
  @Input() section: TemplateSection | null = null;
  @Input() properties: Property[] = [];

  get variant(): string {
    return this.section?.variant || 'default';
  }

  get eyebrow(): string {
    return (this.section?.config?.['eyebrow'] as string) || 'Imoveis exclusivos';
  }

  get cardTitle(): string {
    return (this.section?.config?.['cardTitle'] as string) || 'Consultoria dedicada';
  }

  get cardText(): string {
    return (this.section?.config?.['cardText'] as string)
      || 'Equipe especializada para encontrar o imovel ideal.';
  }
}
