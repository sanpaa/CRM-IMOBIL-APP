import { Component, Input, HostBinding, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';
import { PropertyService } from '../../../services/property.service';
import { Property } from '../../../models/property.model';
import { PropertySearchService, PropertySearchFilters } from '../property-search.service';
import { Subscription } from 'rxjs';
import { register } from 'swiper/element/bundle';

register();

export interface PropertyGridConfig {
  eyebrow?: string;
  title?: string;
  limit: number;
  showFeatured: boolean;
  columns: number;
  showFilters: boolean;
  showViewAll?: boolean;
  viewAllLabel?: string;
  viewAllLink?: string;
  showCarousel?: boolean;
  sortBy: 'date' | 'price' | 'area';
}

@Component({
  selector: 'app-property-grid-component',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './property-grid.component.html',
  styleUrls: ['./property-grid.component.scss']
})
export class PropertyGridComponent implements WebsiteComponentBase, OnInit, AfterViewInit, OnDestroy {
  @Input() editMode: boolean = false;
  @Input() config: PropertyGridConfig = {
    limit: 6,
    showFeatured: true,
    columns: 3,
    showFilters: false,
    sortBy: 'date'
  };
  @Input() style?: ComponentStyle;
  @Input() styleConfig?: ComponentStyle;
  @Input() sectionId?: string;
  @Input() companyId: string | null = null;

  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;
  @ViewChild('gridRef') gridRef?: ElementRef<HTMLDivElement>;
  @ViewChild('swiperRef') swiperRef?: ElementRef;

  properties: Property[] = [];
  private allProperties: Property[] = [];
  private filters: PropertySearchFilters = {};
  selectedProperty: Property | null = null;
  activeImageIndex = 0;
  loading: boolean = true;
  error: boolean = false;
  private filtersSub?: Subscription;
  private readonly apiCachePrefix = 'property-grid:api:';

  @HostBinding('class.edit-mode') get isEditMode() {
    return this.editMode;
  }

  @HostBinding('style.background')
  get background() {
    return this.styleConfig?.background || this.style?.background || this.styleConfig?.backgroundColor || this.style?.backgroundColor || 'transparent';
  }

  @HostBinding('style.color')
  get textColor() {
    return this.styleConfig?.color || this.style?.color || this.styleConfig?.textColor || this.style?.textColor || 'inherit';
  }

  @HostBinding('style.padding')
  get padding() {
    return this.styleConfig?.padding || this.style?.padding || '2rem';
  }

  constructor(
    private propertyService: PropertyService,
    private searchService: PropertySearchService
  ) {}

  async ngOnInit() {
    this.filtersSub = this.searchService.filters$.subscribe(filters => {
      this.filters = filters;
      this.applyFilters();
    });
    await this.loadProperties();
  }

  ngAfterViewInit(): void {
    this.initSwiper();
  }

  ngOnDestroy(): void {
    this.filtersSub?.unsubscribe();
  }

  async loadProperties() {
    this.loading = true;
    try {
      if (this.editMode) {
        // In edit mode, show mock data
        this.allProperties = this.getMockProperties();
        this.properties = this.allProperties;
        this.loading = false;
        return;
      } else {
        // In public mode, load real properties
        const source = this.getDataSource();
        let props: Property[] = [];
        if (source.mode === 'api' && source.api) {
          props = await this.fetchPropertiesFromApi(source.api, source.headers);
        } else {
          props = this.companyId
            ? await this.propertyService.getByCompanyId(this.companyId)
            : await this.propertyService.getAll();
        }

        let filtered = props.filter(p => !p.sold);

        if (this.config.showFeatured) {
          const featured = filtered.filter(p => p.featured);
          if (featured.length > 0) {
            filtered = featured;
          }
        }

        // Apply sorting
        filtered = this.sortProperties(filtered);

        // Apply limit
        if (this.config.limit) {
          filtered = filtered.slice(0, this.config.limit);
        }

        this.allProperties = filtered;
        this.applyFilters();
        setTimeout(() => this.initSwiper(), 150);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      this.allProperties = [];
      this.properties = [];
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  private getDataSource(): { mode: 'service' | 'api'; api: string | null; headers: Record<string, string> | null } {
    const host = this.hostRef?.nativeElement;
    const componentEl = host?.closest('app-property-grid-component') as HTMLElement | null;
    const mode = (componentEl?.dataset?.['mode'] || 'service') as 'service' | 'api';
    const api = componentEl?.dataset?.['api'] || null;
    const headersJson = componentEl?.dataset?.['headers'] || '';
    let headers: Record<string, string> | null = null;
    if (headersJson) {
      try {
        const parsed = JSON.parse(headersJson);
        if (parsed && typeof parsed === 'object') {
          headers = parsed;
        }
      } catch (error) {
        console.warn('Invalid data-headers JSON on property grid', error);
      }
    }
    return { mode, api, headers };
  }

  private getApiCacheKey(apiUrl: string): string {
    return `${this.apiCachePrefix}${apiUrl}`;
  }

  private getCachedApiResponse(apiUrl: string): Property[] | null {
    if (typeof sessionStorage === 'undefined') return null;
    const cached = sessionStorage.getItem(this.getApiCacheKey(apiUrl));
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private setCachedApiResponse(apiUrl: string, data: Property[]): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(this.getApiCacheKey(apiUrl), JSON.stringify(data));
  }

  private async fetchPropertiesFromApi(apiUrl: string, headers?: Record<string, string> | null): Promise<Property[]> {
    const cached = this.getCachedApiResponse(apiUrl);
    if (cached) return cached;

    const response = await fetch(apiUrl, {
      headers: headers || undefined
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    this.setCachedApiResponse(apiUrl, list);
    return list;
  }

  private sortProperties(properties: Property[]): Property[] {
    const sorted = [...properties];
    
    switch (this.config.sortBy) {
      case 'price':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'area':
        return sorted.sort((a, b) => (this.getDisplayArea(b) || 0) - (this.getDisplayArea(a) || 0));
      case 'date':
      default:
        return sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
    }
  }

  getDisplayArea(property: Property): number | null {
    return property.areaPrivativa ?? property.areaConstrutiva ?? property.areaTerreno ?? property.area ?? null;
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

  initSwiper() {
    if (!this.swiperRef?.nativeElement || !this.showCarousel) return;
    const swiperEl = this.swiperRef.nativeElement;
    Object.assign(swiperEl, {
      slidesPerView: this.isMobile ? 1.1 : this.columns,
      spaceBetween: this.isMobile ? 16 : 24,
      navigation: !this.isMobile,
      breakpoints: {
        768: {
          slidesPerView: this.columns,
          spaceBetween: 24
        },
        0: {
          slidesPerView: 1.1,
          spaceBetween: 16
        }
      }
    });
    swiperEl.initialize();
  }

  swiperNext(): void {
    if (this.swiperRef?.nativeElement?.swiper) {
      this.swiperRef.nativeElement.swiper.slideNext();
    }
  }

  swiperPrev(): void {
    if (this.swiperRef?.nativeElement?.swiper) {
      this.swiperRef.nativeElement.swiper.slidePrev();
    }
  }

  get eyebrow(): string {
    return this.config.eyebrow || 'Exclusividade';
  }

  get title(): string {
    return this.config.title || 'Imoveis em destaque';
  }

  get showViewAll(): boolean {
    return this.config.showViewAll !== false;
  }

  get viewAllLabel(): string {
    return this.config.viewAllLabel || 'Ver todos os imoveis';
  }

  get viewAllLink(): string {
    return this.config.viewAllLink || '#';
  }

  get showCarousel(): boolean {
    return this.config.showCarousel !== false;
  }

  get columns(): number {
    return Number(this.config.columns) || 3;
  }

  get isMobile(): boolean {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  }

  openProperty(property: Property) {
    if (this.editMode) return;
    this.selectedProperty = property;
    this.activeImageIndex = 0;
  }

  closeProperty() {
    this.selectedProperty = null;
  }

  getPropertyImages(property: Property): string[] {
    if (property.image_urls && property.image_urls.length > 0) {
      return property.image_urls;
    }
    return property.image_url ? [property.image_url] : [];
  }

  getActiveImage(): string | null {
    if (!this.selectedProperty) return null;
    const images = this.getPropertyImages(this.selectedProperty);
    if (!images.length) return null;
    return images[this.activeImageIndex] || images[0];
  }

  nextImage() {
    if (!this.selectedProperty) return;
    const images = this.getPropertyImages(this.selectedProperty);
    if (images.length < 2) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % images.length;
  }

  prevImage() {
    if (!this.selectedProperty) return;
    const images = this.getPropertyImages(this.selectedProperty);
    if (images.length < 2) return;
    this.activeImageIndex = (this.activeImageIndex - 1 + images.length) % images.length;
  }

  scrollNext() {
    const el = this.gridRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.9, behavior: 'smooth' });
  }

  scrollPrev() {
    const el = this.gridRef?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.9, behavior: 'smooth' });
  }

  private applyFilters() {
    if (this.editMode) {
      this.properties = this.allProperties;
      return;
    }

    let filtered = [...this.allProperties];
    const term = this.filters.term?.toLowerCase();
    const type = this.filters.type?.toLowerCase();
    const city = this.filters.city?.toLowerCase();

    if (term) {
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.neighborhood || '').toLowerCase().includes(term)
      );
    }

    if (type) {
      filtered = filtered.filter(p => (p.type || '').toLowerCase().includes(type));
    }

    if (city) {
      filtered = filtered.filter(p => (p.city || '').toLowerCase().includes(city));
    }

    if (this.filters.bedrooms) {
      filtered = filtered.filter(p => (p.bedrooms || 0) >= (this.filters.bedrooms || 0));
    }

    if (this.filters.priceMin) {
      filtered = filtered.filter(p => (p.price || 0) >= (this.filters.priceMin || 0));
    }

    if (this.filters.priceMax) {
      filtered = filtered.filter(p => (p.price || 0) <= (this.filters.priceMax || 0));
    }

    this.properties = filtered;
  }
}
