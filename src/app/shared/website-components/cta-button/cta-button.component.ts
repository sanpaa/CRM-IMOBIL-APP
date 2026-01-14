import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

export interface CtaButtonConfig {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  accentColor?: string;
  badgeText?: string;
}

@Component({
  selector: 'app-cta-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta-button.component.html',
  styleUrls: ['./cta-button.component.scss']
})
export class CtaButtonComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: CtaButtonConfig = {
    title: 'Pronto para fechar o seu proximo negocio?',
    subtitle: 'Agende uma consultoria e tenha acesso a oportunidades fora do mercado.',
    buttonText: 'Agendar consultoria',
    buttonLink: '/contato',
    secondaryButtonText: 'Ver imoveis',
    secondaryButtonLink: '/imoveis',
    overlayColor: '#0f172a',
    overlayOpacity: 0.6,
    accentColor: '#0ea5e9',
    badgeText: 'Ultima chance'
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  getSectionStyles(): any {
    const backgroundValue = this.style?.background || this.style?.backgroundColor;
    const styles: any = {
      padding: this.style?.padding || '5rem 0',
      color: this.style?.textColor || 'inherit'
    };

    if (backgroundValue) {
      if (backgroundValue.includes('gradient') || backgroundValue.includes('url(')) {
        styles.background = backgroundValue;
      } else {
        styles.backgroundColor = backgroundValue;
      }
    }

    return styles;
  }

  getOverlayStyles(): any {
    const overlayOpacity = this.config.overlayOpacity ?? 0.6;
    return {
      backgroundColor: this.config.overlayColor || '#0f172a',
      opacity: Math.max(0, Math.min(overlayOpacity, 1))
    };
  }

  getAccentColor(): string {
    return this.config.accentColor || '#0ea5e9';
  }
}
