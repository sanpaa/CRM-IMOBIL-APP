import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WebsiteCustomizationService } from '../../services/website-customization.service';
import { CompanyService } from '../../services/company.service';
import { PublicSiteConfigService } from '../../services/public-site-config.service';
import { AuthService } from '../../services/auth.service';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-public-website',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-website.component.html',
  styleUrls: ['./public-website.component.scss']
})
export class PublicWebsiteComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  loading = true;
  companyId: string | null = null;
  whatsappNumber: string | null = null;
  layoutHtml = '';
  layoutCss = '';
  private modalEl: HTMLElement | null = null;
  private currentFilters: {
    term?: string;
    city?: string;
  } = {};
  private destroy$ = new Subject<void>();
  private readonly apiCachePrefix = 'public-site:property-grid:api:';

  constructor(
    private route: ActivatedRoute,
    private customizationService: WebsiteCustomizationService,
    private companyService: CompanyService,
    private publicSiteConfig: PublicSiteConfigService,
    private authService: AuthService,
    private host: ElementRef<HTMLElement>
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
        console.log('[public-site] resolved companyId', {
          queryCompanyId,
          validFromQuery,
          validFromAuth,
          companyId: this.companyId
        });
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
      const footerWhatsapp = company.footer_config?.whatsapp;
      const companyWhatsapp = company.whatsapp;
      this.whatsappNumber = footerWhatsapp || companyWhatsapp || null;
      this.properties = await this.publicSiteConfig.getPropertiesForCompany(this.companyId);
      console.log('[public-site] properties loaded', {
        companyId: this.companyId,
        count: this.properties?.length ?? 0,
        sample: this.properties?.[0]
      });

      const layout = await this.customizationService.getLayoutByPageType(this.companyId, 'home');
      const html = layout?.html ?? (layout?.layout_config as any)?.html ?? '';
      const css = layout?.css ?? (layout?.layout_config as any)?.css ?? '';
      this.layoutHtml = html || '';
      this.layoutCss = css || '';
      console.log('[public-site] layout loaded', {
        hasHtml: !!this.layoutHtml,
        htmlLength: this.layoutHtml?.length ?? 0,
        hasCss: !!this.layoutCss,
        cssLength: this.layoutCss?.length ?? 0
      });
      this.ensureHeadAssets();
      setTimeout(() => {
        console.log('[public-site] hydrating interactive blocks');
        this.hydrateInteractiveBlocks();
      }, 0);
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

  private ensureHeadAssets() {
    const head = document.head;
    if (!head) return;

    this.addScript(head, 'https://cdn.tailwindcss.com?plugins=forms,container-queries', 'tw-cdn');
    this.addLink(head, 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap', 'font-inter');
    this.addLink(head, 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1', 'font-material');
    this.addLink(head, '/assets/website-components.css', 'website-components');
  }

  private addScript(head: HTMLHeadElement, src: string, id: string) {
    if (head.querySelector(`#${id}`)) return;
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    head.appendChild(script);
  }

  private addLink(head: HTMLHeadElement, href: string, id: string) {
    if (head.querySelector(`#${id}`)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    head.appendChild(link);
  }

  private hydrateInteractiveBlocks() {
    const root = this.host.nativeElement.querySelector('.grapes-output') as HTMLElement | null;
    if (!root) return;

    this.hydrateHeader(root);
    this.bindSearchBar(root);
    this.bindHeaderMenu(root);
    void this.renderPropertyGrid(root);
  }

  private hydrateHeader(root: HTMLElement) {
    const header = root.querySelector('header.site-header, header.component-header') as HTMLElement | null;
    if (!header) return;

    const config = this.safeParse(header.getAttribute('data-config')) || {};
    const style = this.safeParse(header.getAttribute('data-style')) || {};

    const brandText = header.querySelector('.brand-text, .navbar-brand h1') as HTMLElement | null;
    if (brandText) {
      const name = (config.companyName || brandText.textContent || 'Sua Imobiliaria').toString();
      brandText.textContent = name;
    }

    const logo = header.querySelector('.brand img, .logo img') as HTMLImageElement | null;
    if (logo) {
      const logoUrl = (config.logoUrl || '').toString().trim();
      const showLogo = config.showLogo !== false && !!logoUrl;
      if (showLogo) {
        logo.src = logoUrl;
        logo.style.display = 'block';
      } else {
        logo.style.display = 'none';
      }
    }

    const nav = header.querySelector('.nav') as HTMLElement | null;
    if (nav) {
      const navigation = Array.isArray(config.navigation) && config.navigation.length
        ? config.navigation
        : [
            { label: 'Imoveis', link: '#imoveis' },
            { label: 'Sobre', link: '#sobre' },
            { label: 'Contato', link: '#contato' }
          ];

      nav.innerHTML = '';
      navigation.forEach((item: any) => {
        const anchor = document.createElement('a');
        anchor.textContent = (item?.label || '').toString();
        anchor.href = (item?.link || '#').toString();
        nav.appendChild(anchor);
      });

      const showCta = config.showCta !== false;
      const ctaLabel = (config.ctaLabel || 'Anunciar Imovel').toString();
      const ctaLink = (config.ctaLink || '').toString().trim();
      const phone = (config.phone || '').toString();
      const normalized = phone.replace(/\D/g, '');
      const whatsappLink = normalized ? `https://wa.me/${normalized}` : '';
      const finalCtaLink = ctaLink || whatsappLink;

      if (showCta && finalCtaLink) {
        const cta = document.createElement('a');
        cta.className = 'cta';
        cta.textContent = ctaLabel;
        cta.href = finalCtaLink;
        nav.appendChild(cta);
      }
    }

    const bg = (style.backgroundColor || config.backgroundColor || '').toString().trim();
    const text = (style.textColor || config.textColor || '').toString().trim();
    if (bg) header.style.setProperty('--header-bg', bg);
    if (text) header.style.setProperty('--header-text', text);
  }

  private bindHeaderMenu(root: HTMLElement) {
    const header = root.querySelector('header.site-header') as HTMLElement | null;
    if (!header) return;
    const toggle = header.querySelector('.menu-toggle') as HTMLButtonElement | null;
    const nav = header.querySelector('.nav') as HTMLElement | null;
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });

    nav.addEventListener('click', event => {
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName !== 'A') return;
      if (window.innerWidth <= 900) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  private safeParse(raw: string | null): any {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn('[public-site] invalid JSON', error);
      return {};
    }
  }

  private bindSearchBar(root: HTMLElement) {
    const section = root.querySelector('[data-component="search-bar"]');
    if (!section) return;
    const form = section.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', event => {
      event.preventDefault();
      const term = (form.querySelector('[data-field="term"]') as HTMLInputElement | null)?.value || '';
      const city = (form.querySelector('[data-field="city"]') as HTMLInputElement | null)?.value || '';
      this.currentFilters = {
        term: term.trim() || undefined,
        city: city.trim() || undefined
      };
      void this.renderPropertyGrid(root);
    });
  }

  private async renderPropertyGrid(root: HTMLElement) {
    const section = root.querySelector('[data-component="property-grid"]');
    if (!section) return;
    const list = section.querySelector('[data-role="property-grid-list"]') as HTMLElement | null;
    if (!list) return;

    const config = this.getPropertyGridConfig(section as HTMLElement);
    this.applyPropertyGridStyle(section as HTMLElement);
    const source = await this.getPropertyGridSource(config.mode, config.api);
    const filtered = this.applyPropertyFilters(source).slice(0, config.limit);
    list.innerHTML = filtered.map(property => this.renderPropertyCard(property)).join('');

    Array.from(list.querySelectorAll('[data-role="property-card"]')).forEach(card => {
      card.addEventListener('click', () => {
        const id = (card as HTMLElement).dataset['id'];
        const property = filtered.find(item => item.id === id);
        if (property) {
          this.showPropertyModal(property);
        }
      });
    });
  }

  private applyPropertyFilters(properties: Property[]): Property[] {
    let filtered = [...properties];
    const term = this.currentFilters.term?.toLowerCase();
    const city = this.currentFilters.city?.toLowerCase();

    if (term) {
      filtered = filtered.filter(p =>
        (p.title || '').toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term) ||
        (p.neighborhood || '').toLowerCase().includes(term)
      );
    }

    if (city) {
      filtered = filtered.filter(p => (p.city || '').toLowerCase().includes(city));
    }

    return filtered;
  }

  private getPropertyGridConfig(section: HTMLElement): { limit: number; mode: 'service' | 'api'; api: string | null } {
    const raw = section.getAttribute('data-config') || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.warn('[public-site] invalid data-config JSON for property-grid', error);
    }
    const limit = Number(parsed.limit) || 6;
    const mode = parsed.mode === 'api' ? 'api' : 'service';
    const api = typeof parsed.api === 'string' && parsed.api.trim().length ? parsed.api.trim() : null;
    return { limit, mode, api };
  }

  private applyPropertyGridStyle(section: HTMLElement) {
    const raw = section.getAttribute('data-style') || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.warn('[public-site] invalid data-style JSON for property-grid', error);
    }
    if (parsed.backgroundColor) {
      section.style.background = parsed.backgroundColor;
    }
    if (parsed.padding) {
      section.style.padding = parsed.padding;
    }
  }

  private async getPropertyGridSource(mode: 'service' | 'api', api: string | null): Promise<Property[]> {
    if (mode === 'api' && api) {
      const cached = this.getApiCache(api);
      if (cached) return cached;
      try {
        const response = await fetch(api);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        this.setApiCache(api, list);
        return list;
      } catch (error) {
        console.error('[public-site] failed to fetch properties from api', error);
        return [];
      }
    }
    return this.properties;
  }

  private getApiCache(apiUrl: string): Property[] | null {
    if (typeof sessionStorage === 'undefined') return null;
    const cached = sessionStorage.getItem(`${this.apiCachePrefix}${apiUrl}`);
    if (!cached) return null;
    try {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private setApiCache(apiUrl: string, data: Property[]) {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(`${this.apiCachePrefix}${apiUrl}`, JSON.stringify(data));
  }

  private renderPropertyCard(property: Property): string {
    const image = property.image_url || (property.image_urls && property.image_urls[0]) || '';
    const price = property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Consulte';
    const location = `${property.neighborhood || property.city || ''}${property.state ? ', ' + property.state : ''}`;
    return `
      <div class="group bg-white dark:bg-background-dark rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" data-role="property-card" data-id="${property.id}">
        <div class="relative h-64">
          <div class="absolute inset-0 bg-cover bg-center" style="background-image:${image ? `url('${image}')` : 'linear-gradient(135deg,#e2e8f0,#f8fafc)'};"></div>
          ${property.featured ? `<div class="absolute top-4 left-4 flex gap-2"><span class="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Destaque</span></div>` : ''}
          <button class="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white p-2 rounded-full transition-all group-hover:text-red-500">
            <span class="material-symbols-outlined text-xl">favorite</span>
          </button>
        </div>
        <div class="p-6">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold group-hover:text-primary transition-colors">${property.title || 'Imovel'}</h3>
            <span class="text-primary font-black text-lg">${price}</span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm flex items-center mb-6">
            <span class="material-symbols-outlined text-sm mr-1">location_on</span>
            ${location || 'Localizacao a definir'}
          </p>
          <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-lg">square_foot</span>
              <span class="text-sm">${property.areaPrivativa || property.areaConstrutiva || property.area || 0}m2</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-lg">bed</span>
              <span class="text-sm">${property.bedrooms || 0} Quartos</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="material-symbols-outlined text-lg">directions_car</span>
              <span class="text-sm">${property.parking || 0} Vagas</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private showPropertyModal(property: Property) {
    this.closePropertyModal();
    const overlay = document.createElement('div');
    overlay.className = 'property-preview-modal';
    const image = property.image_url || (property.image_urls && property.image_urls[0]) || '';
    const price = property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Consulte';
    const location = `${property.neighborhood || property.city || ''}${property.state ? ', ' + property.state : ''}`;
    overlay.innerHTML = `
      <div class="property-preview-card">
        <button class="preview-close" type="button">×</button>
        <div class="preview-media" style="background-image:${image ? `url('${image}')` : 'linear-gradient(135deg,#e2e8f0,#f8fafc)'};"></div>
        <div class="preview-body">
          <h3>${property.title || 'Imovel'}</h3>
          <p class="preview-location">${location || 'Localizacao a definir'}</p>
          <p class="preview-price">${price}</p>
          <p class="preview-description">${property.description || ''}</p>
        </div>
      </div>
    `;
    overlay.addEventListener('click', event => {
      if (event.target === overlay) {
        this.closePropertyModal();
      }
    });
    const closeBtn = overlay.querySelector('.preview-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closePropertyModal());
    }
    document.body.appendChild(overlay);
    this.modalEl = overlay;
  }

  private closePropertyModal() {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }

}
