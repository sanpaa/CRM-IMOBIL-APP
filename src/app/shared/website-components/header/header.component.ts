import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

export interface NavItem {
  label: string;
  link: string;
}

export interface HeaderConfig {
  logo: string;
  showSearch: boolean;
  navigation: NavItem[];
}

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: HeaderConfig = {
    logo: 'Imobiliária',
    showSearch: true,
    navigation: [
      { label: 'Home', link: '/' },
      { label: 'Imóveis', link: '/properties' },
      { label: 'Contato', link: '/contact' }
    ]
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  @HostBinding('class.edit-mode') get isEditMode() {
    return this.editMode;
  }

  @HostBinding('style.background-color')
  get backgroundColor() {
    return this.style?.backgroundColor || '#ffffff';
  }

  @HostBinding('style.color')
  get textColor() {
    return this.style?.textColor || '#333333';
  }
}
