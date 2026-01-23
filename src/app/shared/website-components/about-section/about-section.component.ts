import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

export interface AboutBullet {
  icon?: string;
  title: string;
  description?: string;
}

export interface AboutSectionConfig {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  bullets?: AboutBullet[];
  buttonText?: string;
  buttonLink?: string;
  highlightText?: string;
  imagePosition?: 'left' | 'right';
}

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss']
})
export class AboutSectionComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: AboutSectionConfig = {
    eyebrow: 'Manifesto',
    title: 'Seu corretor com visao estrategica',
    subtitle: 'Atendimento direto, dados de mercado e foco em conversao.',
    content: 'Ha mais de 12 anos conectando familias aos melhores imoveis. Trabalhamos com curadoria, transparencia e velocidade para entregar oportunidades reais.',
    imageUrl: '',
    bullets: [],
    buttonText: 'Conheca o corretor',
    buttonLink: '/sobre',
    highlightText: 'Atendimento 1:1 com acompanhamento total',
    imagePosition: 'right'
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  getSectionStyles(): any {
    const backgroundValue = this.style?.background || this.style?.backgroundColor;
    const styles: any = {
      padding: this.style?.padding || '5rem 0',
      color: this.style?.textColor || 'inherit'
    };

    if (typeof backgroundValue === 'string' && backgroundValue.trim()) {
      if (backgroundValue.includes('gradient') || backgroundValue.includes('url(')) {
        styles.background = backgroundValue;
      } else {
        styles.backgroundColor = backgroundValue;
      }
    }

    return styles;
  }

  getImagePositionClass(): string {
    return this.config.imagePosition === 'left' ? 'image-left' : 'image-right';
  }

  getBullets(): AboutBullet[] {
    return this.config.bullets && this.config.bullets.length
      ? this.config.bullets
      : [
          { icon: 'fa-solid fa-chart-line', title: 'Visao de mercado', description: 'Analises semanais para precificar com seguranca.' },
          { icon: 'fa-solid fa-star', title: 'Curadoria premium', description: 'Selecao enxuta com imoveis de alta liquidez.' },
          { icon: 'fa-solid fa-handshake', title: 'Negociacao clara', description: 'Processo transparente ate a assinatura.' }
        ];
  }

  isIconClass(icon?: string): boolean {
    return !!icon && (icon.includes('fa') || icon.includes('bi') || icon.includes('mdi'));
  }
}
