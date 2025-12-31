import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WebsiteLayout, LayoutConfig } from '../models/website-layout.model';

@Injectable({
  providedIn: 'root'
})
export class WebsiteCustomizationService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get all layouts for a company
   */
  async getLayouts(companyId: string): Promise<WebsiteLayout[]> {
    const { data, error } = await this.supabase.client
      .from('website_layouts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching layouts:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Get a specific layout by ID
   */
  async getLayout(layoutId: string): Promise<WebsiteLayout | null> {
    const { data, error } = await this.supabase.client
      .from('website_layouts')
      .select('*')
      .eq('id', layoutId)
      .single();

    if (error) {
      console.error('Error fetching layout:', error);
      throw error;
    }
    return data;
  }

  /**
   * Get layout by page type
   */
  async getLayoutByPageType(companyId: string, pageType: string): Promise<WebsiteLayout | null> {
    const { data, error } = await this.supabase.client
      .from('website_layouts')
      .select('*')
      .eq('company_id', companyId)
      .eq('page_type', pageType)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching layout by page type:', error);
      throw error;
    }
    return data || null;
  }

  /**
   * Create a new layout
   */
  async createLayout(layout: Partial<WebsiteLayout>): Promise<WebsiteLayout> {
    const { data, error } = await this.supabase.client
      .from('website_layouts')
      .insert([layout])
      .select()
      .single();

    if (error) {
      console.error('Error creating layout:', error);
      throw error;
    }
    return data;
  }

  /**
   * Update an existing layout
   */
  async updateLayout(layoutId: string, updates: Partial<WebsiteLayout>): Promise<WebsiteLayout> {
    const { data, error } = await this.supabase.client
      .from('website_layouts')
      .update(updates)
      .eq('id', layoutId)
      .select()
      .single();

    if (error) {
      console.error('Error updating layout:', error);
      throw error;
    }
    return data;
  }

  /**
   * Update layout configuration (the drag & drop structure)
   */
  async updateLayoutConfig(layoutId: string, layoutConfig: LayoutConfig): Promise<WebsiteLayout> {
    return this.updateLayout(layoutId, { layout_config: layoutConfig });
  }

  /**
   * Delete a layout
   */
  async deleteLayout(layoutId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('website_layouts')
      .delete()
      .eq('id', layoutId);

    if (error) {
      console.error('Error deleting layout:', error);
      throw error;
    }
  }

  /**
   * Duplicate a layout
   */
  async duplicateLayout(layoutId: string, newName: string): Promise<WebsiteLayout> {
    const original = await this.getLayout(layoutId);
    if (!original) {
      throw new Error('Layout not found');
    }

    const duplicate = {
      company_id: original.company_id,
      name: newName,
      page_type: original.page_type,
      layout_config: original.layout_config,
      meta_title: original.meta_title,
      meta_description: original.meta_description,
      meta_keywords: original.meta_keywords,
      is_active: false,
      is_default: false
    };

    return this.createLayout(duplicate);
  }

  /**
   * Set a layout as default for its page type
   */
  async setDefaultLayout(layoutId: string): Promise<void> {
    const layout = await this.getLayout(layoutId);
    if (!layout) {
      throw new Error('Layout not found');
    }

    // First, remove default flag from all layouts of this page type
    await this.supabase.client
      .from('website_layouts')
      .update({ is_default: false })
      .eq('company_id', layout.company_id)
      .eq('page_type', layout.page_type);

    // Then set this one as default
    await this.updateLayout(layoutId, { is_default: true, is_active: true });
  }

  /**
   * Publish/unpublish a layout
   */
  async toggleLayoutActive(layoutId: string, isActive: boolean): Promise<WebsiteLayout> {
    return this.updateLayout(layoutId, { is_active: isActive });
  }

  /**
   * Get default layout template for a page type
   */
  getDefaultLayoutTemplate(pageType: string, companyId: string): Partial<WebsiteLayout> {
    const templates: Record<string, any> = {
      home: {
        name: 'Home Page',
        page_type: 'home',
        company_id: companyId,
        is_active: true,
        is_default: true,
        layout_config: {
          sections: [
            { id: 'header', type: 'header', order: 1 },
            { 
              id: 'hero', 
              type: 'hero', 
              order: 2,
              config: { 
                title: 'Encontre seu imóvel ideal', 
                subtitle: 'As melhores opções do mercado',
                height: 'large',
                alignment: 'center'
              }
            },
            { id: 'search', type: 'search-bar', order: 3 },
            { 
              id: 'properties', 
              type: 'property-grid', 
              order: 4,
              config: { limit: 6, showFeatured: true, columns: 3 }
            },
            { id: 'footer', type: 'footer', order: 5 }
          ]
        }
      },
      properties: {
        name: 'Properties Listing',
        page_type: 'properties',
        company_id: companyId,
        is_active: true,
        is_default: true,
        layout_config: {
          sections: [
            { id: 'header', type: 'header', order: 1 },
            { 
              id: 'search', 
              type: 'search-bar', 
              order: 2,
              config: { fields: ['type', 'city', 'priceRange', 'bedrooms'] }
            },
            { 
              id: 'properties', 
              type: 'property-grid', 
              order: 3,
              config: { showFilters: true, columns: 3 }
            },
            { id: 'footer', type: 'footer', order: 4 }
          ]
        }
      },
      contact: {
        name: 'Contact Page',
        page_type: 'contact',
        company_id: companyId,
        is_active: true,
        is_default: true,
        layout_config: {
          sections: [
            { id: 'header', type: 'header', order: 1 },
            { 
              id: 'contact-form', 
              type: 'contact-form', 
              order: 2,
              config: { 
                fields: ['name', 'email', 'phone', 'message'],
                showWhatsApp: true
              }
            },
            { id: 'map', type: 'map-section', order: 3 },
            { id: 'footer', type: 'footer', order: 4 }
          ]
        }
      }
    };

    return templates[pageType] || templates['home'];
  }
}
