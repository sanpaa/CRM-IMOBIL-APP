import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';
import { PropertySearchService, PropertySearchFilters } from '../property-search.service';

export interface SearchBarConfig {
  fields: string[];
  placeholder?: string;
  buttonText?: string;
  orientation?: 'horizontal' | 'vertical';
}

@Component({
  selector: 'app-search-bar-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: SearchBarConfig = {
    fields: ['type', 'city', 'priceRange', 'bedrooms'],
    placeholder: 'Buscar im?veis...',
    buttonText: 'Buscar',
    orientation: 'horizontal'
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  term = '';
  type = '';
  city = '';
  bedrooms: number | null = null;
  priceMin: number | null = null;
  priceMax: number | null = null;

  @HostBinding('style.background')
  get background() {
    return this.style?.background || this.style?.backgroundColor || 'transparent';
  }

  @HostBinding('style.color')
  get textColor() {
    return this.style?.color || this.style?.textColor || 'inherit';
  }

  @HostBinding('style.padding')
  get padding() {
    return this.style?.padding || '2rem';
  }

  constructor(private searchService: PropertySearchService) {}

  onSubmit() {
    if (this.editMode) return;
    const filters: PropertySearchFilters = {
      term: this.term?.trim() || undefined,
      type: this.type?.trim() || undefined,
      city: this.city?.trim() || undefined,
      bedrooms: this.bedrooms || undefined,
      priceMin: this.priceMin || undefined,
      priceMax: this.priceMax || undefined
    };
    this.searchService.setFilters(filters);
  }

  hasField(field: string): boolean {
    return this.config.fields?.includes(field);
  }
}
