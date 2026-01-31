import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TemplateSection, TemplateTheme } from '../../../models/template-definition.model';
import { SiteConfig } from '../../../models/site-config.model';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-section-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent {
  @Input() config: SiteConfig | null = null;
  @Input() theme: TemplateTheme | null = null;
  @Input() section: TemplateSection | null = null;
  @Input() properties: Property[] = [];

  get variant(): string {
    return this.section?.variant || 'default';
  }

  get items(): Array<{ title: string; text: string }> {
    const items = this.section?.config?.['items'];
    if (Array.isArray(items) && items.length) return items;
    return [
      { title: 'Curadoria inteligente', text: 'Selecionamos imoveis com alta liquidez.' },
      { title: 'Negociacao clara', text: 'Processo transparente do inicio ao fim.' },
      { title: 'Atendimento rapido', text: 'Resposta imediata via WhatsApp.' }
    ];
  }
}
