import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CustomDomain, DomainVerification, DnsRecord } from '../models/custom-domain.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DomainManagementService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get all domains for a company
   */
  async getDomains(companyId: string): Promise<CustomDomain[]> {
    const { data, error } = await this.supabase.client
      .from('custom_domains')
      .select('*')
      .eq('company_id', companyId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching domains:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Get a specific domain
   */
  async getDomain(domainId: string): Promise<CustomDomain | null> {
    const { data, error } = await this.supabase.client
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (error) {
      console.error('Error fetching domain:', error);
      throw error;
    }
    return data;
  }

  /**
   * Get domain by domain name
   */
  async getDomainByName(domainName: string): Promise<CustomDomain | null> {
    const { data, error } = await this.supabase.client
      .from('custom_domains')
      .select('*')
      .eq('domain', domainName)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching domain by name:', error);
      throw error;
    }
    return data || null;
  }

  /**
   * Get primary domain for a company
   */
  async getPrimaryDomain(companyId: string): Promise<CustomDomain | null> {
    const { data, error } = await this.supabase.client
      .from('custom_domains')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_primary', true)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching primary domain:', error);
      throw error;
    }
    return data || null;
  }

  /**
   * Add a new custom domain
   */
  async addDomain(domain: Partial<CustomDomain>): Promise<CustomDomain> {
    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    
    const domainData = {
      ...domain,
      verification_token: verificationToken,
      status: 'pending'
    };

    const { data, error } = await this.supabase.client
      .from('custom_domains')
      .insert([domainData])
      .select()
      .single();

    if (error) {
      console.error('Error adding domain:', error);
      throw error;
    }
    return data;
  }

  /**
   * Update domain configuration
   */
  async updateDomain(domainId: string, updates: Partial<CustomDomain>): Promise<CustomDomain> {
    const { data, error } = await this.supabase.client
      .from('custom_domains')
      .update(updates)
      .eq('id', domainId)
      .select()
      .single();

    if (error) {
      console.error('Error updating domain:', error);
      throw error;
    }
    return data;
  }

  /**
   * Delete a domain
   */
  async deleteDomain(domainId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('custom_domains')
      .delete()
      .eq('id', domainId);

    if (error) {
      console.error('Error deleting domain:', error);
      throw error;
    }
  }

  /**
   * Set a domain as primary
   */
  async setPrimaryDomain(domainId: string, companyId: string): Promise<void> {
    // First, remove primary flag from all domains for this company
    await this.supabase.client
      .from('custom_domains')
      .update({ is_primary: false })
      .eq('company_id', companyId);

    // Then set this one as primary
    await this.updateDomain(domainId, { is_primary: true });

    // Update company's custom_domain field
    await this.supabase.client
      .from('companies')
      .update({ custom_domain: (await this.getDomain(domainId))?.domain })
      .eq('id', companyId);
  }

  /**
   * Verify domain ownership via DNS
   * 
   * NOTE: This is a simplified implementation for demonstration.
   * In a real Netlify/Vercel SaaS deployment:
   * 
   * For AUTOMATIC SUBDOMAINS (company.yoursite.com):
   * - These work automatically with SSL via Netlify
   * - No DNS verification needed
   * - Mark as active immediately
   * 
   * For CUSTOM DOMAINS (company's own domain):
   * - Must be added manually in Netlify/Vercel dashboard
   * - This function just records that admin manually verified DNS
   * - SSL is handled by Netlify/Vercel automatically after DNS propagates
   * 
   * This function should be called AFTER:
   * 1. Admin verifies DNS is pointed correctly
   * 2. Domain is added in hosting platform (if custom domain)
   */
  async verifyDomain(domainId: string): Promise<boolean> {
    const domain = await this.getDomain(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }

    // For automatic subdomains, mark as active immediately
    // For custom domains, mark as verified (admin confirms DNS is configured)
    const updates: Partial<CustomDomain> = {
      status: domain.is_subdomain_auto ? 'active' : 'verified',
      verified_at: new Date().toISOString(),
      dns_configured: true
    };

    await this.updateDomain(domainId, updates);
    return true;
  }

  /**
   * Get DNS configuration instructions for a domain
   * 
   * For Netlify/Vercel deployment:
   * - Automatic subdomains don't need DNS configuration
   * - Custom domains need CNAME pointing to your Netlify/Vercel site
   */
  getDnsInstructions(domain: CustomDomain): DomainVerification {
    // For automatic subdomains, no DNS configuration needed
    if (domain.is_subdomain_auto) {
      return {
        domain: domain.domain,
        token: domain.verification_token || '',
        verified: true,
        dns_records: []
      };
    }

    // For custom domains on Netlify/Vercel
    const deploymentUrl = environment.tenant.deploymentUrl;
    const records: DnsRecord[] = [
      {
        type: 'CNAME',
        host: 'www',
        value: deploymentUrl,
        ttl: 3600
      },
      {
        type: 'CNAME',
        host: '@',
        value: deploymentUrl, // Or use ALIAS record if provider supports
        ttl: 3600
      }
    ];

    return {
      domain: domain.domain,
      token: domain.verification_token || '',
      verified: domain.status === 'verified' || domain.status === 'active',
      dns_records: records
    };
  }

  /**
   * Activate a verified custom domain
   * For custom domains: Admin must first add domain in Netlify/Vercel dashboard
   * Then call this to mark the domain as active in the system
   */
  async activateDomain(domainId: string): Promise<void> {
    const domain = await this.getDomain(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }

    if (domain.status !== 'verified') {
      throw new Error('Domain must be verified before activation');
    }

    await this.updateDomain(domainId, {
      status: 'active'
    });
  }

  /**
   * Generate a random verification token
   */
  private generateVerificationToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'crm-verify-';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Validate domain format
   */
  validateDomainFormat(domain: string): { valid: boolean; error?: string } {
    // Basic domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    
    if (!domain || domain.trim() === '') {
      return { valid: false, error: 'Domain cannot be empty' };
    }

    if (!domainRegex.test(domain)) {
      return { valid: false, error: 'Invalid domain format' };
    }

    if (domain.length > 253) {
      return { valid: false, error: 'Domain name too long' };
    }

    // Check for common invalid patterns
    if (domain.startsWith('-') || domain.endsWith('-')) {
      return { valid: false, error: 'Domain cannot start or end with hyphen' };
    }

    return { valid: true };
  }
}
