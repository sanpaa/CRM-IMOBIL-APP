import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SiteConfig } from '../../../../models/site-config.model';
import { Property } from '../../../../models/property.model';

@Component({
  selector: 'app-imoveis-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './imoveis-grid.component.html'
})
export class ImoveisGridComponent {
  @Input() config: (SiteConfig & { whatsappLink?: string }) | null = null;
  @Input() properties: Property[] = [];

  get cards(): Array<{ title: string; city: string; price: string; image?: string }> {
    if (this.properties && this.properties.length) {
      return this.properties.slice(0, 6).map(property => ({
        title: property.title || 'Imovel',
        city: property.city || property.neighborhood || 'Cidade',
        price: property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Consulte',
        image: property.image_url || (property.image_urls && property.image_urls[0]) || ''
      }));
    }

    return [
      { title: 'Apartamento moderno', city: 'Centro', price: 'R$ 980.000' },
      { title: 'Casa com piscina', city: 'Jardins', price: 'R$ 1.450.000' },
      { title: 'Cobertura premium', city: 'Vila Nova', price: 'R$ 2.200.000' }
    ];
  }
}
