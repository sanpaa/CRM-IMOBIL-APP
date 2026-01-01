import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

export interface HeroConfig {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  buttonText?: string;
  buttonLink?: string;
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
    buttonText: '',
    buttonLink: '#',
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
    
    return styles;
  }

  getHeightClass(): string {
    return `hero-${this.config.height || 'large'}`;
  }

  getAlignmentClass(): string {
    return `align-${this.config.alignment || 'center'}`;
  }
}
