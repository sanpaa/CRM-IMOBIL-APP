import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TenantResolverService } from './tenant-resolver.service';
import { WebsiteCustomizationService } from './website-customization.service';
import { WebsiteLayout } from '../models/website-layout.model';

/**
 * Service for loading public website configuration based on the current domain
 * 
 * This is used by the public-facing website to:
 * 1. Detect which company's site is being viewed (via domain/hostname)
 * 2. Load that company's website layout and branding
 * 3. Filter properties and content by company_id
 * 
 * Example usage in a public website component:
 * 
 * ```typescript
 * ngOnInit() {
 *   const config = await this.publicSiteService.getSiteConfig();
 *   if (config) {
 *     this.companyName = config.company.name;
 *     this.layout = config.layout;
 *     this.properties = config.properties;
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PublicSiteConfigService {
  private companyId: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private tenantResolver: TenantResolverService,
    private websiteCustomization: WebsiteCustomizationService
  ) {}

  /**
   * Get the complete site configuration for the current domain
   * This includes: company info, website layout, theme settings
   */
  async getSiteConfig(): Promise<SiteConfig | null> {
    try {
      // Step 1: Resolve tenant from domain
      this.companyId = await this.tenantResolver.getCurrentTenant();
      
      if (!this.companyId) {
        console.error('Could not resolve company from domain');
        return null;
      }

      // Step 2: Load company information
      const company = await this.getCompanyInfo(this.companyId);
      if (!company) {
        console.error('Company not found or not active');
        return null;
      }

      // Step 3: Load website layout for home page
      const layout = await this.websiteCustomization.getLayoutByPageType(
        this.companyId, 
        'home'
      );

      // Step 4: Load theme/branding settings
      const theme = await this.getThemeSettings(this.companyId);

      return {
        companyId: this.companyId,
        company,
        layout,
        theme
      };
    } catch (error) {
      console.error('Error loading site config:', error);
      return null;
    }
  }

  /**
   * Get layout for a specific page type
   */
  async getPageLayout(pageType: string): Promise<WebsiteLayout | null> {
    if (!this.companyId) {
      this.companyId = await this.tenantResolver.getCurrentTenant();
    }

    if (!this.companyId) {
      return null;
    }

    return await this.websiteCustomization.getLayoutByPageType(
      this.companyId,
      pageType
    );
  }

  /**
   * Get properties for the current company (for listings page)
   */
  async getProperties(filters?: PropertyFilters): Promise<any[]> {
    if (!this.companyId) {
      this.companyId = await this.tenantResolver.getCurrentTenant();
    }

    if (!this.companyId) {
      return [];
    }

    return this.getPropertiesForCompany(this.companyId, filters);
  }

  async getPropertiesForCompany(companyId: string, filters?: PropertyFilters): Promise<any[]> {
    let query = this.supabase.client
      .from('properties')
      .select('*')
      .eq('company_id', companyId);

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get a single property by ID
   */
  async getProperty(propertyId: string): Promise<any | null> {
    if (!this.companyId) {
      this.companyId = await this.tenantResolver.getCurrentTenant();
    }

    const { data, error } = await this.supabase.client
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('company_id', this.companyId) // Security: ensure property belongs to this company
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      return null;
    }

    return data;
  }

  /**
   * Submit a contact form from the public website
   */
  async submitContactForm(formData: ContactFormData): Promise<boolean> {
    if (!this.companyId) {
      this.companyId = await this.tenantResolver.getCurrentTenant();
    }

    if (!this.companyId) {
      console.error('Cannot submit form: company not resolved');
      return false;
    }

    try {
      // Create a lead/client record
      const { error } = await this.supabase.client
        .from('clients')
        .insert([{
          company_id: this.companyId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.message,
          status: 'novo',
          source: 'website'
        }]);

      if (error) {
        console.error('Error submitting contact form:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in submitContactForm:', error);
      return false;
    }
  }

  /**
   * Get company information
   */
  private async getCompanyInfo(companyId: string): Promise<CompanyInfo | null> {
    const { data, error } = await this.supabase.client
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      return null;
    }

    return data;
  }

  /**
   * Get theme and branding settings
   */
  private async getThemeSettings(companyId: string): Promise<ThemeSettings | null> {
    const { data, error } = await this.supabase.client
      .from('store_settings')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching theme settings:', error);
      return null;
    }

    return data || this.getDefaultTheme();
  }

  /**
   * Get default theme if none is configured
   */
  private getDefaultTheme(): ThemeSettings {
    return {
      primary_color: '#004AAD',
      secondary_color: '#00D084',
      font_family: 'Inter, sans-serif',
      logo_url: null,
      social_links: {},
      business_hours: {},
      header_image: null,
      footer_text: null
    };
  }
}

// Interfaces
export interface SiteConfig {
  companyId: string;
  company: CompanyInfo;
  layout: WebsiteLayout | null;
  theme: ThemeSettings | null;
}

export interface CompanyInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  website_enabled: boolean;
  website_published: boolean;
}

export interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  logo_url: string | null;
  social_links: Record<string, string>;
  business_hours: Record<string, string>;
  header_image: string | null;
  footer_text: string | null;
}

export interface PropertyFilters {
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
