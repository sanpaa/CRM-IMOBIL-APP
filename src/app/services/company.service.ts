import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Company, HeaderConfig, FooterConfig } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(private supabase: SupabaseService) {}

  async getById(id: string): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Company;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }

  async updateStoreSettings(companyId: string, settings: { header_config: HeaderConfig, footer_config: FooterConfig }): Promise<boolean> {
    try {
      console.log('🟢 CompanyService.updateStoreSettings() chamado');
      console.log('🟢 Company ID:', companyId);
      console.log('🟢 Settings:', settings);
      
      const { error } = await this.supabase
        .from('companies')
        .update({
          header_config: settings.header_config,
          footer_config: settings.footer_config
        })
        .eq('id', companyId);

      if (error) {
        console.error('🔴 Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Supabase update bem-sucedido!');
      return true;
    } catch (error) {
      console.error('🔴 Error updating store settings:', error);
      throw error;
    }
  }

  async getStoreSettings(companyId: string): Promise<{ header_config: HeaderConfig, footer_config: FooterConfig } | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('header_config, footer_config')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      return data as { header_config: HeaderConfig, footer_config: FooterConfig };
    } catch (error) {
      console.error('Error fetching store settings:', error);
      return null;
    }
  }
}
