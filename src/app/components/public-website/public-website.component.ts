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
      console.log('🟢 Carregando site público para company:', this.companyId);
      
      // Usar API do backend que retorna tudo junto
      const siteConfig = await this.publicSiteApi.getSiteConfigByCompanyId(this.companyId);
      
      if (!siteConfig.success) {
        console.error('🔴 Erro na resposta da API:', siteConfig.error);
        return;
      }
      
      console.log('✅ Configuração recebida da API:', siteConfig);
      
      // Extrair visualConfig
      const visualConfig = siteConfig.visualConfig;
      const pages = siteConfig.pages || [];
      const homePage = pages.find((p: any) => p.pageType === 'home') || pages[0];
      const components = homePage?.components || [];
      
      // Configurar header (BUSCA DO BACKEND, NÃO DO SUPABASE!)
      this.headerConfig = {
        logoUrl: visualConfig?.branding?.logoUrl || undefined,
        showLogo: !!visualConfig?.branding?.logoUrl,
        showMenu: true,
        backgroundColor: visualConfig?.theme?.primaryColor || '#ffffff',
        textColor: '#333333'
      };
      
      // Configurar footer (BUSCA DO BACKEND, NÃO DO SUPABASE!)
      this.footerConfig = {
        companyName: visualConfig?.branding?.companyName || siteConfig.company?.name || 'Imobiliária',
        description: visualConfig?.branding?.description,
        logoUrl: visualConfig?.branding?.logoUrl || undefined,
        showLogo: false,
        
        // Informações de contato
        address: visualConfig?.contact?.address,
        phone: visualConfig?.contact?.phone || siteConfig.company?.phone,
        email: visualConfig?.contact?.email || siteConfig.company?.email,
        
        // Redes sociais
        instagram: visualConfig?.socialLinks?.instagram,
        facebook: visualConfig?.socialLinks?.facebook,
        whatsapp: visualConfig?.socialLinks?.whatsapp,
        
        // Links rápidos (com defaults)
        quickLinks: visualConfig?.footer?.quickLinks || [
          { label: 'Sobre Nós', route: '/sobre' },
          { label: 'Contato', route: '/contato' }
        ],
        
        // Serviços (com defaults)
        services: visualConfig?.footer?.services || [
          { label: 'Comprar', route: '/imoveis?tipo=venda' },
          { label: 'Alugar', route: '/imoveis?tipo=aluguel' }
        ],
        
        showCopyright: true,
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff'
      };
      
      // Pegar TODOS os components EXCETO header e footer para o conteúdo
      this.sections = components
        .filter((s: any) => s.type !== 'header' && s.type !== 'footer')
        .sort((a: any, b: any) => a.order - b.order);
      
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
