# Implementação Header e Footer - Site Público Multi-tenant

## ✅ IMPLEMENTAÇÃO CORRETA

### Estrutura de Dados Clara e Simples

```typescript
export interface HeaderConfig {
  companyName: string;      // Nome da empresa (TEXTO)
  logoUrl?: string;         // URL da logo (IMAGEM) - OPCIONAL
  showLogo: boolean;        // true = mostra logo, false = mostra nome
  menuItems: MenuItem[];    // Itens do menu de navegação
  backgroundColor?: string; // Cor de fundo
  textColor?: string;      // Cor do texto
}

export interface FooterConfig {
  companyName: string;      // Nome da empresa (TEXTO)
  logoUrl?: string;         // URL da logo (IMAGEM) - OPCIONAL
  showLogo: boolean;        // true = mostra logo, false = mostra nome
  copyrightText: string;    // Texto de copyright (ex: "© 2026 Todos os direitos reservados")
  menuColumns: MenuColumn[]; // Colunas de links do footer
  backgroundColor?: string; // Cor de fundo
  textColor?: string;      // Cor do texto
}

export interface MenuItem {
  label: string;  // Texto que aparece (ex: "Início", "Sobre", "Contato")
  route: string;  // Rota Angular (ex: "/", "/sobre", "/contato")
}

export interface MenuColumn {
  title: string;       // Título da coluna (ex: "Empresa", "Serviços", "Legal")
  items: MenuItem[];   // Links da coluna
}
```

### Por que essa estrutura é correta?

**❌ ANTES (ERRADO):**
```typescript
// Campo confuso que aceitava texto OU imagem
logo: string; // "Minha Imobiliária" OU "https://logo.png" ???
```

**✅ AGORA (CORRETO):**
```typescript
// Campos separados e claros
companyName: string;  // SEMPRE texto: "Minha Imobiliária"
logoUrl?: string;     // SEMPRE URL: "https://logo.png"
showLogo: boolean;    // Controle explícito: true = mostra logo, false = mostra nome
```

### Como funciona no template

**Header Component:**
```html
<!-- Se showLogo=true E logoUrl existe: mostra imagem -->
<img *ngIf="config.showLogo && config.logoUrl" 
     [src]="config.logoUrl" 
     [alt]="config.companyName"
     class="logo-image">

<!-- Se showLogo=false OU logoUrl não existe: mostra nome -->
<h1 *ngIf="!config.showLogo || !config.logoUrl">
  {{ config.companyName }}
</h1>

<!-- Menu -->
<nav>
  <a *ngFor="let item of config.menuItems" 
     [routerLink]="item.route">
    {{ item.label }}
  </a>
</nav>
```

**Footer Component:**
```html
<!-- Logo ou Nome (mesma lógica do header) -->
<div class="footer-brand">
  <img *ngIf="config.showLogo && config.logoUrl" 
       [src]="config.logoUrl" 
       class="logo-image">
  <h3 *ngIf="!config.showLogo || !config.logoUrl">
    {{ config.companyName }}
  </h3>
</div>

<!-- Colunas de Links -->
<div class="footer-columns">
  <div *ngFor="let column of config.menuColumns" class="footer-column">
    <h4>{{ column.title }}</h4>
    <ul>
      <li *ngFor="let item of column.items">
        <a [routerLink]="item.route">{{ item.label }}</a>
      </li>
    </ul>
  </div>
</div>

<!-- Copyright -->
<div class="footer-bottom">
  <p>{{ config.copyrightText }}</p>
</div>
```

## Fluxo de Dados - Site Público

### 1. Usuário acessa domínio (ex: imobiliaria-abc.com)

### 2. Aplicação identifica companyId pelo domínio

```typescript
// Domain Resolver Service (a ser implementado)
const companyId = await this.domainResolver.resolveCompanyByDomain(
  window.location.hostname
);
```

### 3. Carrega configurações da empresa

```typescript
// public-website.component.ts
async loadWebsite() {
  // Carrega dados da empresa
  const company = await this.companyService.getById(this.companyId);
  
  // Carrega store_settings (contém header_config e footer_config)
  this.storeSettings = await this.customizationService
    .getStoreSettings(this.companyId);
  
  // Define header e footer a partir de store_settings
  this.headerConfig = this.storeSettings?.header_config || this.getDefaultHeader();
  this.footerConfig = this.storeSettings?.footer_config || this.getDefaultFooter();
  
  // Carrega layout (sem header/footer nas sections)
  this.layout = await this.customizationService
    .getPublishedLayout(this.companyId);
  
  // IMPORTANTE: Filtra sections removendo header/footer se existirem
  this.sections = this.layout?.sections?.filter(
    s => s.component_type !== 'header' && s.component_type !== 'footer'
  ) || [];
}

getDefaultHeader(): HeaderConfig {
  return {
    companyName: 'Imobiliária',
    showLogo: false,
    menuItems: [
      { label: 'Início', route: '/' },
      { label: 'Imóveis', route: '/imoveis' },
      { label: 'Contato', route: '/contato' }
    ]
  };
}

getDefaultFooter(): FooterConfig {
  return {
    companyName: 'Imobiliária',
    showLogo: false,
    copyrightText: '© 2026 Todos os direitos reservados',
    menuColumns: [
      {
        title: 'Empresa',
        items: [
          { label: 'Sobre', route: '/sobre' },
          { label: 'Equipe', route: '/equipe' }
        ]
      },
      {
        title: 'Legal',
        items: [
          { label: 'Termos', route: '/termos' },
          { label: 'Privacidade', route: '/privacidade' }
        ]
      }
    ]
  };
}
```

### 4. Renderiza página

```html
<!-- public-website.component.html -->
<div class="public-website">
  <!-- HEADER FIXO -->
  <app-header-component 
    [config]="headerConfig"
    [editMode]="false">
  </app-header-component>
  
  <!-- CONTEÚDO DINÂMICO (sections do layout) -->
  <main class="website-content">
    <div *ngFor="let section of sections">
      <ng-container 
        appRenderComponent 
        [componentType]="section.component_type"
        [config]="section.config"
        [editMode]="false">
      </ng-container>
    </div>
  </main>
  
  <!-- FOOTER FIXO -->
  <app-footer-component 
    [config]="footerConfig"
    [editMode]="false">
  </app-footer-component>
</div>
```

## Configuração do Usuário (CRM Admin)

### O que o usuário PODE configurar:

✅ **Campo LOGO (URL)**: Upload de imagem ou URL direta
```typescript
logoUrl: "https://storage.example.com/logos/abc-imobiliaria.png"
```

✅ **Campo NOME DA EMPRESA (Texto)**:
```typescript
companyName: "ABC Imobiliária Premium"
```

✅ **Escolha: Logo ou Nome**:
```typescript
showLogo: true  // Mostra logo
showLogo: false // Mostra nome
```

✅ **Itens do Menu** (Header):
```typescript
menuItems: [
  { label: "Início", route: "/" },
  { label: "Imóveis", route: "/imoveis" },
  { label: "Sobre Nós", route: "/sobre" },
  { label: "Contato", route: "/contato" }
]
```

✅ **Colunas do Footer**:
```typescript
menuColumns: [
  {
    title: "Nossa Empresa",
    items: [
      { label: "Quem Somos", route: "/sobre" },
      { label: "Nossa Equipe", route: "/equipe" },
      { label: "Trabalhe Conosco", route: "/carreiras" }
    ]
  },
  {
    title: "Serviços",
    items: [
      { label: "Comprar", route: "/comprar" },
      { label: "Alugar", route: "/alugar" },
      { label: "Vender", route: "/vender" }
    ]
  }
]
```

✅ **Cores**:
```typescript
backgroundColor: "#1a1a1a"
textColor: "#ffffff"
```

### O que é FIXO (não configurável por página):

- ❌ Posição do header (sempre no topo)
- ❌ Posição do footer (sempre no rodapé)
- ❌ Estrutura do header/footer (só conteúdo é configurável)

## Schema do Banco de Dados

```sql
-- Tabela store_settings
ALTER TABLE store_settings
ADD COLUMN header_config JSONB DEFAULT '{
  "companyName": "Imobiliária",
  "showLogo": false,
  "menuItems": [
    {"label": "Início", "route": "/"},
    {"label": "Imóveis", "route": "/imoveis"},
    {"label": "Contato", "route": "/contato"}
  ]
}';

ALTER TABLE store_settings
ADD COLUMN footer_config JSONB DEFAULT '{
  "companyName": "Imobiliária",
  "showLogo": false,
  "copyrightText": "© 2026 Todos os direitos reservados",
  "menuColumns": []
}';
```

## Próximos Passos

### 1. ✅ COMPLETO - Refatorar Models
- [x] HeaderConfig com campos separados
- [x] FooterConfig com campos separados
- [x] MenuItem interface
- [x] MenuColumn interface

### 2. ✅ COMPLETO - Refatorar Componentes
- [x] HeaderComponent com template correto
- [x] FooterComponent com template correto
- [x] Lógica condicional (logo vs nome)

### 3. ✅ COMPLETO - Atualizar PublicWebsiteComponent
- [x] Importar HeaderComponent e FooterComponent
- [x] Carregar configs de store_settings
- [x] Filtrar header/footer das sections
- [x] Passar configs corretas para componentes

### 4. 🔄 TODO - Backend
- [ ] Criar colunas header_config e footer_config em store_settings
- [ ] API GET /api/store-settings/:companyId
- [ ] API PUT /api/store-settings/:companyId
- [ ] Validação dos dados (URLs, campos obrigatórios)

### 5. 🔄 TODO - Interface Admin (CRM)
- [ ] Página de configuração do Header
  - Upload de logo
  - Campo de nome da empresa
  - Toggle "Mostrar logo ou nome"
  - Gerenciamento de menu items (adicionar/remover/ordenar)
  - Seletor de cores
- [ ] Página de configuração do Footer
  - Upload de logo
  - Campo de copyright
  - Gerenciamento de colunas e links
  - Seletor de cores

### 6. 🔄 TODO - Domain Resolver
- [ ] Serviço para resolver companyId a partir do domínio
- [ ] Cache de resolução de domínios
- [ ] Tratamento de domínio não encontrado

## Exemplo Completo de Configuração

```json
{
  "header_config": {
    "companyName": "XYZ Imóveis Premium",
    "logoUrl": "https://storage.example.com/logos/xyz-premium.png",
    "showLogo": true,
    "menuItems": [
      { "label": "Home", "route": "/" },
      { "label": "Comprar", "route": "/comprar" },
      { "label": "Alugar", "route": "/alugar" },
      { "label": "Sobre", "route": "/sobre" },
      { "label": "Contato", "route": "/contato" }
    ],
    "backgroundColor": "#004AAD",
    "textColor": "#FFFFFF"
  },
  "footer_config": {
    "companyName": "XYZ Imóveis Premium",
    "logoUrl": "https://storage.example.com/logos/xyz-premium-white.png",
    "showLogo": true,
    "copyrightText": "© 2026 XYZ Imóveis Premium - Todos os direitos reservados",
    "menuColumns": [
      {
        "title": "Empresa",
        "items": [
          { "label": "Sobre Nós", "route": "/sobre" },
          { "label": "Nossa Equipe", "route": "/equipe" },
          { "label": "Depoimentos", "route": "/depoimentos" }
        ]
      },
      {
        "title": "Serviços",
        "items": [
          { "label": "Compra", "route": "/comprar" },
          { "label": "Venda", "route": "/vender" },
          { "label": "Locação", "route": "/alugar" },
          { "label": "Avaliação", "route": "/avaliar" }
        ]
      },
      {
        "title": "Suporte",
        "items": [
          { "label": "FAQ", "route": "/faq" },
          { "label": "Contato", "route": "/contato" },
          { "label": "WhatsApp", "route": "/whatsapp" }
        ]
      },
      {
        "title": "Legal",
        "items": [
          { "label": "Termos de Uso", "route": "/termos" },
          { "label": "Privacidade", "route": "/privacidade" },
          { "label": "Cookies", "route": "/cookies" }
        ]
      }
    ],
    "backgroundColor": "#1A1A1A",
    "textColor": "#FFFFFF"
  }
}
```

---

## 🎯 Resultado Final

✅ **Configuração Clara**: Campos separados para logo (imagem) e nome (texto)
✅ **Controle Explícito**: Boolean `showLogo` para escolher o que exibir
✅ **Header/Footer Fixos**: Não fazem parte do layout dinâmico
✅ **Configuração Global**: Vem de `store_settings`, não de sections
✅ **Navegação Angular**: Usa `[routerLink]` para rotas internas
✅ **Multi-tenant**: Cada empresa tem seu próprio header/footer

**NÃO HÁ MAIS CONFUSÃO**: O usuário sabe exatamente onde colocar a logo (URL da imagem) e onde colocar o nome (texto)!
