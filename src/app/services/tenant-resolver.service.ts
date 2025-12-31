import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DomainManagementService } from './domain-management.service';

/**
 * Service for resolving the current tenant (company) based on the domain/hostname
 * 
 * This is the key to multi-tenant architecture on Netlify/Vercel:
 * - Detects current hostname (window.location.hostname)
 * - For automatic subdomains (e.g., company1.yoursite.com): extracts subdomain
 * - For custom domains (e.g., www.company1.com.br): queries database
 * - Returns company_id to be used for data filtering
 */
@Injectable({
  providedIn: 'root'
})
export class TenantResolverService {
  private cachedCompanyId: string | null = null;
  private readonly baseHostname = 'yoursite.com'; // Replace with your actual base domain

  constructor(
    private supabase: SupabaseService,
    private domainService: DomainManagementService
  ) {}

  /**
   * Get the current tenant (company_id) based on the hostname
   * This is called by the public website to determine which company's data to show
   */
  async getCurrentTenant(): Promise<string | null> {
    if (this.cachedCompanyId) {
      return this.cachedCompanyId;
    }

    const hostname = this.getHostname();
    
    // For development/localhost
    if (this.isLocalEnvironment(hostname)) {
      console.warn('Running in local environment. Multi-tenant resolution disabled.');
      return null;
    }

    // Check if it's an automatic subdomain
    if (this.isAutomaticSubdomain(hostname)) {
      const subdomain = this.extractSubdomain(hostname);
      const companyId = await this.getCompanyBySubdomain(subdomain);
      this.cachedCompanyId = companyId;
      return companyId;
    }

    // Check if it's a custom domain
    const companyId = await this.getCompanyByCustomDomain(hostname);
    this.cachedCompanyId = companyId;
    return companyId;
  }

  /**
   * Clear the cached company ID (useful for testing or when switching contexts)
   */
  clearCache(): void {
    this.cachedCompanyId = null;
  }

  /**
   * Get the current hostname
   */
  private getHostname(): string {
    return window.location.hostname;
  }

  /**
   * Check if running in local environment
   */
  private isLocalEnvironment(hostname: string): boolean {
    return hostname === 'localhost' || 
           hostname.startsWith('127.0.0.1') || 
           hostname.startsWith('192.168.');
  }

  /**
   * Check if hostname is an automatic subdomain
   * Example: company1.yoursite.com, company2.yoursite.com
   */
  private isAutomaticSubdomain(hostname: string): boolean {
    return hostname.endsWith(`.${this.baseHostname}`) && 
           hostname !== this.baseHostname;
  }

  /**
   * Extract subdomain from hostname
   * Example: company1.yoursite.com -> company1
   */
  private extractSubdomain(hostname: string): string {
    return hostname.split('.')[0];
  }

  /**
   * Get company by subdomain slug
   * This requires a 'subdomain_slug' field in the companies table
   */
  private async getCompanyBySubdomain(subdomain: string): Promise<string | null> {
    try {
      // First, check in custom_domains table for automatic subdomains
      const { data: domainData, error: domainError } = await this.supabase.client
        .from('custom_domains')
        .select('company_id')
        .eq('domain', `${subdomain}.${this.baseHostname}`)
        .eq('is_subdomain_auto', true)
        .eq('status', 'active')
        .single();

      if (domainData && !domainError) {
        return domainData.company_id;
      }

      // Fallback: check companies table if it has a subdomain_slug field
      // You may need to add this field to the companies table
      const { data: companyData, error: companyError } = await this.supabase.client
        .from('companies')
        .select('id')
        .eq('subdomain_slug', subdomain)
        .eq('active', true)
        .single();

      if (companyError) {
        console.error('Error fetching company by subdomain:', companyError);
        return null;
      }

      return companyData?.id || null;
    } catch (error) {
      console.error('Error in getCompanyBySubdomain:', error);
      return null;
    }
  }

  /**
   * Get company by custom domain
   * Example: www.company1.com.br
   */
  private async getCompanyByCustomDomain(hostname: string): Promise<string | null> {
    try {
      // Remove www. prefix for matching
      const domainToMatch = hostname.replace(/^www\./, '');
      
      // Try exact match first
      let { data, error } = await this.supabase.client
        .from('custom_domains')
        .select('company_id')
        .eq('domain', hostname)
        .eq('status', 'active')
        .single();

      // If not found, try without www
      if (!data && hostname.startsWith('www.')) {
        ({ data, error } = await this.supabase.client
          .from('custom_domains')
          .select('company_id')
          .eq('domain', domainToMatch)
          .eq('status', 'active')
          .single());
      }

      if (error) {
        console.error('Error fetching company by custom domain:', error);
        return null;
      }

      return data?.company_id || null;
    } catch (error) {
      console.error('Error in getCompanyByCustomDomain:', error);
      return null;
    }
  }

  /**
   * Get the full domain URL for a company (for generating links)
   */
  async getCompanyUrl(companyId: string): Promise<string> {
    try {
      // Get primary domain for the company
      const domain = await this.domainService.getPrimaryDomain(companyId);
      
      if (domain && domain.status === 'active') {
        return `https://${domain.domain}`;
      }

      // Fallback to subdomain (if available)
      const { data } = await this.supabase.client
        .from('companies')
        .select('subdomain_slug')
        .eq('id', companyId)
        .single();

      if (data?.subdomain_slug) {
        return `https://${data.subdomain_slug}.${this.baseHostname}`;
      }

      // Default fallback
      return `https://${this.baseHostname}`;
    } catch (error) {
      console.error('Error getting company URL:', error);
      return `https://${this.baseHostname}`;
    }
  }
}
