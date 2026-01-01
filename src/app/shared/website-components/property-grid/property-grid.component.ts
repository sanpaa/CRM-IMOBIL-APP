import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';
import { PropertyService } from '../../../services/property.service';
import { Property } from '../../../models/property.model';

export interface PropertyGridConfig {
  limit: number;
  showFeatured: boolean;
  columns: number;
  showFilters: boolean;
  sortBy: 'date' | 'price' | 'area';
}

@Component({
  selector: 'app-property-grid-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-grid.component.html',
  styleUrls: ['./property-grid.component.scss']
})
export class PropertyGridComponent implements WebsiteComponentBase, OnInit {
  @Input() editMode: boolean = false;
  @Input() config: PropertyGridConfig = {
    limit: 6,
    showFeatured: true,
    columns: 3,
    showFilters: false,
    sortBy: 'date'
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  properties: Property[] = [];
  loading: boolean = true;

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
    return this.style?.padding || '2rem';
  }

  constructor(private propertyService: PropertyService) {}

  async ngOnInit() {
    await this.loadProperties();
  }

  async loadProperties() {
    this.loading = true;
    try {
      if (this.editMode) {
        // In edit mode, show mock data
        this.properties = this.getMockProperties();
      } else {
        // In public mode, load real properties
        let props = await this.propertyService.getAll();
        
        if (this.config.showFeatured) {
          props = props.filter(p => p.featured);
        }
        
        // Apply sorting
        props = this.sortProperties(props);
        
        // Apply limit
        if (this.config.limit) {
          props = props.slice(0, this.config.limit);
        }
        
        this.properties = props;
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      this.properties = [];
    } finally {
      this.loading = false;
    }
  }

  private sortProperties(properties: Property[]): Property[] {
    const sorted = [...properties];
    
    switch (this.config.sortBy) {
      case 'price':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'area':
        return sorted.sort((a, b) => (b.area || 0) - (a.area || 0));
      case 'date':
      default:
        return sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
    }
  }

  private getMockProperties(): Property[] {
    const mockData = [
      {
        id: '1',
        title: 'Casa com 3 Quartos',
        city: 'São Paulo',
        state: 'SP',
        price: 450000,
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500',
        featured: true
      },
      {
        id: '2',
        title: 'Apartamento Moderno',
        city: 'Rio de Janeiro',
        state: 'RJ',
        price: 380000,
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
        featured: true
      },
      {
        id: '3',
        title: 'Casa de Campo',
        city: 'Gramado',
        state: 'RS',
        price: 650000,
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
        image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500',
        featured: false
      },
      {
        id: '4',
        title: 'Cobertura Luxo',
        city: 'Belo Horizonte',
        state: 'MG',
        price: 890000,
        bedrooms: 3,
        bathrooms: 3,
        area: 180,
        image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500',
        featured: true
      },
      {
        id: '5',
        title: 'Studio Compacto',
        city: 'Curitiba',
        state: 'PR',
        price: 220000,
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
        featured: false
      },
      {
        id: '6',
        title: 'Casa em Condomínio',
        city: 'Brasília',
        state: 'DF',
        price: 720000,
        bedrooms: 4,
        bathrooms: 4,
        area: 250,
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500',
        featured: true
      }
    ] as Property[];

    let filtered = [...mockData];
    if (this.config.showFeatured) {
      filtered = filtered.filter(p => p.featured);
    }
    return filtered.slice(0, this.config.limit);
  }

  getGridColumns(): string {
    return `repeat(${this.config.columns}, 1fr)`;
  }

  formatPrice(price: number | undefined): string {
    if (!price) return 'Consulte';
    return `R$ ${price.toLocaleString('pt-BR')}`;
  }
}
