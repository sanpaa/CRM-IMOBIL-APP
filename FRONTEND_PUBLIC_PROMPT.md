# 🌐 Prompt para Implementação do Frontend Público (Website Multi-tenant)

## 📋 Contexto

Este documento fornece instruções para implementar o **frontend público** do CRM Imobiliário - o site que cada imobiliária terá para seus clientes finais visualizarem propriedades, entrarem em contato, etc.

## 🎯 Objetivo

Criar uma aplicação Angular separada (ou módulo) que:
1. Detecta automaticamente qual imobiliária está sendo acessada pelo domínio
2. Carrega a configuração e layout personalizado da imobiliária
3. Exibe propriedades e permite contato
4. Funciona 100% compatível com Netlify/Vercel (sem necessidade de backend próprio)

## 🏗️ Arquitetura Multi-tenant SaaS

### Como Funciona

```
Cliente acessa: cliente1.seusite.com
    ↓
Frontend detecta hostname (window.location.hostname)
    ↓
Extrai "cliente1" do hostname
    ↓
Busca no Supabase: SELECT * FROM companies WHERE subdomain_slug = 'cliente1'
    ↓
Carrega configurações e dados filtrados por company_id
    ↓
Renderiza site personalizado
```

### Deploy Único, Múltiplos Sites

- **UM deploy** do frontend no Netlify
- **TODOS** os subdomínios (*.seusite.com) apontam para o mesmo deploy
- **Detecção dinâmica** de qual empresa mostrar baseado no hostname
- **SSL automático** para todos os subdomínios via Netlify

## 📝 Requisitos de Implementação

### 1. Páginas Necessárias

Crie as seguintes páginas/componentes:

- **Home Page** - Página inicial com busca e destaques
- **Listagem de Imóveis** - Grade de propriedades com filtros
- **Detalhes do Imóvel** - Página individual com galeria e informações
- **Contato** - Formulário de contato
- **Sobre** - Informações da imobiliária

### 2. Detecção de Tenant (Multi-tenant)

Use os serviços já criados:

```typescript
import { TenantResolverService } from './services/tenant-resolver.service';
import { PublicSiteConfigService } from './services/public-site-config.service';

export class PublicHomeComponent implements OnInit {
  companyName: string = '';
  layout: any = null;
  properties: any[] = [];
  
  constructor(
    private publicSiteConfig: PublicSiteConfigService
  ) {}

  async ngOnInit() {
    // Carrega configuração da empresa baseado no domínio atual
    const config = await this.publicSiteConfig.getSiteConfig();
    
    if (!config) {
      // Exibir página de erro ou página padrão
      this.showNotFoundPage();
      return;
    }
    
    // Aplicar configurações
    this.companyName = config.company.name;
    this.layout = config.layout;
    
    // Aplicar tema/cores
    this.applyTheme(config.theme);
    
    // Carregar propriedades
    this.properties = await this.publicSiteConfig.getProperties({
      limit: 6
    });
  }
  
  applyTheme(theme: any) {
    if (theme) {
      document.documentElement.style.setProperty('--primary-color', theme.primary_color);
      document.documentElement.style.setProperty('--secondary-color', theme.secondary_color);
      document.documentElement.style.setProperty('--font-family', theme.font_family);
    }
  }
  
  showNotFoundPage() {
    // Mostrar página genérica ou erro
  }
}
```

### 3. Renderização Dinâmica de Layout

O layout é armazenado como JSON no banco. Você precisa renderizar componentes dinamicamente:

```typescript
// Exemplo de estrutura do layout
const layoutConfig = {
  sections: [
    { 
      id: 'hero', 
      type: 'hero', 
      order: 1,
      config: { 
        title: 'Encontre seu imóvel ideal',
        subtitle: 'As melhores opções do mercado',
        backgroundImage: 'url_da_imagem'
      }
    },
    { 
      id: 'properties', 
      type: 'property-grid', 
      order: 2,
      config: { 
        limit: 6,
        showFeatured: true
      }
    }
  ]
};

// Renderizar componentes baseado no tipo
<ng-container *ngFor="let section of layout.sections">
  <app-hero *ngIf="section.type === 'hero'" [config]="section.config"></app-hero>
  <app-property-grid *ngIf="section.type === 'property-grid'" [config]="section.config"></app-property-grid>
  <!-- ... outros componentes -->
</ng-container>
```

### 4. Componentes de UI Necessários

Crie componentes reutilizáveis:

#### HeroComponent
- Banner principal com título, subtítulo e CTA
- Suporte para imagem de fundo

#### PropertyGridComponent
- Grade responsiva de cards de propriedades
- Paginação
- Filtros (tipo, cidade, preço, quartos)

#### PropertyCardComponent
- Card individual com imagem, preço, localização
- Link para detalhes

#### SearchBarComponent
- Barra de busca com filtros básicos
- Auto-complete de cidades

#### ContactFormComponent
- Formulário: nome, email, telefone, mensagem
- Integração com Supabase (cria registro em `clients`)
- Validação

#### HeaderComponent
- Logo da imobiliária
- Menu de navegação
- Informações de contato

#### FooterComponent
- Links úteis
- Redes sociais
- Informações da empresa

### 5. Integração com Supabase

Todos os dados devem ser filtrados por `company_id`:

```typescript
// Exemplo: Buscar propriedades
async getProperties(filters?: any) {
  const companyId = await this.tenantResolver.getCurrentTenant();
  
  let query = this.supabase
    .from('properties')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'available');
  
  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  
  if (filters?.minPrice) {
    query = query.gte('value', filters.minPrice);
  }
  
  const { data } = await query.order('created_at', { ascending: false });
  return data || [];
}
```

### 6. Formulário de Contato

Ao submeter contato, criar lead na tabela `clients`:

```typescript
async submitContact(formData: any) {
  const companyId = await this.tenantResolver.getCurrentTenant();
  
  const { data, error } = await this.supabase
    .from('clients')
    .insert([{
      company_id: companyId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.message,
      status: 'novo',
      source: 'website'
    }]);
  
  if (error) {
    alert('Erro ao enviar mensagem');
    return false;
  }
  
  alert('Mensagem enviada com sucesso!');
  return true;
}
```

## 🎨 Estilização e Tema

### CSS Variables para Tema Dinâmico

```scss
:root {
  --primary-color: #004AAD;
  --secondary-color: #00D084;
  --font-family: 'Inter', sans-serif;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.text-primary {
  color: var(--primary-color);
}
```

### Aplicar Tema Dinamicamente

```typescript
const theme = config.theme;
document.documentElement.style.setProperty('--primary-color', theme.primary_color);
document.documentElement.style.setProperty('--secondary-color', theme.secondary_color);
```

## 🚀 Roteamento

Configure rotas para o site público:

```typescript
const routes: Routes = [
  { path: '', component: PublicHomeComponent },
  { path: 'imoveis', component: PropertyListComponent },
  { path: 'imovel/:id', component: PropertyDetailComponent },
  { path: 'contato', component: ContactComponent },
  { path: 'sobre', component: AboutComponent },
  { path: '**', redirectTo: '' }
];
```

## 📱 Responsividade

Use Angular CDK ou CSS Grid para layouts responsivos:

```scss
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

## 🔒 Segurança

1. **Nunca exponha chaves secretas** - Use apenas `SUPABASE_ANON_KEY`
2. **RLS (Row Level Security)** - Já configurado no Supabase
3. **Validação de entrada** - Valide formulários no frontend
4. **Rate limiting** - Use Supabase Edge Functions se necessário

## ✅ Checklist de Implementação

- [ ] Criar componentes de UI (Hero, PropertyGrid, Header, Footer, etc)
- [ ] Implementar detecção de tenant via hostname
- [ ] Integrar com PublicSiteConfigService
- [ ] Carregar e aplicar tema dinamicamente
- [ ] Implementar listagem de propriedades com filtros
- [ ] Criar página de detalhes de imóvel
- [ ] Implementar formulário de contato funcional
- [ ] Criar página sobre a empresa
- [ ] Adicionar meta tags dinâmicas para SEO
- [ ] Testar em diferentes subdomínios
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Otimizar imagens e performance
- [ ] Deploy no Netlify/Vercel

## 🧪 Testando Localmente

Para testar multi-tenant localmente, você pode:

1. **Editar `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows)**:
```
127.0.0.1 cliente1.localhost
127.0.0.1 cliente2.localhost
```

2. **Acessar via navegador**:
- `http://cliente1.localhost:4200`
- `http://cliente2.localhost:4200`

3. **Modificar TenantResolverService para desenvolvimento**:
```typescript
private isLocalEnvironment(hostname: string): boolean {
  if (hostname.includes('localhost')) {
    // Para testes locais, pode retornar um company_id fixo
    return false; // Isso permitirá o fluxo de detecção
  }
  return false;
}
```

## 📚 Referências

- **Serviços Criados:**
  - `TenantResolverService` - Detecta empresa pelo domínio
  - `PublicSiteConfigService` - Carrega configurações da empresa
  - `WebsiteCustomizationService` - Gerencia layouts
  - `DomainManagementService` - Gerencia domínios

- **Modelos:**
  - `WebsiteLayout` - Estrutura de layout
  - `CustomDomain` - Domínios configurados
  - `Property` - Modelo de propriedade

## 💡 Dicas Importantes

1. **Cache:** Implemente cache local para configurações da empresa (não fazer query a cada navegação)
2. **Loading States:** Mostre spinners enquanto carrega dados
3. **Fallbacks:** Tenha valores padrão se configuração não existir
4. **SEO:** Use meta tags dinâmicas com nome da empresa
5. **Analytics:** Integre Google Analytics com company_id como dimensão
6. **Imagens:** Use lazy loading e otimização de imagens
7. **Erros:** Trate casos onde empresa não existe ou está inativa

## 🎯 Exemplo de Prompt Completo para IA

```
Crie um frontend público para um CRM imobiliário multi-tenant em Angular.

Requisitos:
1. Detecção automática de empresa pelo domínio (window.location.hostname)
2. Usar serviços já criados: TenantResolverService e PublicSiteConfigService
3. Páginas: Home, Listagem de Imóveis, Detalhes, Contato, Sobre
4. Componentes reutilizáveis: Hero, PropertyGrid, SearchBar, ContactForm
5. Tema dinâmico aplicado via CSS variables
6. Layout renderizado dinamicamente baseado em JSON do banco
7. Formulário de contato que cria lead no Supabase
8. Design responsivo (mobile-first)
9. Integração com Supabase usando RLS
10. Deploy compatível com Netlify/Vercel

Arquitetura:
- Frontend único que serve múltiplas empresas
- Cada empresa tem subdomínio automático (empresa1.seusite.com)
- Dados filtrados por company_id no Supabase
- SSL automático via Netlify

Implemente seguindo as melhores práticas Angular 17 standalone components.
```

---

**Data:** 2024  
**Sistema:** CRM Imobiliário Multi-tenant SaaS  
**Compatibilidade:** Netlify, Vercel, Firebase Hosting
