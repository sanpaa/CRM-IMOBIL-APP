import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { PropertyService } from '../../services/property.service';
import { CompanyService } from '../../services/company.service';
import { PublicSiteApiService } from '../../services/public-site-api.service';
import { AuthService } from '../../services/auth.service';
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
  // Personalização limitada
  headerConfig: any = {
    showLogo: true,
    showMenu: true,
    logoUrl: 'https://via.placeholder.com/150x50?text=Logo',
    backgroundColor: '#ffffff',
    textColor: '#333333'
  };
  footerConfig: any = {
    showLogo: false,
    showMenu: true,
    showCopyright: true,
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff'
  };
  bannerConfig = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    imageUrl: '',
    title: 'Bem-vindo à Imobiliária',
    subtitle: 'Seu novo imóvel está aqui!',
    titleColor: '#fff',
    subtitleColor: '#fff'
  };
  highlights = [
    { title: 'Atendimento Personalizado', text: 'Nossa equipe está pronta para te ajudar a encontrar o imóvel ideal.' },
    { title: 'Segurança e Facilidade', text: 'Negocie com tranquilidade, com SSL e notificações automáticas.' }
  ];
  properties: Property[] = [];
  loading = true;
  companyId: string | null = null;
  whatsappNumber: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private customizationService: WebsiteCustomizationService,
    private propertyService: PropertyService,
    private companyService: CompanyService,
    private publicSiteApi: PublicSiteApiService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // companyId pode ser determinado do domínio ou query param
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(async params => {
        const queryCompanyId = params['companyId'];
        const validFromQuery = queryCompanyId && this.authService.isValidCompanyIdString(queryCompanyId)
          ? queryCompanyId
          : null;
        const validFromAuth = this.authService.getValidCompanyId();
        this.companyId = validFromQuery || validFromAuth;
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
      // Buscar configurações da empresa
      const company = await this.companyService.getById(this.companyId);
      if (!company) {
        console.error('🔴 Empresa não encontrada');
        return;
      }
      // Header personalizável
      if (company.header_config) {
        this.headerConfig = {
          ...this.headerConfig,
          ...company.header_config
        };
      }
      // Footer personalizável
      if (company.footer_config) {
        this.footerConfig = {
          ...this.footerConfig,
          ...company.footer_config
        };
      }
      const footerWhatsapp = company.footer_config?.whatsapp;
      const companyWhatsapp = company.whatsapp;
      this.whatsappNumber = footerWhatsapp || companyWhatsapp || null;
      // Banner e destaques: personalização futura (ignorar se não existir)
      // Se desejar, pode buscar de company.custom_data ou similar no futuro
      // Carregar imóveis para grid
      this.properties = await this.propertyService.getAll();
    } catch (error) {
      console.error('🔴 Error loading website:', error);
    } finally {
      this.loading = false;
    }
  }

  getWhatsappLink(): string {
    const raw = this.whatsappNumber || '';
    const normalized = raw.replace(/\D/g, '');
    return normalized ? `https://wa.me/${normalized}` : '#';
  }
}
