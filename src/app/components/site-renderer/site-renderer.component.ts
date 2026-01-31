import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { SiteConfig } from '../../models/site-config.model';
import { TemplateDefinition, TemplateSection, SectionType } from '../../models/template-definition.model';
import { HeaderComponent } from '../site-sections/header/header.component';
import { HeroComponent } from '../site-sections/hero/hero.component';
import { FeaturesComponent } from '../site-sections/features/features.component';
import { ImoveisGridComponent } from '../site-sections/imoveis-grid/imoveis-grid.component';
import { CtaComponent } from '../site-sections/cta/cta.component';
import { FooterComponent } from '../site-sections/footer/footer.component';
import { Property } from '../../models/property.model';

const SECTION_REGISTRY: Record<SectionType, Record<string, any>> = {
  header: {
    default: HeaderComponent,
    luxo: HeaderComponent
  },
  hero: {
    default: HeroComponent,
    'full-bleed': HeroComponent,
    split: HeroComponent
  },
  features: {
    default: FeaturesComponent
  },
  imoveis: {
    default: ImoveisGridComponent,
    grid: ImoveisGridComponent,
    carousel: ImoveisGridComponent
  },
  cta: {
    default: CtaComponent,
    minimal: CtaComponent
  },
  footer: {
    default: FooterComponent,
    luxo: FooterComponent
  }
};

@Component({
  selector: 'app-site-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './site-renderer.component.html',
  styleUrls: ['./site-renderer.component.scss']
})
export class SiteRendererComponent implements OnChanges {
  @Input() template: TemplateDefinition | null = null;
  @Input() config: SiteConfig | null = null;
  @Input() properties: Property[] = [];

  ngOnChanges(): void {
    if (this.template) {
      this.applyTheme(this.template.theme, this.config);
    }
  }

  get mergedConfig(): SiteConfig | null {
    if (!this.template || !this.config) return null;
    return {
      ...this.config,
      whatsappLink: this.getWhatsappLink(this.config.whatsapp)
    } as SiteConfig;
  }

  getSectionComponent(section: TemplateSection) {
    const typeRegistry = SECTION_REGISTRY[section.type];
    const variant = section.variant || 'default';
    return typeRegistry[variant] || typeRegistry['default'];
  }

  trackBySection(index: number, section: TemplateSection) {
    return `${section.type}-${index}`;
  }

  private applyTheme(theme: TemplateDefinition['theme'], config?: SiteConfig | null) {
    const primary = config?.primaryColor || theme.primary;
    const secondary = config?.secondaryColor || theme.secondary || primary;
    const accent = config?.accentColor || theme.accent || primary;
    const background = config?.backgroundColor || theme.background || secondary;
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--secondary', secondary);
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--background', background);
    document.documentElement.style.setProperty('--font-title', theme.fontTitle);
    document.documentElement.style.setProperty('--font-body', theme.fontBody);
  }

  private getWhatsappLink(raw?: string | null): string {
    let normalized = (raw || '').replace(/\D/g, '');
    if (!normalized) return '#';
    if (normalized.length <= 11 && !normalized.startsWith('55')) {
      normalized = `55${normalized}`;
    }
    return `https://wa.me/${normalized}`;
  }
}
