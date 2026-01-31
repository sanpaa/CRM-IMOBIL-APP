import { Injectable } from '@angular/core';
import { WebsiteCustomizationService } from './website-customization.service';
import { WebsiteLayout } from '../models/website-layout.model';
import { SimpleSiteLayoutConfig, SiteConfig } from '../models/site-config.model';

@Injectable({
  providedIn: 'root'
})
export class SimpleSiteConfigService {
  constructor(private customization: WebsiteCustomizationService) {}

  async getLayout(companyId: string): Promise<WebsiteLayout | null> {
    return this.customization.getLayoutByPageType(companyId, 'home');
  }

  extractSimpleConfig(layout: WebsiteLayout | null): SimpleSiteLayoutConfig | null {
    if (!layout || !layout.layout_config) return null;
    const config = layout.layout_config as Partial<SimpleSiteLayoutConfig> | null;
    if (!config || typeof config !== 'object') return null;
    if (!config.templateId || !config.config) return null;
    return {
      version: Number(config.version) || 1,
      templateId: config.templateId,
      config: config.config as SiteConfig
    };
  }

  async saveSimpleConfig(
    companyId: string,
    payload: SimpleSiteLayoutConfig,
    html?: string,
    css?: string
  ): Promise<WebsiteLayout> {
    const existing = await this.getLayout(companyId);
    const layoutConfig = {
      version: payload.version || 1,
      templateId: payload.templateId,
      config: payload.config
    };

    if (existing) {
      return this.customization.updateLayout(existing.id, {
        layout_config: layoutConfig,
        html: html ?? '',
        css: css ?? '',
        html_url: null,
        css_url: null,
        is_active: true,
        is_default: true
      });
    }

    return this.customization.createLayout({
      company_id: companyId,
      name: 'Home',
      page_type: 'home',
      is_active: true,
      is_default: true,
      layout_config: layoutConfig,
      html: html ?? '',
      css: css ?? '',
      html_url: null,
      css_url: null
    });
  }

  async publish(companyId: string): Promise<void> {
    const existing = await this.getLayout(companyId);
    if (!existing) return;
    await this.customization.updateLayout(existing.id, {
      is_active: true,
      is_default: true
    });
  }
}
