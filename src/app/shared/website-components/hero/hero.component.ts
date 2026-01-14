import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

export interface HeroBadge {
  text?: string;
  label?: string;
}

export interface HeroHighlight {
  value?: string;
  label?: string;
  description?: string;
  title?: string;
}

export interface HeroConfig {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  badges?: Array<string | HeroBadge>;
  highlights?: Array<string | HeroHighlight>;
  contentWidth?: string;
  height: 'small' | 'medium' | 'large' | 'full';
  alignment: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-hero-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: HeroConfig = {
    title: 'Bem-vindo',
    subtitle: '',
    backgroundImage: '',
    overlayColor: '#0f172a',
    overlayOpacity: 0.55,
    buttonText: '',
    buttonLink: '#',
    secondaryButtonText: '',
    secondaryButtonLink: '#',
    badges: [],
    highlights: [],
    contentWidth: '1200px',
    height: 'large',
    alignment: 'center'
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  @HostBinding('class.edit-mode') get isEditMode() {
    return this.editMode;
  }

  @HostBinding('style.background-color')
  get backgroundColor() {
    return this.style?.backgroundColor || 'transparent';
  }

  @HostBinding('style.color')
  get textColor() {
    return this.style?.textColor || 'inherit';
  }

  @HostBinding('style.padding')
  get padding() {
    return this.style?.padding || '0';
  }

  @HostBinding('style.margin')
  get margin() {
    return this.style?.margin || '0';
  }

  getBackgroundStyle(): any {
    const styles: any = {};

    if (this.config.backgroundImage) {
      styles['background-image'] = `url(${this.config.backgroundImage})`;
      styles['background-size'] = 'cover';
      styles['background-position'] = 'center';
    }

    const backgroundValue = this.style?.background || this.style?.backgroundColor;
    if (backgroundValue) {
      if (backgroundValue.includes('gradient') || backgroundValue.includes('url(')) {
        styles.background = backgroundValue;
      } else {
        styles['background-color'] = backgroundValue;
      }
    }

    return styles;
  }

  getHeightClass(): string {
    return `hero-${this.config.height || 'large'}`;
  }

  getAlignmentClass(): string {
    return `align-${this.config.alignment || 'center'}`;
  }

  getOverlayStyles(): any {
    const overlayOpacity = this.config.overlayOpacity ?? 0.55;
    return {
      backgroundColor: this.config.overlayColor || '#0f172a',
      opacity: Math.max(0, Math.min(overlayOpacity, 1))
    };
  }

  getContentStyles(): any {
    return {
      maxWidth: this.config.contentWidth || this.style?.maxWidth || '1200px'
    };
  }

  getBadges(): string[] {
    const badges = this.config.badges || [];
    return badges
      .map(badge => {
        if (typeof badge === 'string') return badge;
        return badge.text || badge.label || '';
      })
      .filter(Boolean);
  }

  getHighlights(): Array<{ value: string; label?: string; description?: string }> {
    const highlights = this.config.highlights || [];
    return highlights
      .map(item => {
        if (typeof item === 'string') {
          return { value: item };
        }

        const value = item.value || item.title || item.label || '';
        const label = item.label && item.label !== value ? item.label : undefined;
        const description = item.description && item.description !== label ? item.description : undefined;

        return {
          value,
          label,
          description
        };
      })
      .filter(item => item.value);
  }
}
