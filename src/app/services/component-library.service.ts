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
    const { data, error } = await this.supabase.client
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
    const { data, error } = await this.supabase.client
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
    const { data, error } = await this.supabase.client
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
    const { data, error } = await this.supabase.client
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
    const { data, error } = await this.supabase.client
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
    const { error } = await this.supabase.client
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
          companyName: 'Imobiliária',
          logoUrl: '',
          showLogo: true,
          showMenu: true,
          phone: '',
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
          companyName: 'Imobiliária',
          description: 'Especialistas em imoveis de alto padrao.',
          logoUrl: '',
          showLogo: false,
          address: '',
          phone: '',
          email: '',
          instagram: '',
          facebook: '',
          whatsapp: '',
          quickLinks: [
            { label: 'Quem Somos', route: '/sobre' },
            { label: 'Contato', route: '/contato' }
          ],
          services: [
            { label: 'Venda de imoveis', route: '/imoveis' },
            { label: 'Locacao', route: '/imoveis?tipo=locacao' }
          ],
          showCopyright: true
        },
        style_config: {
          backgroundColor: '#0f172a',
          textColor: '#f8fafc'
        }
      },
      hero: {
        config: {
          title: 'Encontre seu imóvel ideal',
          subtitle: 'As melhores opções do mercado',
          backgroundImage: '',
          overlayColor: '#0f172a',
          overlayOpacity: 0.55,
          buttonText: 'Ver Imóveis',
          buttonLink: '/properties',
          secondaryButtonText: 'Fale com um corretor',
          secondaryButtonLink: '/contato',
          badges: [
            { text: 'Atendimento premium' },
            { text: 'Imoveis exclusivos' }
          ],
          highlights: [
            { value: '320+', label: 'Imoveis vendidos', description: 'Nos ultimos 12 meses' },
            { value: '98%', label: 'Satisfacao', description: 'Clientes recomendam' }
          ],
          contentWidth: '1200px',
          height: 'large',
          alignment: 'center'
        },
        style_config: {
          backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          textColor: '#f8fafc'
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
          title: 'Resultados que comprovam',
          subtitle: 'Provas sociais que mostram nossa solidez no mercado',
          badgeText: 'Credibilidade',
          accentColor: '#0ea5e9',
          stats: [
            { label: 'Imoveis ativos', value: '1200+', description: 'Em carteira exclusiva' },
            { label: 'Leads qualificados', value: '18k', description: 'Gerados no ultimo ano' },
            { label: 'Conversao', value: '97%', description: 'Satisfacao comprovada' }
          ]
        },
        style_config: {
          backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          textColor: '#f8fafc',
          padding: '5rem 0'
        }
      },
      'about-section': {
        config: {
          eyebrow: 'Manifesto',
          title: 'Seu corretor com visao estrategica',
          subtitle: 'Atendimento direto, dados de mercado e foco em conversao.',
          content: 'Ha mais de 12 anos conectando familias aos melhores imoveis. Curadoria, transparencia e velocidade para entregar oportunidades reais.',
          imageUrl: '',
          bullets: [
            { icon: 'fa-solid fa-chart-line', title: 'Visao de mercado', description: 'Analises semanais para precificar com seguranca.' },
            { icon: 'fa-solid fa-star', title: 'Curadoria premium', description: 'Selecao enxuta com imoveis de alta liquidez.' },
            { icon: 'fa-solid fa-handshake', title: 'Negociacao clara', description: 'Processo transparente ate a assinatura.' }
          ],
          buttonText: 'Conheca o corretor',
          buttonLink: '/sobre',
          highlightText: 'Atendimento 1:1 com acompanhamento total',
          imagePosition: 'right'
        },
        style_config: {
          backgroundColor: '#f8fafc',
          textColor: '#0f172a',
          padding: '5rem 0'
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
      },
      faq: {
        config: {
          title: 'Perguntas Frequentes',
          subtitle: 'Tire suas dúvidas sobre nossos serviços',
          items: [
            {
              question: 'Como funciona o processo de compra?',
              answer: 'O processo de compra envolve várias etapas, desde a escolha do imóvel até a assinatura do contrato. Nossa equipe te acompanha em todo o processo.'
            },
            {
              question: 'Quais documentos são necessários?',
              answer: 'Você precisará de documentos pessoais, comprovante de renda e outros documentos específicos dependendo do tipo de transação.'
            },
            {
              question: 'Oferecem consultoria de financiamento?',
              answer: 'Sim! Temos parceria com os principais bancos e podemos te ajudar a encontrar as melhores condições de financiamento.'
            }
          ]
        },
        style_config: {
          backgroundColor: '#ffffff',
          padding: '3rem'
        }
      },
      'features-grid': {
        config: {
          title: 'Por que escolher a gente?',
          subtitle: 'Vantagens de trabalhar conosco',
          features: [
            {
              icon: 'fas fa-shield-alt',
              title: 'Segurança Total',
              description: 'Transações 100% seguras e garantidas'
            },
            {
              icon: 'fas fa-clock',
              title: 'Atendimento 24/7',
              description: 'Suporte disponível a qualquer momento'
            },
            {
              icon: 'fas fa-star',
              title: 'Avaliação Gratuita',
              description: 'Avaliamos seu imóvel sem custo'
            },
            {
              icon: 'fas fa-handshake',
              title: 'Consultoria Especializada',
              description: 'Corretores experientes e qualificados'
            }
          ]
        },
        style_config: {
          backgroundColor: '#f8f9fa',
          padding: '3rem'
        }
      },
      'cta-button': {
        config: {
          title: 'Pronto para fechar o seu proximo negocio?',
          subtitle: 'Agende uma consultoria e tenha acesso a oportunidades fora do mercado.',
          buttonText: 'Agendar consultoria',
          buttonLink: '/contato',
          secondaryButtonText: 'Ver imoveis',
          secondaryButtonLink: '/imoveis',
          overlayColor: '#0f172a',
          overlayOpacity: 0.6,
          accentColor: '#0ea5e9',
          badgeText: 'Ultima chance'
        },
        style_config: {
          backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          textColor: '#f8fafc',
          padding: '5rem 0'
        }
      },
      newsletter: {
        config: {
          title: 'Fique por dentro das novidades',
          subtitle: 'Receba lançamentos e oportunidades exclusivas no seu email',
          buttonText: 'Assinar Newsletter',
          placeholder: 'Digite seu e-mail'
        },
        style_config: {
          backgroundColor: '#004AAD',
          textColor: '#ffffff',
          padding: '3rem'
        }
      },
      'mortgage-calculator': {
        config: {
          title: 'Calculadora de Financiamento',
          subtitle: 'Simule as parcelas do seu financiamento imobiliário',
          defaultInterestRate: 9.5,
          defaultTermYears: 30
        },
        style_config: {
          backgroundColor: '#ffffff',
          padding: '2rem'
        }
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
        type: 'about-section',
        label: 'About Section',
        icon: '🧭',
        category: 'content',
        description: 'About/manifesto section with image and bullets'
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
      },
      {
        type: 'faq',
        label: 'FAQ Section',
        icon: '❓',
        category: 'content',
        description: 'Frequently asked questions with accordion'
      },
      {
        type: 'features-grid',
        label: 'Features Grid',
        icon: '⭐',
        category: 'content',
        description: 'Grid of features/benefits with icons'
      },
      {
        type: 'cta-button',
        label: 'CTA Button',
        icon: '🚀',
        category: 'content',
        description: 'Final call-to-action section'
      },
      {
        type: 'newsletter',
        label: 'Newsletter',
        icon: '📮',
        category: 'forms',
        description: 'Newsletter subscription form'
      },
      {
        type: 'mortgage-calculator',
        label: 'Mortgage Calculator',
        icon: '🧮',
        category: 'tools',
        description: 'Real estate financing calculator'
      }
    ];
  }
}
