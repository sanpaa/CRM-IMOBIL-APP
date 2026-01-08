import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { PropertyService } from '../../services/property.service';
import { CompanyService } from '../../services/company.service';
import { PublicSiteApiService } from '../../services/public-site-api.service';
import { WebsiteLayout, LayoutSection } from '../../models/website-layout.model';
import { StoreSettings } from '../../models/company.model';
import { Property } from '../../models/property.model';
import { RenderComponentDirective } from '../../shared/website-components/render-component.directive';
import { HeaderComponent } from '../../shared/website-components/header/header.component';
import { FooterComponent } from '../../shared/website-components/footer/footer.component';

@Component({
  selector: 'app-public-website',
  standalone: true,
  imports: [CommonModule, RenderComponentDirective, HeaderComponent, FooterComponent],
  templateUrl: './public-website.component.html',
  styleUrls: ['./public-website.component.scss']
})
export class PublicWebsiteComponent implements OnInit, OnDestroy {
  layout: WebsiteLayout | null = null;
  sections: LayoutSection[] = [];
  headerConfig: any = {
    showLogo: true,
    showMenu: true,
    logoUrl: 'https://via.placeholder.com/150x50?text=Logo'
  };
  footerConfig: any = {
    showLogo: false,
    showMenu: true,
    showCopyright: true
  };
  storeSettings: StoreSettings | null = null;
  properties: Property[] = [];
  loading = true;
  companyId: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private customizationService: WebsiteCustomizationService,
    private propertyService: PropertyService,
    private companyService: CompanyService,
    private publicSiteApi: PublicSiteApiService
  ) {}

  async ngOnInit() {
    // In a real implementation, companyId would be determined from the domain
    // For now, we'll get it from route params or use a default
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(async params => {
        const companyIdFromStorage = localStorage.getItem('company_id');
        // Validate company_id is not null, 'null', or 'undefined'
        const validCompanyId = companyIdFromStorage && 
                               companyIdFromStorage !== 'null' && 
                               companyIdFromStorage !== 'undefined' 
                               ? companyIdFromStorage 
                               : null;
        this.companyId = params['companyId'] || validCompanyId;
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
      console.log('🟢 Carregando site público para company:', this.companyId);
      
      // Buscar configurações diretamente do banco via CompanyService
      const company = await this.companyService.getById(this.companyId);
      
      if (!company) {
        console.error('🔴 Empresa não encontrada');
        return;
      }
      
      console.log('✅ Company data with footer_config:', company);
      
      // Configurar header direto do header_config
      if (company.header_config) {
        this.headerConfig = {
          logoUrl: company.header_config.logoUrl,
          showLogo: company.header_config.showLogo ?? true,
          showMenu: company.header_config.showMenu ?? true,
          backgroundColor: company.header_config.backgroundColor || '#ffffff',
          textColor: company.header_config.textColor || '#333333'
        };
      }
      
      // Configurar footer direto do footer_config
      if (company.footer_config) {
        this.footerConfig = {
          companyName: company.footer_config.companyName || company.name,
          description: company.footer_config.description,
          logoUrl: company.footer_config.logoUrl,
          showLogo: company.footer_config.showLogo ?? false,
          
          // Informações de contato
          address: company.footer_config.address,
          phone: company.footer_config.phone || company.phone,
          email: company.footer_config.email || company.email,
          
          // Redes sociais
          instagram: company.footer_config.instagram,
          facebook: company.footer_config.facebook,
          whatsapp: company.footer_config.whatsapp,
          
          // Links e serviços
          quickLinks: company.footer_config.quickLinks || [],
          services: company.footer_config.services || [],
          
          showCopyright: company.footer_config.showCopyright ?? true,
          backgroundColor: company.footer_config.backgroundColor || '#1a1a1a',
          textColor: company.footer_config.textColor || '#ffffff'
        };
      }
      
      // Carregar componentes do website builder
      const layoutData = await this.customizationService.getLayout(this.companyId);
      if (layoutData) {
        this.layout = layoutData;
        const sections = layoutData.layout_config?.sections || layoutData.layout_config?.components || [];
        this.sections = sections
          .filter((s: any) => s.type !== 'header' && s.type !== 'footer')
          .sort((a: any, b: any) => a.order - b.order);
      }
      
      console.log('✅ Site carregado com sucesso!');
      console.log('📋 Header Config:', this.headerConfig);
      console.log('📋 Footer Config:', this.footerConfig);
      console.log('📋 Sections:', this.sections);
      
      // Load properties for property grid sections
      this.properties = await this.propertyService.getAll();
      
    } catch (error) {
      console.error('🔴 Error loading website:', error);
    } finally {
      this.loading = false;
    }
  }
}
