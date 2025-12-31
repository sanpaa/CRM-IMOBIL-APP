import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WebsiteComponent } from '../models/website-component.model';

@Injectable({
  providedIn: 'root'
})
export class ComponentLibraryService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get all components for a company
   */
  async getComponents(companyId: string): Promise<WebsiteComponent[]> {
    const { data, error } = await this.supabase.getClient()
      .from('website_components')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching components:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Get components by type
   */
  async getComponentsByType(companyId: string, componentType: string): Promise<WebsiteComponent[]> {
    const { data, error } = await this.supabase.getClient()
      .from('website_components')
      .select('*')
      .eq('company_id', companyId)
      .eq('component_type', componentType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching components by type:', error);
      throw error;
    }
    return data || [];
  }

  /**
   * Get a specific component
   */
  async getComponent(componentId: string): Promise<WebsiteComponent | null> {
    const { data, error } = await this.supabase.getClient()
      .from('website_components')
      .select('*')
      .eq('id', componentId)
      .single();

    if (error) {
      console.error('Error fetching component:', error);
      throw error;
    }
    return data;
  }

  /**
   * Create a new component
   */
  async createComponent(component: Partial<WebsiteComponent>): Promise<WebsiteComponent> {
    const { data, error } = await this.supabase.getClient()
      .from('website_components')
      .insert([component])
      .select()
      .single();

    if (error) {
      console.error('Error creating component:', error);
      throw error;
    }
    return data;
  }

  /**
   * Update a component
   */
  async updateComponent(componentId: string, updates: Partial<WebsiteComponent>): Promise<WebsiteComponent> {
    const { data, error } = await this.supabase.getClient()
      .from('website_components')
      .update(updates)
      .eq('id', componentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating component:', error);
      throw error;
    }
    return data;
  }

  /**
   * Delete a component
   */
  async deleteComponent(componentId: string): Promise<void> {
    const { error } = await this.supabase.getClient()
      .from('website_components')
      .delete()
      .eq('id', componentId);

    if (error) {
      console.error('Error deleting component:', error);
      throw error;
    }
  }

  /**
   * Duplicate a component
   */
  async duplicateComponent(componentId: string, newName: string): Promise<WebsiteComponent> {
    const original = await this.getComponent(componentId);
    if (!original) {
      throw new Error('Component not found');
    }

    const duplicate = {
      company_id: original.company_id,
      name: newName,
      component_type: original.component_type,
      config: original.config,
      style_config: original.style_config,
      is_reusable: original.is_reusable
    };

    return this.createComponent(duplicate);
  }

  /**
   * Get default component configurations
   */
  getDefaultComponentConfig(componentType: string): any {
    const defaults: Record<string, any> = {
      header: {
        config: {
          logo: '',
          showSearch: true,
          navigation: [
            { label: 'Home', link: '/' },
            { label: 'Imóveis', link: '/properties' },
            { label: 'Contato', link: '/contact' }
          ]
        },
        style_config: {
          backgroundColor: '#ffffff',
          textColor: '#333333'
        }
      },
      footer: {
        config: {
          columns: [
            {
              title: 'Sobre Nós',
              links: [
                { label: 'Quem Somos', link: '/about' },
                { label: 'Contato', link: '/contact' }
              ]
            }
          ],
          showSocialMedia: true,
          copyrightText: 'Todos os direitos reservados'
        },
        style_config: {
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff'
        }
      },
      hero: {
        config: {
          title: 'Encontre seu imóvel ideal',
          subtitle: 'As melhores opções do mercado',
          backgroundImage: '',
          buttonText: 'Ver Imóveis',
          buttonLink: '/properties',
          height: 'large',
          alignment: 'center'
        },
        style_config: {
          backgroundColor: '#004AAD',
          textColor: '#ffffff'
        }
      },
      'search-bar': {
        config: {
          fields: ['type', 'city', 'priceRange', 'bedrooms'],
          placeholder: 'Buscar imóveis...',
          buttonText: 'Buscar',
          orientation: 'horizontal'
        },
        style_config: {
          backgroundColor: '#f5f5f5',
          textColor: '#333333'
        }
      },
      'property-grid': {
        config: {
          limit: 6,
          showFeatured: true,
          columns: 3,
          showFilters: false,
          sortBy: 'date'
        },
        style_config: {}
      },
      'contact-form': {
        config: {
          fields: ['name', 'email', 'phone', 'message'],
          submitText: 'Enviar Mensagem',
          showWhatsApp: true
        },
        style_config: {
          backgroundColor: '#ffffff',
          padding: '2rem'
        }
      },
      'text-block': {
        config: {
          title: 'Título',
          content: 'Seu conteúdo aqui...',
          alignment: 'left'
        },
        style_config: {
          padding: '2rem'
        }
      },
      'image-gallery': {
        config: {
          images: [],
          layout: 'grid',
          columns: 3,
          showCaptions: true
        },
        style_config: {}
      },
      'stats-section': {
        config: {
          stats: [
            { label: 'Imóveis', value: '100+', icon: '🏠' },
            { label: 'Clientes', value: '500+', icon: '👥' },
            { label: 'Anos', value: '10+', icon: '⭐' }
          ],
          layout: 'horizontal'
        },
        style_config: {
          backgroundColor: '#f8f9fa',
          padding: '3rem'
        }
      },
      divider: {
        config: {
          style: 'solid',
          thickness: '1px',
          color: '#e0e0e0'
        },
        style_config: {
          margin: '2rem 0'
        }
      },
      spacer: {
        config: {
          height: '2rem'
        },
        style_config: {}
      }
    };

    return defaults[componentType] || { config: {}, style_config: {} };
  }

  /**
   * Get available component types with metadata
   */
  getAvailableComponentTypes() {
    return [
      {
        type: 'header',
        label: 'Header',
        icon: '📄',
        category: 'navigation',
        description: 'Site header with logo and navigation'
      },
      {
        type: 'footer',
        label: 'Footer',
        icon: '📄',
        category: 'navigation',
        description: 'Site footer with links and info'
      },
      {
        type: 'hero',
        label: 'Hero Section',
        icon: '🖼️',
        category: 'content',
        description: 'Large banner with title and CTA'
      },
      {
        type: 'property-grid',
        label: 'Property Grid',
        icon: '🏘️',
        category: 'properties',
        description: 'Grid of property listings'
      },
      {
        type: 'search-bar',
        label: 'Search Bar',
        icon: '🔍',
        category: 'properties',
        description: 'Property search form'
      },
      {
        type: 'contact-form',
        label: 'Contact Form',
        icon: '📧',
        category: 'forms',
        description: 'Contact form with fields'
      },
      {
        type: 'text-block',
        label: 'Text Block',
        icon: '📝',
        category: 'content',
        description: 'Rich text content'
      },
      {
        type: 'image-gallery',
        label: 'Image Gallery',
        icon: '🖼️',
        category: 'media',
        description: 'Image gallery or carousel'
      },
      {
        type: 'stats-section',
        label: 'Statistics',
        icon: '📊',
        category: 'content',
        description: 'Display key statistics'
      },
      {
        type: 'map-section',
        label: 'Map',
        icon: '🗺️',
        category: 'media',
        description: 'Location map'
      },
      {
        type: 'testimonials',
        label: 'Testimonials',
        icon: '💬',
        category: 'content',
        description: 'Customer testimonials'
      },
      {
        type: 'divider',
        label: 'Divider',
        icon: '➖',
        category: 'layout',
        description: 'Horizontal line separator'
      },
      {
        type: 'spacer',
        label: 'Spacer',
        icon: '↕️',
        category: 'layout',
        description: 'Empty space'
      }
    ];
  }
}
