import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicSiteApiService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor() {}

  /**
   * Busca configuração completa do site por companyId
   */
  async getSiteConfigByCompanyId(companyId: string): Promise<any> {
    try {
      console.log('🟢 Buscando site config para company:', companyId);
      
      const response = await fetch(`${this.apiUrl}/site-config/by-company/${companyId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Site config recebido:', data);
      
      return data;
    } catch (error) {
      console.error('🔴 Erro ao buscar site config:', error);
      throw error;
    }
  }

  /**
   * Busca configuração completa do site por domínio
   */
  async getSiteConfigByDomain(domain: string): Promise<any> {
    try {
      console.log('🟢 Buscando site config para domínio:', domain);
      
      const response = await fetch(`${this.apiUrl}/site-config?domain=${encodeURIComponent(domain)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Site config recebido:', data);
      
      return data;
    } catch (error) {
      console.error('🔴 Erro ao buscar site config:', error);
      throw error;
    }
  }

  /**
   * Busca propriedades em destaque
   */
  async getFeaturedProperties(domain: string, limit: number = 6): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/site-config/properties?domain=${encodeURIComponent(domain)}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('🔴 Erro ao buscar propriedades:', error);
      throw error;
    }
  }
}
