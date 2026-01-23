import { Injectable } from '@angular/core';
import { ComponentRegistryService } from '../../shared/website-components/component-registry.service';
import { ComponentMetadata } from '../../shared/website-components/component-base.interface';

@Injectable({ providedIn: 'root' })
export class GrapesBlocksRegistry {
  constructor(private registry: ComponentRegistryService) {}

  registerAll(editor: any) {
    this.registerCustomTypes(editor);
    const metadataList = this.registry.getAllMetadata();
    metadataList.forEach(metadata => this.registerComponent(editor, metadata));
  }

  getHtmlForType(type: string): string {
    const metadata = this.registry.getMetadata(type);
    if (metadata) {
      return this.buildTemplate(type, metadata);
    }
    return this.buildFallback(type);
  }

  private registerComponent(editor: any, metadata: ComponentMetadata) {
    const type = metadata.type;
    if (type === 'property-grid') {
      editor.BlockManager.add('property-grid-block', {
        label: 'Vitrine de Imoveis',
        category: 'Imoveis',
        content: { type: 'property-grid' }
      });
      return;
    }
    editor.BlockManager.add(type, {
      label: `${metadata.icon || '🧩'} ${metadata.label}`,
      category: metadata.category || 'content',
      content: this.buildTemplate(type, metadata)
    });
  }

  private buildTemplate(type: string, metadata: ComponentMetadata): string {
    switch (type) {
      case 'header':
        return `
          <header class="component-header">
            <div class="navbar">
              <div class="navbar-brand"><h1>Imobiliaria</h1></div>
              <ul class="navbar-nav">
                <li><a href="#">Home</a></li>
                <li><a href="#">Imoveis</a></li>
                <li><a href="#">Sobre</a></li>
                <li><a href="#">Contato</a></li>
              </ul>
            </div>
          </header>
        `;
      case 'hero':
        return `
          <section class="component-hero hero-large" style="background:#004AAD;color:#fff;text-align:center;padding:4rem 1.5rem;">
            <div class="hero-content">
              <h1 class="hero-title">Imoveis que traduzem seu estilo de vida</h1>
              <p class="hero-subtitle">Curadoria premium com atendimento personalizado.</p>
              <a class="hero-button" href="#">Agendar visita</a>
            </div>
          </section>
        `;
      case 'search-bar':
        return `
          <section class="py-10" data-component="search-bar">
            <div class="max-w-[1200px] mx-auto px-6">
              <form class="bg-white dark:bg-background-dark p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 border border-white/20" data-role="search-form">
                <div class="flex-1 flex items-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10">
                  <span class="material-symbols-outlined text-primary mr-3">search</span>
                  <input placeholder="O que voce procura?" type="text" data-field="term" class="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 text-sm md:text-base"/>
                </div>
                <div class="flex-1 flex items-center px-4 py-3 md:py-0">
                  <span class="material-symbols-outlined text-primary mr-3">location_on</span>
                  <input placeholder="Cidade ou Bairro" type="text" data-field="city" class="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 text-sm md:text-base"/>
                </div>
                <button type="submit" class="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-sm">search</span>
                  Buscar Imoveis
                </button>
              </form>
            </div>
          </section>
        `;
      case 'property-grid':
        return `
          <div data-component="property-grid"
            data-config='{"limit":6,"mode":"service","api":""}'
            data-style='{"backgroundColor":"#ffffff","padding":"2rem"}'>
            <div class="max-w-[1200px] mx-auto px-6">
              <div class="flex items-end justify-between mb-8">
                <div>
                  <span class="text-primary font-bold text-sm uppercase tracking-widest">Exclusividade</span>
                  <h2 class="text-3xl md:text-4xl font-black mt-2 tracking-tight">Imoveis em destaque</h2>
                </div>
              </div>
              <div data-role="property-grid-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="component-placeholder">
                  <strong>Property Grid</strong>
                  <span>Componente dinamico</span>
                </div>
              </div>
            </div>
          </div>
        `;
      case 'text-block':
        return `
          <section class="component-text-block">
            <div class="text-content">
              <h2>${metadata.label}</h2>
              <p>Texto livre para explicar o diferencial da sua imobiliaria.</p>
            </div>
          </section>
        `;
      case 'about-section':
        return `
          <section class="component-text-block">
            <div class="text-content">
              <h2>Sobre a imobiliaria</h2>
              <p>Equipe especializada, atendimento premium e curadoria de oportunidades.</p>
            </div>
          </section>
        `;
      case 'cta-button':
        return `
          <section style="padding:2rem;text-align:center;background:#0f172a;color:#fff;">
            <h2>Pronto para agendar sua visita?</h2>
            <p>Fale com um consultor agora mesmo.</p>
            <a class="hero-button" href="#" style="display:inline-block;margin-top:1rem;">Agendar</a>
          </section>
        `;
      case 'stats-section':
        return `
          <section class="component-stats">
            <div class="stats-container">
              <div class="stat-item"><span class="stat-value">1200+</span><span class="stat-label">Imoveis</span></div>
              <div class="stat-item"><span class="stat-value">98%</span><span class="stat-label">Satisfacao</span></div>
              <div class="stat-item"><span class="stat-value">12 anos</span><span class="stat-label">Experiencia</span></div>
            </div>
          </section>
        `;
      case 'features-grid':
        return `
          <section style="padding:2rem;">
            <div class="properties-container" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
              <div class="property-card"><div class="property-info"><h3>Curadoria premium</h3><p>Selecao estrategica.</p></div></div>
              <div class="property-card"><div class="property-info"><h3>Atendimento 1:1</h3><p>Consultoria dedicada.</p></div></div>
              <div class="property-card"><div class="property-info"><h3>Dados do mercado</h3><p>Decisao com seguranca.</p></div></div>
            </div>
          </section>
        `;
      case 'faq':
        return `
          <section style="padding:2rem;max-width:900px;margin:0 auto;">
            <h2>Perguntas frequentes</h2>
            <p><strong>Como agendar visita?</strong> Entre em contato pelo formulario.</p>
            <p><strong>Ha imoveis exclusivos?</strong> Sim, nossa curadoria e premium.</p>
          </section>
        `;
      case 'newsletter':
        return `
          <section style="padding:2rem;text-align:center;background:#f8fafc;">
            <h2>Receba novidades</h2>
            <p>Cadastre-se para receber oportunidades.</p>
            <input type="email" placeholder="Seu email" style="padding:0.6rem 1rem;border:1px solid #e2e8f0;border-radius:6px;">
          </section>
        `;
      case 'mortgage-calculator':
        return `
          <section style="padding:2rem;text-align:center;">
            <h2>Simulador de financiamento</h2>
            <p>Calculadora integrada ao CRM.</p>
          </section>
        `;
      case 'divider':
        return `<div class="component-divider"><hr></div>`;
      case 'spacer':
        return `<div class="component-spacer" style="height:40px;"></div>`;
      case 'custom-code':
        return `
          <section style="padding:1.5rem;border:1px dashed #cbd5f5;">
            <h3>Custom Code</h3>
            <p>Insira HTML/CSS/JS customizado.</p>
          </section>
        `;
      case 'footer':
        return `
          <footer class="component-footer">
            <div class="footer-content">
              <div class="footer-columns">
                <div class="footer-column">
                  <h4>Institucional</h4>
                  <ul><li><a href="#">Sobre</a></li><li><a href="#">Contato</a></li></ul>
                </div>
                <div class="footer-column">
                  <h4>Imoveis</h4>
                  <ul><li><a href="#">Comprar</a></li><li><a href="#">Alugar</a></li></ul>
                </div>
              </div>
              <div class="footer-bottom">© 2026 Imobiliaria</div>
            </div>
          </footer>
        `;
      default:
        return this.buildFallback(type);
    }
  }

  private buildFallback(type: string): string {
    return `
      <section style="padding:1.5rem;border:1px dashed #cbd5f5;">
        <h3>${type}</h3>
        <p>Componente personalizado.</p>
      </section>
    `;
  }

  private registerCustomTypes(editor: any) {
    editor.DomComponents.addType('property-grid', {
      model: {
        defaults: {
          tagName: 'div',
          attributes: {
            'data-component': 'property-grid',
            'data-config': '{}',
            'data-style': '{}'
          },
          limit: 6,
          mode: 'service',
          api: '',
          backgroundColor: '#ffffff',
          padding: '2rem',
          components: `
            <div class="max-w-[1200px] mx-auto px-6">
              <div class="flex items-end justify-between mb-8">
                <div>
                  <span class="text-primary font-bold text-sm uppercase tracking-widest">Exclusividade</span>
                  <h2 class="text-3xl md:text-4xl font-black mt-2 tracking-tight">Imoveis em destaque</h2>
                </div>
              </div>
              <div data-role="property-grid-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="component-placeholder">
                  <strong>Property Grid</strong>
                  <span>Componente dinamico</span>
                </div>
              </div>
            </div>
          `,
          traits: [
            {
              type: 'number',
              label: 'Quantidade de imoveis',
              name: 'limit',
              changeProp: true
            },
            {
              type: 'select',
              label: 'Fonte de dados',
              name: 'mode',
              changeProp: true,
              options: [
                { value: 'service', name: 'Sistema' },
                { value: 'api', name: 'API externa' }
              ]
            },
            {
              type: 'text',
              label: 'API URL',
              name: 'api',
              changeProp: true,
              placeholder: '/api/properties'
            },
            {
              type: 'text',
              label: 'Cor de fundo',
              name: 'backgroundColor',
              changeProp: true,
              placeholder: '#ffffff'
            },
            {
              type: 'text',
              label: 'Padding',
              name: 'padding',
              changeProp: true,
              placeholder: '2rem'
            }
          ]
        },
        init(this: any) {
          this.loadFromAttributes();
          this.on('change:limit change:mode change:api', this.syncConfig);
          this.on('change:backgroundColor change:padding', this.syncStyle);
          this.syncConfig();
          this.syncStyle();
        },
        loadFromAttributes(this: any) {
          const attrs = this.getAttributes?.() || {};
          const config = this.safeParse(attrs['data-config']);
          const style = this.safeParse(attrs['data-style']);
          if (config.limit != null) this.set('limit', config.limit);
          if (config.mode) this.set('mode', config.mode);
          if (config.api != null) this.set('api', config.api);
          if (style.backgroundColor) this.set('backgroundColor', style.backgroundColor);
          if (style.padding) this.set('padding', style.padding);
        },
        syncConfig(this: any) {
          const config = {
            limit: this.get('limit') || 0,
            mode: this.get('mode') || 'service',
            api: this.get('api') || ''
          };
          this.addAttributes({
            'data-config': JSON.stringify(config)
          });
        },
        syncStyle(this: any) {
          const style = {
            backgroundColor: this.get('backgroundColor') || '',
            padding: this.get('padding') || ''
          };
          this.addAttributes({
            'data-style': JSON.stringify(style)
          });
        },
        safeParse(this: any, value: any) {
          if (!value) return {};
          if (typeof value !== 'string') return value;
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }
      }
    });
  }
}
