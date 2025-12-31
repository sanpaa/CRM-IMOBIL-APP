import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { PropertyService } from '../../services/property.service';
import { CompanyService } from '../../services/company.service';
import { WebsiteLayout, LayoutSection } from '../../models/website-layout.model';
import { StoreSettings } from '../../models/company.model';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-public-website',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-website.component.html',
  styleUrls: ['./public-website.component.scss']
})
export class PublicWebsiteComponent implements OnInit, OnDestroy {
  layout: WebsiteLayout | null = null;
  sections: LayoutSection[] = [];
  storeSettings: StoreSettings | null = null;
  properties: Property[] = [];
  loading = true;
  companyId: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private customizationService: WebsiteCustomizationService,
    private propertyService: PropertyService,
    private companyService: CompanyService
  ) {}

  async ngOnInit() {
    // In a real implementation, companyId would be determined from the domain
    // For now, we'll get it from route params or use a default
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(async params => {
        this.companyId = params['companyId'] || localStorage.getItem('company_id');
        if (this.companyId) {
          await this.loadWebsite();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadWebsite() {
    if (!this.companyId) return;

    this.loading = true;
    try {
      // Load layout
      this.layout = await this.customizationService.getLayoutByPageType(this.companyId, 'home');
      
      if (this.layout) {
        this.sections = [...(this.layout.layout_config?.sections || [])];
        this.sections.sort((a, b) => a.order - b.order);
      }

      // Load store settings
      const settings = await this.companyService.getById(this.companyId);
      // In a real implementation, you'd fetch store_settings separately
      // For now we'll use company info
      
      // Load properties for property grid sections
      this.properties = await this.propertyService.getAll();
      
    } catch (error) {
      console.error('Error loading website:', error);
    } finally {
      this.loading = false;
    }
  }

  getSectionStyle(section: LayoutSection): any {
    return {
      'background-color': section.style?.backgroundColor || 'transparent',
      'color': section.style?.textColor || 'inherit',
      'padding': section.style?.padding || '2rem',
      'margin': section.style?.margin || '0'
    };
  }

  getPropertiesForSection(section: LayoutSection): Property[] {
    const config = section.config || {};
    let filtered = [...this.properties];

    if (config.showFeatured) {
      filtered = filtered.filter(p => p.featured);
    }

    if (config.limit) {
      filtered = filtered.slice(0, config.limit);
    }

    return filtered;
  }
}
