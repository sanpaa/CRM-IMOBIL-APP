import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PopupService } from '../../shared/services/popup.service';
import { CompanyService } from '../../services/company.service';
import { SiteTemplateService, TemplateIndexItem } from '../../services/site-template.service';
import { SimpleSiteConfigService } from '../../services/simple-site-config.service';
import { SiteConfig, SimpleSiteLayoutConfig } from '../../models/site-config.model';
import { TemplateDefinition } from '../../models/template-definition.model';
import { SitePreviewComponent } from '../site-preview/site-preview.component';
import { PublicSiteConfigService } from '../../services/public-site-config.service';
import { Property } from '../../models/property.model';
import { SitePreviewStore } from '../../services/site-preview.store';

@Component({
  selector: 'app-public-site-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent, SitePreviewComponent],
  templateUrl: './public-site-settings.component.html',
  styleUrls: ['./public-site-settings.component.scss']
})
export class PublicSiteSettingsComponent implements OnInit, OnDestroy {
  companyId: string | null = null;
  loading = true;
  saving = false;
  saved = false;
  private companyDefaults = {
    logo: '',
    whatsapp: ''
  };
  templates: TemplateIndexItem[] = [];
  selectedTemplateId = '';
  selectedTemplate: TemplateDefinition | null = null;
  baseCss = '';
  baseHtml = '';
  previewHtml: SafeHtml = '';
  properties: Property[] = [];
  selectedTemplateGroup = 'all';
  templateGroups = [
    { id: 'all', label: 'Todos' },
    { id: 'classic', label: 'Classicos', ids: ['classico-imobiliaria-v1', 'corporate-blue-v1', 'minimal-clean-v1'] },
    { id: 'modern', label: 'Modernos', ids: ['modern-dark-v1', 'urban-grid-v1', 'marketplace-pro-v1', 'launch-landing-v1', 'high-conversion-v1'] },
    { id: 'luxo', label: 'Alto padrao', ids: ['luxury-prime-v1', 'alto-padrao-v1'] },
    { id: 'lifestyle', label: 'Lifestyle', ids: ['tropical-coast-v1', 'portfolio-broker-v1'] }
  ];

  config: SiteConfig = {
    companyName: '',
    logo: '',
    primaryColor: '#2563EB',
    secondaryColor: '#0F172A',
    accentColor: '#22C55E',
    backgroundColor: '#FFFFFF',
    whatsapp: '',
    heroTitle: 'Encontre seu imóvel ideal',
    heroText: 'Imóveis selecionados com atendimento humano e rápido.',
    aboutText: 'Somos uma imobiliária com foco em transparência e curadoria.',
    contactText: 'Fale com nosso time e agende sua visita hoje mesmo.',
    footerTagline: 'Institucional',
    footerText: 'Especialistas em compra, venda e locação de imóveis.',
    footerLinksTitle: 'Institucional',
    footerBadge: '',
    instagram: '',
    facebook: '',
    youtube: '',
    linkedin: ''
  };

  private save$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private companyService: CompanyService,
    private templateService: SiteTemplateService,
    private simpleConfigService: SimpleSiteConfigService,
    private publicSiteConfig: PublicSiteConfigService,
    private popupService: PopupService,
    private previewStore: SitePreviewStore,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const companyId = localStorage.getItem('company_id');
    if (!companyId || companyId === 'null' || companyId === 'undefined') {
      this.popupService.alert('Erro: Sessão inválida. Faça login novamente.', { title: 'Aviso', tone: 'warning' });
      this.loading = false;
      return;
    }

    this.companyId = companyId;

    this.save$
      .pipe(debounceTime(700), takeUntil(this.destroy$))
      .subscribe(() => void this.persist());

    await this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadInitialData() {
    this.loading = true;
    try {
      this.templates = await this.templateService.getTemplateIndex();
      const company = await this.companyService.getById(this.companyId!);

      if (company) {
        this.config.companyName = company.name || this.config.companyName;
        this.config.logo =
          company.logo_url ||
          company.footer_config?.logoUrl ||
          company.header_config?.logoUrl ||
          this.config.logo;
        this.config.whatsapp = company.whatsapp || company.phone || this.config.whatsapp;
        this.companyDefaults.logo = company.logo_url
          || company.footer_config?.logoUrl
          || company.header_config?.logoUrl
          || '';
        this.companyDefaults.whatsapp = company.whatsapp || company.phone || '';
      }

      const layout = await this.simpleConfigService.getLayout(this.companyId!);
      const existing = this.simpleConfigService.extractSimpleConfig(layout);

      if (existing) {
        this.selectedTemplateId = existing.templateId;
        this.config = { ...this.config, ...existing.config };
      } else if (this.templates.length) {
        this.selectedTemplateId = this.templates[0].id;
      }

      await this.loadTemplate(this.selectedTemplateId);
      this.config = this.applyColorDefaults(this.config, this.selectedTemplate);
      this.previewStore.setConfig({ ...this.config });
      this.properties = await this.publicSiteConfig.getPropertiesForCompany(this.companyId!);
      this.updatePreview();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais', error);
      this.popupService.alert('Erro ao carregar dados iniciais', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.loading = false;
    }
  }

  async loadTemplate(templateId: string) {
    if (!templateId) return;
    this.selectedTemplate = await this.templateService.loadTemplate(templateId);
    this.baseCss = await this.templateService.loadBaseCss(templateId);
    this.baseHtml = await this.templateService.loadBaseHtml(templateId);

    this.config = this.applyColorDefaults(this.config, this.selectedTemplate);
    this.previewStore.setTemplate(this.selectedTemplate);
    this.updatePreview();
  }

  async onTemplateSelect(templateId: string) {
    this.selectedTemplateId = templateId;
    await this.loadTemplate(templateId);
    this.applyThemeColors();
    this.scheduleSave();
  }

  onAccordionClick(event: Event) {
    const summary = event.currentTarget as HTMLElement | null;
    const details = summary?.closest('details') as HTMLDetailsElement | null;
    if (!summary || !details) return;

    event.preventDefault();
    if (details.dataset['animating'] === 'true') return;

    const body = details.querySelector('.accordion-body') as HTMLElement | null;
    if (!body) return;

    details.dataset['animating'] = 'true';
    details.style.overflow = 'hidden';

    const startHeight = details.offsetHeight;
    const isOpening = !details.open;

    if (isOpening) {
      details.open = true;
    }

    const endHeight = summary.offsetHeight + (isOpening ? body.scrollHeight : 0);

    const animation = details.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: 260, easing: 'ease' }
    );

    animation.onfinish = () => {
      details.style.height = '';
      details.style.overflow = '';
      details.dataset['animating'] = 'false';
      if (!isOpening) {
        details.open = false;
      }
    };
  }

  get filteredTemplates(): TemplateIndexItem[] {
    if (this.selectedTemplateGroup === 'all') {
      return this.templates;
    }
    const group = this.templateGroups.find(g => g.id === this.selectedTemplateGroup);
    if (!group || !group.ids) return this.templates;
    const idSet = new Set(group.ids);
    return this.templates.filter(item => idSet.has(item.id));
  }

  scheduleSave() {
    this.saved = false;
    this.save$.next();
    this.previewStore.setConfig({ ...this.config });
    this.updatePreview();
  }

  async persist() {
    if (!this.companyId || !this.selectedTemplateId) return;
    this.saving = true;

    const payload: SimpleSiteLayoutConfig = {
      version: 1,
      templateId: this.selectedTemplateId,
      config: this.config
    };

    try {
      const baseHtml = this.baseHtml || await this.templateService.loadBaseHtml(this.selectedTemplateId);
      const baseCss = this.baseCss || await this.templateService.loadBaseCss(this.selectedTemplateId);
      const effectiveConfig: SiteConfig = {
        ...this.config,
        logo: this.config.logo || this.companyDefaults.logo,
        whatsapp: this.config.whatsapp || this.companyDefaults.whatsapp
      };
      const normalizedConfig = this.applyColorDefaults(effectiveConfig, this.selectedTemplate);
      const htmlBody = this.interpolateTemplate(baseHtml, normalizedConfig, this.properties);
      const html = `<style>${baseCss}</style>${htmlBody}`;
      const payloadWithDefaults: SimpleSiteLayoutConfig = {
        ...payload,
        config: normalizedConfig
      };
      await this.simpleConfigService.saveSimpleConfig(this.companyId, payloadWithDefaults, html, baseCss);
      this.saved = true;
      setTimeout(() => (this.saved = false), 2000);
    } catch (error) {
      console.error('Erro ao salvar site', error);
      this.popupService.alert('Erro ao salvar site', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.saving = false;
    }
  }

  async publish() {
    if (!this.companyId) return;
    this.saving = true;
    try {
      await this.simpleConfigService.publish(this.companyId);
      this.popupService.alert('Site publicado com sucesso!', { title: 'Sucesso', tone: 'info' });
    } catch (error) {
      console.error('Erro ao publicar site', error);
      this.popupService.alert('Erro ao publicar site', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.saving = false;
    }
  }

  private interpolateTemplate(template: string, config: SiteConfig, properties: Property[] = []): string {
    const whatsappLink = this.getWhatsappLink(config.whatsapp);
    const propertyCards = this.buildPropertyCards(properties);
    const tokens: Record<string, string> = {
      companyName: config.companyName || '',
      logo: config.logo || '',
      primaryColor: config.primaryColor || '',
      secondaryColor: config.secondaryColor || '',
      accentColor: config.accentColor || '',
      backgroundColor: config.backgroundColor || '',
      whatsapp: config.whatsapp || '',
      whatsappLink,
      heroTitle: config.heroTitle || '',
      heroText: config.heroText || '',
      aboutText: config.aboutText || '',
      contactText: config.contactText || '',
      footerTagline: config.footerTagline || '',
      footerText: config.footerText || '',
      footerLinksTitle: config.footerLinksTitle || '',
      footerBadge: config.footerBadge || '',
      instagram: config.instagram || '#',
      facebook: config.facebook || '#',
      youtube: config.youtube || '#',
      linkedin: config.linkedin || '#',
      propertyCards
    };

    let filled = template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : '';
    });
    if (!config.logo) {
      return filled.replace(/<img[^>]*class=\"logo\"[^>]*>/gi, '');
    }
    return filled;
  }

  private applyColorDefaults(config: SiteConfig, template?: TemplateDefinition | null): SiteConfig {
    const theme = template?.theme;
    const primary = config.primaryColor || theme?.primary || '';
    const secondary = config.secondaryColor || theme?.secondary || primary;
    const accent = config.accentColor || theme?.accent || primary;
    const background = config.backgroundColor || theme?.background || secondary;
    return {
      ...config,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      backgroundColor: background
    };
  }

  private applyThemeColors() {
    if (!this.selectedTemplate) return;
    this.config = {
      ...this.config,
      primaryColor: this.selectedTemplate.theme.primary || this.config.primaryColor,
      secondaryColor: this.selectedTemplate.theme.secondary || this.config.secondaryColor,
      accentColor: this.selectedTemplate.theme.accent || this.config.accentColor,
      backgroundColor: this.selectedTemplate.theme.background || this.config.backgroundColor
    };
    this.previewStore.setConfig({ ...this.config });
    this.updatePreview();
  }

  private getWhatsappLink(raw?: string | null): string {
    let normalized = (raw || '').replace(/\D/g, '');
    if (!normalized) return '#';
    if (normalized.length <= 11 && !normalized.startsWith('55')) {
      normalized = `55${normalized}`;
    }
    return `https://wa.me/${normalized}`;
  }

  private updatePreview() {
    if (!this.baseHtml) {
      this.previewHtml = '';
      return;
    }
    const normalizedConfig = this.applyColorDefaults(this.config, this.selectedTemplate);
    const htmlBody = this.interpolateTemplate(this.baseHtml, normalizedConfig, this.properties);
    const html = `<style>${this.baseCss || ''}</style>${htmlBody}`;
    this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private buildPropertyCards(properties: Property[]): string {
    const list = Array.isArray(properties) ? properties : [];
    const cards = list.filter(property => !property.sold).slice(0, 6);
    const items = cards.length
      ? cards
      : [
        { title: 'Imovel em destaque', city: 'Cidade', price: null, image: '' },
        { title: 'Imovel em destaque', city: 'Cidade', price: null, image: '' },
        { title: 'Imovel em destaque', city: 'Cidade', price: null, image: '' }
      ];

    return items.map((property: any) => {
      const title = property.title || property.name || 'Imovel em destaque';
      const city = property.city || property.neighborhood || property.state || 'Cidade';
      const price = property.price ? `R$ ${property.price.toLocaleString('pt-BR')}` : 'Consulte';
      const image = property.image_url || (property.image_urls && property.image_urls[0]) || property.image || '';
      const imageStyle = image ? ` style="background-image:url('${image}');background-size:cover;background-position:center;"` : '';
      const link = property.id ? `/imovel/${property.id}` : '#';
      return `
        <a class="card-link" href="${link}">
          <article class="card">
            <div class="thumb"${imageStyle}></div>
            <div class="info">
              <h3>${title}</h3>
              <p>${city}</p>
              <span class="price">${price}</span>
            </div>
          </article>
        </a>
      `;
    }).join('');
  }
}
