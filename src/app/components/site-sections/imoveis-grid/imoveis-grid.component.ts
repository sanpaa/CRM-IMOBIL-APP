import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../models/site-config.model';
import { TemplateSection, TemplateTheme } from '../../../models/template-definition.model';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-section-imoveis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imoveis-grid.component.html',
  styleUrls: ['./imoveis-grid.component.scss']
})
export class ImoveisGridComponent {
  @Input() config: SiteConfig | null = null;
  @Input() theme: TemplateTheme | null = null;
  @Input() section: TemplateSection | null = null;
  @Input() properties: Property[] = [];

  get variant(): string {
    return this.section?.variant || 'grid';
  }

  get sectionConfig(): Record<string, any> {
    return this.section?.config || {};
  }

  get eyebrow(): string {
    return (this.sectionConfig['eyebrow'] as string) || 'Destaques';
  }

  get title(): string {
    return (this.sectionConfig['title'] as string) || 'Imoveis em destaque';
  }

  get ctaLabel(): string {
    return (this.sectionConfig['ctaLabel'] as string) || 'Ver todos';
  }

  get ctaLink(): string {
    const link = this.sectionConfig['ctaLink'];
    if (typeof link === 'string' && link.trim().length) return link.trim();
    return '/imoveis';
  }

  get showCta(): boolean {
    return this.sectionConfig['showCta'] !== false;
  }

  get limit(): number {
    const parsed = Number(this.sectionConfig['limit']);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 6;
  }

  get columns(): number {
    const parsed = Number(this.sectionConfig['columns']);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
  }

  get useCarousel(): boolean {
    if (this.variant === 'carousel') return true;
    return this.sectionConfig['showCarousel'] === true;
  }

  get gridStyle(): Record<string, string> | null {
    if (this.useCarousel) return null;
    return { 'grid-template-columns': `repeat(${this.columns}, minmax(220px, 1fr))` };
  }

  get cards(): Array<{ title: string; city: string; price: string; image?: string; link?: string }> {
    const list = Array.isArray(this.properties) ? this.properties : [];
    let filtered = list.filter(property => !property.sold);
    if (this.sectionConfig['showFeatured']) {
      const featured = filtered.filter(property => property.featured);
      if (featured.length) {
        filtered = featured;
      }
    }

    if (filtered.length) {
      return filtered.slice(0, this.limit).map(property => ({
        title: property.title || 'Imovel',
        city: property.city || property.neighborhood || property.state || 'Cidade',
        price: property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Consulte',
        image: property.image_url || (property.image_urls && property.image_urls[0]) || '',
        link: property.id ? `/imovel/${property.id}` : '#'
      }));
    }

    return [
      { title: 'Apartamento moderno', city: 'Centro', price: 'R$ 980.000', link: '#'},
      { title: 'Casa com piscina', city: 'Jardins', price: 'R$ 1.450.000', link: '#'},
      { title: 'Cobertura premium', city: 'Vila Nova', price: 'R$ 2.200.000', link: '#'}
    ];
  }
}
