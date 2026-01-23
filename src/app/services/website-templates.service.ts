import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WebsiteTemplate } from '../models/website-template.model';

@Injectable({
  providedIn: 'root'
})
export class WebsiteTemplatesService {
  constructor(private supabase: SupabaseService) {}

  async getTemplates(): Promise<WebsiteTemplate[]> {
    const { data, error } = await this.supabase.client
      .from('website_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    return data || [];
  }

  async createTemplate(template: Partial<WebsiteTemplate>): Promise<WebsiteTemplate> {
    const { data, error } = await this.supabase.client
      .from('website_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    return data;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('website_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }
}
