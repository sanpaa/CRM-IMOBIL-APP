# 📋 PLANO DE REFATORAÇÃO - COMPONENTES UNIFICADOS

## 🎯 OBJETIVO PRINCIPAL
Garantir que os componentes do editor drag-and-drop sejam **100% idênticos** aos renderizados no site público, eliminando qualquer divergência de HTML, CSS, TypeScript ou comportamento.

---

## ✅ ANÁLISE DO ESTADO ATUAL

### 🟢 PONTOS POSITIVOS (JÁ IMPLEMENTADOS)

#### 1. Arquitetura Base Correta
- ✅ **Componentes já são compartilhados** (`src/app/shared/website-components/`)
- ✅ **Sistema de registro de componentes** (`ComponentRegistryService`)
- ✅ **Diretiva de renderização dinâmica** (`RenderComponentDirective`)
- ✅ **Interface base comum** (`WebsiteComponentBase`)
- ✅ **Sistema de metadata** para cada componente

#### 2. Separação Modo Edição vs Leitura
- ✅ Todos os componentes implementam `WebsiteComponentBase`
- ✅ Propriedade `editMode: boolean` controla o modo
- ✅ Classes CSS `.edit-mode` aplicadas condicionalmente
- ✅ Links desabilitados no modo edição (`edit-mode-link`)

#### 3. Componentes Existentes (14 registrados)
```typescript
✅ header           - HeaderComponent
✅ hero             - HeroComponent  
✅ property-grid    - PropertyGridComponent
✅ text-block       - TextBlockComponent
✅ footer           - FooterComponent
✅ divider          - DividerComponent
✅ spacer           - SpacerComponent
✅ faq              - FAQComponent
✅ features-grid    - FeaturesGridComponent
✅ newsletter       - NewsletterComponent
✅ mortgage-calculator - MortgageCalculatorComponent
✅ custom-code      - CustomCodeComponent
✅ flex-container   - FlexContainerComponent
✅ grid-container   - GridContainerComponent
```

#### 4. Renderização Consistente
```typescript
// website-builder.component.html (MODO EDIÇÃO)
<ng-container *appRenderComponent="section; editMode: !previewMode"></ng-container>

// public-website.component.html (MODO PÚBLICO)
<ng-container *appRenderComponent="section; editMode: false"></ng-container>
```
**✅ Mesma diretiva, mesmos componentes, mesma lógica!**

---

## 🟡 PONTOS QUE PRECISAM MELHORIAS

### 1. Sistema de Tema Global Incompleto

#### PROBLEMA
- ❌ Existe `ThemeColors`, `ThemeTypography`, `ThemeSpacing` em `theme.model.ts`
- ❌ Existe `StoreSettings` com `primary_color` e `secondary_color`
- ❌ **NÃO existe serviço centralizado de tema**
- ❌ **Componentes não consomem tema de forma unificada**
- ❌ Cores são hardcoded em cada componente

#### EXEMPLO DO PROBLEMA
```typescript
// header.component.ts
get backgroundColor() {
  return this.style?.backgroundColor || '#ffffff'; // ❌ HARDCODED
}

get textColor() {
  return this.style?.textColor || '#333333'; // ❌ HARDCODED
}
```

#### SOLUÇÃO NECESSÁRIA
Criar `ThemeService` que:
- Carrega tema da empresa do banco
- Disponibiliza via Observable
- Injeta CSS variables globalmente
- Atualiza em tempo real

---

### 2. Header e Footer Precisam de Mais Personalização

#### HEADER ATUAL
```typescript
interface HeaderConfig {
  logo: string;           // ✅ OK
  showSearch: boolean;    // ✅ OK
  navigation: NavItem[];  // ✅ OK
}
```

#### HEADER MELHORADO
```typescript
interface HeaderConfig {
  logo: string;
  logoHeight?: string;
  logoAlignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
  sticky?: boolean;           // ✅ NOVO - Header fixo
  layout?: 'horizontal' | 'vertical' | 'hamburger'; // ✅ NOVO
  showSearch: boolean;
  navigation: NavItem[];
  ctaButton?: {               // ✅ NOVO - Botão CTA
    text: string;
    link: string;
    style: 'primary' | 'secondary';
  };
}
```

#### FOOTER MELHORADO
```typescript
interface FooterConfig {
  columns: FooterColumn[];
  copyrightText: string;
  logo?: string;              // ✅ NOVO
  backgroundColor?: string;
  textColor?: string;
  showSocialLinks?: boolean;  // ✅ NOVO
  socialLinks?: SocialLinks;  // ✅ NOVO
  layout?: 'columns' | 'centered' | 'minimal'; // ✅ NOVO
}
```

---

### 3. Falta Sistema de CSS Variables (Design Tokens)

#### PROBLEMA ATUAL
Cada componente define estilos inline via `@HostBinding`:
```typescript
@HostBinding('style.background-color')
get backgroundColor() {
  return this.style?.backgroundColor || '#ffffff';
}
```

#### SOLUÇÃO: CSS VARIABLES GLOBAIS
```scss
:root {
  // Cores primárias
  --primary-color: #004AAD;
  --secondary-color: #FFA500;
  --accent-color: #2c7a7b;
  
  // Cores de texto
  --text-color: #333333;
  --text-light: #718096;
  
  // Backgrounds
  --bg-primary: #ffffff;
  --bg-secondary: #f7fafc;
  --bg-dark: #1a202c;
  
  // Espaçamentos
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  
  // Tipografia
  --font-family: 'Inter', sans-serif;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --line-height: 1.6;
  
  // Border radius
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  
  // Sombras
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

#### COMPONENTES USARIAM ASSIM
```scss
.header-container {
  background-color: var(--bg-primary);
  color: var(--text-color);
  font-family: var(--font-family);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}
```

---

### 4. Falta Sincronização em Tempo Real do Preview

#### SITUAÇÃO ATUAL
- ✅ Preview renderiza os mesmos componentes
- ❌ Preview só atualiza ao salvar ou trocar de aba
- ❌ Não há "live preview" real

#### SOLUÇÃO
Implementar sistema de atualização reativa:
```typescript
// website-builder.component.ts
private sectionsSubject = new BehaviorSubject<LayoutSection[]>([]);
sections$ = this.sectionsSubject.asObservable();

updateSection(sectionId: string, config: any) {
  const updatedSections = this.sections.map(s => 
    s.id === sectionId ? { ...s, config } : s
  );
  this.sectionsSubject.next(updatedSections);
}

// preview component subscribe to sections$
```

---

### 5. Editor de Propriedades Precisa Melhorias

#### ATUAL
```typescript
// Baseado em metadata schemas
interface ConfigSchemaField {
  key: string;
  label: string;
  type: ConfigFieldType;
  // ...
}
```

#### MELHORIAS NECESSÁRIAS
- ✅ Adicionar preview de cores ao editar cores
- ✅ Upload de imagens integrado (não só URL)
- ✅ Editor WYSIWYG para campos de texto
- ✅ Validação em tempo real
- ✅ Undo/Redo de alterações

---

## 🔴 PROBLEMAS CRÍTICOS A RESOLVER

### 1. Não Existe Serviço de Tema Centralizado

**ARQUIVOS QUE PRECISAM SER CRIADOS:**
```
src/app/services/theme.service.ts           ❌ NÃO EXISTE
src/app/services/theme-loader.service.ts    ❌ NÃO EXISTE
src/app/styles/_theme-variables.scss        ❌ NÃO EXISTE
```

### 2. Componentes Usam Estilos Hardcoded

**ARQUIVOS QUE PRECISAM REFATORAÇÃO:**
```
src/app/shared/website-components/header/header.component.ts
src/app/shared/website-components/footer/footer.component.ts
src/app/shared/website-components/hero/hero.component.ts
src/app/shared/website-components/property-grid/property-grid.component.ts
// ... TODOS os componentes
```

### 3. Schema de Banco Pode Estar Incompleto

**VERIFICAR:**
```sql
-- Tabela de temas por empresa
CREATE TABLE IF NOT EXISTS company_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Cores
  primary_color VARCHAR(7) DEFAULT '#004AAD',
  secondary_color VARCHAR(7) DEFAULT '#FFA500',
  accent_color VARCHAR(7) DEFAULT '#2c7a7b',
  text_color VARCHAR(7) DEFAULT '#333333',
  text_light_color VARCHAR(7) DEFAULT '#718096',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  background_dark VARCHAR(7) DEFAULT '#1a202c',
  
  -- Tipografia
  font_family VARCHAR(255) DEFAULT 'Inter, sans-serif',
  font_size VARCHAR(20) DEFAULT '1rem',
  font_weight VARCHAR(20) DEFAULT '400',
  line_height VARCHAR(20) DEFAULT '1.6',
  
  -- Espaçamentos
  border_radius VARCHAR(20) DEFAULT '8px',
  padding_small VARCHAR(20) DEFAULT '0.5rem',
  padding_medium VARCHAR(20) DEFAULT '1rem',
  padding_large VARCHAR(20) DEFAULT '2rem',
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id)
);
```

---

## 📁 ARQUITETURA PROPOSTA

### Estrutura de Pastas
```
src/app/
├── shared/
│   ├── website-components/           ✅ JÁ EXISTE
│   │   ├── component-base.interface.ts
│   │   ├── component-registry.service.ts
│   │   ├── component-loader.service.ts
│   │   ├── component-initializer.service.ts
│   │   ├── render-component.directive.ts
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   ├── header.component.scss
│   │   │   └── header.metadata.ts
│   │   ├── footer/
│   │   ├── hero/
│   │   └── ... outros componentes
│   │
│   ├── property-editor/              ✅ JÁ EXISTE
│   │   ├── property-editor.component.ts
│   │   └── property-editor.component.html
│   │
│   └── theme/                        ❌ CRIAR
│       ├── theme-provider.component.ts
│       └── theme-injector.directive.ts
│
├── services/
│   ├── theme.service.ts              ❌ CRIAR
│   ├── theme-loader.service.ts       ❌ CRIAR
│   └── website-customization.service.ts ✅ JÁ EXISTE
│
├── models/
│   ├── theme.model.ts                ✅ JÁ EXISTE (melhorar)
│   └── website-layout.model.ts       ✅ JÁ EXISTE
│
├── components/
│   ├── website-builder/              ✅ MODO EDIÇÃO
│   │   └── website-builder.component.ts
│   │
│   └── public-website/               ✅ MODO PÚBLICO
│       └── public-website.component.ts
│
└── styles/
    ├── _theme-variables.scss         ❌ CRIAR
    ├── _design-tokens.scss           ❌ CRIAR
    └── styles.scss                   ✅ JÁ EXISTE (atualizar)
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### FASE 1: Sistema de Tema Global (ALTA PRIORIDADE)

#### 1.1 Criar ThemeService
```typescript
// src/app/services/theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemeConfig | null>(null);
  theme$ = this.themeSubject.asObservable();

  async loadTheme(companyId: string): Promise<void>;
  updateTheme(theme: Partial<ThemeConfig>): void;
  applyCSSVariables(theme: ThemeConfig): void;
  resetToDefaults(): void;
  saveTheme(companyId: string, theme: ThemeConfig): Promise<void>;
}
```

#### 1.2 Criar ThemeLoaderService
```typescript
// src/app/services/theme-loader.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeLoaderService {
  loadFromDatabase(companyId: string): Promise<ThemeConfig>;
  loadFromLocalStorage(): ThemeConfig | null;
  saveToLocalStorage(theme: ThemeConfig): void;
}
```

#### 1.3 Criar Arquivo de CSS Variables
```scss
// src/app/styles/_theme-variables.scss
:root {
  // Cores (valores padrão, serão sobrescritos dinamicamente)
  --primary-color: #004AAD;
  --secondary-color: #FFA500;
  // ... etc
}
```

#### 1.4 Criar ThemeProviderComponent
```typescript
// Wrapper component que injeta o tema
@Component({
  selector: 'app-theme-provider',
  template: '<ng-content></ng-content>',
  standalone: true
})
export class ThemeProviderComponent implements OnInit {
  @Input() companyId!: string;
  
  constructor(private themeService: ThemeService) {}
  
  async ngOnInit() {
    await this.themeService.loadTheme(this.companyId);
  }
}
```

### FASE 2: Refatorar Componentes para Usar Tema

#### 2.1 Atualizar Header Component
**ANTES:**
```typescript
@HostBinding('style.background-color')
get backgroundColor() {
  return this.style?.backgroundColor || '#ffffff';
}
```

**DEPOIS:**
```typescript
// Remove @HostBinding, usa CSS variables no SCSS
```

```scss
// header.component.scss
.header-container {
  background-color: var(--bg-primary, #ffffff);
  color: var(--text-color, #333333);
}
```

#### 2.2 Atualizar TODOS os componentes
- ❌ Remover estilos inline hardcoded
- ✅ Usar CSS variables
- ✅ Fallback para valores padrão

### FASE 3: Melhorar Header e Footer

#### 3.1 Expandir HeaderConfig
```typescript
interface HeaderConfig {
  // Logo
  logo: string;
  logoHeight?: string;
  logoAlignment?: 'left' | 'center' | 'right';
  
  // Layout
  layout?: 'horizontal' | 'vertical' | 'hamburger';
  sticky?: boolean;
  transparent?: boolean;
  
  // Navegação
  navigation: NavItem[];
  showSearch: boolean;
  
  // CTA Button
  ctaButton?: {
    text: string;
    link: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  
  // Estilos customizados
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  fontSize?: string;
}
```

#### 3.2 Expandir FooterConfig
```typescript
interface FooterConfig {
  // Layout
  layout?: 'columns' | 'centered' | 'minimal';
  
  // Conteúdo
  logo?: string;
  columns: FooterColumn[];
  copyrightText: string;
  
  // Social
  showSocialLinks?: boolean;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  
  // Newsletter
  showNewsletter?: boolean;
  newsletterText?: string;
  
  // Estilos
  backgroundColor?: string;
  textColor?: string;
}
```

#### 3.3 Atualizar Metadata dos Componentes
```typescript
// header.metadata.ts
export const HEADER_METADATA: ComponentMetadata = {
  type: 'header',
  label: 'Cabeçalho',
  icon: '📋',
  category: 'navigation',
  description: 'Cabeçalho personalizável com logo, menu e busca',
  schema: {
    fields: [
      {
        key: 'logo',
        label: 'Logo (URL ou texto)',
        type: 'text',
        required: true
      },
      {
        key: 'logoHeight',
        label: 'Altura do Logo',
        type: 'text',
        placeholder: '50px'
      },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        options: [
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Vertical', value: 'vertical' },
          { label: 'Hamburger (Mobile)', value: 'hamburger' }
        ],
        defaultValue: 'horizontal'
      },
      {
        key: 'sticky',
        label: 'Header Fixo (Sticky)',
        type: 'checkbox',
        defaultValue: false
      },
      // ... mais campos
    ],
    styleFields: [
      {
        key: 'backgroundColor',
        label: 'Cor de Fundo',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        key: 'textColor',
        label: 'Cor do Texto',
        type: 'color',
        defaultValue: '#333333'
      }
    ]
  },
  defaultConfig: {
    logo: 'Imobiliária',
    layout: 'horizontal',
    sticky: false,
    navigation: [
      { label: 'Home', link: '/' },
      { label: 'Imóveis', link: '/properties' },
      { label: 'Contato', link: '/contact' }
    ],
    showSearch: true
  }
};
```

### FASE 4: Live Preview e Sincronização

#### 4.1 Implementar Sistema Reativo
```typescript
// website-builder.component.ts
export class WebsiteBuilderComponent {
  private sectionsSubject = new BehaviorSubject<LayoutSection[]>([]);
  sections$ = this.sectionsSubject.asObservable();
  
  updateSectionConfig(sectionId: string, config: any) {
    const updated = this.sections.map(s =>
      s.id === sectionId ? { ...s, config: { ...s.config, ...config } } : s
    );
    this.sectionsSubject.next(updated);
  }
  
  updateSectionStyle(sectionId: string, style: any) {
    const updated = this.sections.map(s =>
      s.id === sectionId ? { ...s, style: { ...s.style, ...style } } : s
    );
    this.sectionsSubject.next(updated);
  }
}
```

#### 4.2 Preview Consome Observable
```typescript
// No template do preview
<ng-container *ngFor="let section of sections$ | async">
  <ng-container *appRenderComponent="section; editMode: false"></ng-container>
</ng-container>
```

#### 4.3 Property Editor Emite Mudanças
```typescript
// property-editor.component.ts
updateConfig(key: string, value: any) {
  this.section.config[key] = value;
  this.configChange.emit(this.section.config);
}
```

### FASE 5: Melhorias no Editor de Propriedades

#### 5.1 Color Picker com Preview
```html
<div class="field-color">
  <label>{{ field.label }}</label>
  <input type="color" [(ngModel)]="section.config[field.key]">
  <div class="color-preview" [style.background-color]="section.config[field.key]"></div>
  <input type="text" [(ngModel)]="section.config[field.key]" placeholder="#000000">
</div>
```

#### 5.2 Image Upload Component
```typescript
@Component({
  selector: 'app-image-upload',
  template: `
    <div class="image-upload">
      <input type="file" (change)="onFileSelect($event)" accept="image/*">
      <img *ngIf="imageUrl" [src]="imageUrl" class="preview">
      <button (click)="removeImage()">Remover</button>
    </div>
  `
})
export class ImageUploadComponent {
  @Input() imageUrl?: string;
  @Output() imageChange = new EventEmitter<string>();
  
  async onFileSelect(event: any) {
    const file = event.target.files[0];
    // Upload to Supabase Storage
    const url = await this.uploadService.uploadImage(file);
    this.imageChange.emit(url);
  }
}
```

#### 5.3 Rich Text Editor
```html
<!-- Integrar Quill ou TinyMCE -->
<quill-editor 
  [(ngModel)]="section.config[field.key]"
  (ngModelChange)="updateConfig(field.key, $event)">
</quill-editor>
```

### FASE 6: Schema de Banco de Dados

#### 6.1 Migration para Tabela de Temas
```sql
-- migration-company-themes.sql
CREATE TABLE IF NOT EXISTS company_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Cores Principais
  primary_color VARCHAR(7) NOT NULL DEFAULT '#004AAD',
  secondary_color VARCHAR(7) NOT NULL DEFAULT '#FFA500',
  accent_color VARCHAR(7) NOT NULL DEFAULT '#2c7a7b',
  text_color VARCHAR(7) NOT NULL DEFAULT '#333333',
  text_light_color VARCHAR(7) NOT NULL DEFAULT '#718096',
  background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  background_dark VARCHAR(7) NOT NULL DEFAULT '#1a202c',
  border_color VARCHAR(7) NOT NULL DEFAULT '#e2e8f0',
  
  -- Cores de Status
  success_color VARCHAR(7) NOT NULL DEFAULT '#10b981',
  error_color VARCHAR(7) NOT NULL DEFAULT '#ef4444',
  warning_color VARCHAR(7) NOT NULL DEFAULT '#f59e0b',
  info_color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  link_color VARCHAR(7) NOT NULL DEFAULT '#004AAD',
  
  -- Tipografia
  font_family VARCHAR(255) NOT NULL DEFAULT 'Inter, system-ui, sans-serif',
  font_size VARCHAR(20) NOT NULL DEFAULT '1rem',
  font_weight VARCHAR(20) NOT NULL DEFAULT '400',
  line_height VARCHAR(20) NOT NULL DEFAULT '1.6',
  
  -- Espaçamentos
  border_radius VARCHAR(20) NOT NULL DEFAULT '8px',
  padding_small VARCHAR(20) NOT NULL DEFAULT '0.5rem',
  padding_medium VARCHAR(20) NOT NULL DEFAULT '1rem',
  padding_large VARCHAR(20) NOT NULL DEFAULT '2rem',
  margin_small VARCHAR(20) NOT NULL DEFAULT '0.5rem',
  margin_medium VARCHAR(20) NOT NULL DEFAULT '1rem',
  margin_large VARCHAR(20) NOT NULL DEFAULT '2rem',
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(company_id)
);

-- Índices
CREATE INDEX idx_company_themes_company ON company_themes(company_id);

-- Trigger de atualização
CREATE TRIGGER update_company_themes_updated_at
  BEFORE UPDATE ON company_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed com tema padrão para empresas existentes
INSERT INTO company_themes (company_id)
SELECT id FROM companies
WHERE id NOT IN (SELECT company_id FROM company_themes);
```

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ JÁ IMPLEMENTADO
- [x] Componentes compartilhados em `shared/website-components`
- [x] Interface `WebsiteComponentBase` com `editMode`
- [x] Sistema de registro de componentes
- [x] Diretiva de renderização dinâmica
- [x] Property editor baseado em schemas
- [x] 14 componentes funcionais
- [x] Separação visual entre modo edição e leitura

### 🔄 EM DESENVOLVIMENTO / MELHORAR
- [ ] Sistema de tema global centralizado
- [ ] CSS Variables dinâmicas
- [ ] Header altamente customizável
- [ ] Footer altamente customizável
- [ ] Live preview reativo
- [ ] Upload de imagens
- [ ] Rich text editor

### ❌ PENDENTE / CRIAR DO ZERO
- [ ] `ThemeService`
- [ ] `ThemeLoaderService`
- [ ] `ThemeProviderComponent`
- [ ] Tabela `company_themes` no banco
- [ ] Arquivo `_theme-variables.scss`
- [ ] Undo/Redo system
- [ ] Version history
- [ ] A/B testing de layouts

---

## 🎨 EXEMPLO DE FLUXO COMPLETO

### 1. Usuário Entra no CRM
```typescript
// app.component.ts (ou no guard)
async ngOnInit() {
  const user = this.authService.getCurrentUser();
  if (user?.company_id) {
    // Carrega tema da empresa
    await this.themeService.loadTheme(user.company_id);
  }
}
```

### 2. ThemeService Carrega e Aplica
```typescript
// theme.service.ts
async loadTheme(companyId: string) {
  const theme = await this.themeLoader.loadFromDatabase(companyId);
  this.themeSubject.next(theme);
  this.applyCSSVariables(theme);
}

private applyCSSVariables(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', theme.primaryColor);
  root.style.setProperty('--secondary-color', theme.secondaryColor);
  // ... todas as variáveis
}
```

### 3. Editor Atualiza Configuração
```typescript
// property-editor.component.ts
updateConfig(key: string, value: any) {
  this.section.config[key] = value;
  this.configChange.emit({ sectionId: this.section.id, config: this.section.config });
}
```

### 4. Builder Propaga Mudanças
```typescript
// website-builder.component.ts
onConfigChange(event: { sectionId: string, config: any }) {
  this.updateSectionConfig(event.sectionId, event.config);
  // Observable atualiza preview automaticamente
}
```

### 5. Preview Renderiza em Tempo Real
```html
<!-- Preview renderiza via Observable -->
<div class="preview-panel" *ngIf="livePreviewEnabled">
  <ng-container *ngFor="let section of sections$ | async">
    <ng-container *appRenderComponent="section; editMode: false"></ng-container>
  </ng-container>
</div>
```

### 6. Site Público Usa Mesmos Componentes
```typescript
// public-website.component.ts
async loadWebsite() {
  // Carrega layout da empresa
  this.layout = await this.customizationService.getLayoutByPageType(
    this.companyId, 
    'home'
  );
  
  // Carrega tema
  await this.themeService.loadTheme(this.companyId);
  
  // Renderiza seções (mesma diretiva, editMode: false)
  this.sections = this.layout.layout_config.sections;
}
```

---

## 📈 BENEFÍCIOS APÓS REFATORAÇÃO

### 1. Para Desenvolvedores
- ✅ Código mais limpo e organizado
- ✅ Fácil adicionar novos componentes
- ✅ Manutenção centralizada
- ✅ Testes mais simples
- ✅ Menos bugs de inconsistência

### 2. Para Usuários (Imobiliárias)
- ✅ WYSIWYG real - o que vê é o que publica
- ✅ Personalização completa de marca
- ✅ Preview instantâneo
- ✅ Sem surpresas ao publicar
- ✅ Tema consistente em todo o site

### 3. Para Performance
- ✅ Menos código duplicado
- ✅ CSS Variables são mais performáticas
- ✅ Componentes lazy-loaded
- ✅ Bundle size menor

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Quebrar Sites Publicados
**Mitigação:**
- Criar branch separado
- Testar extensivamente
- Migration gradual
- Versioning de layouts

### Risco 2: Perda de Dados de Tema
**Mitigação:**
- Backup da tabela antes da migration
- Valores padrão sempre definidos
- Rollback plan

### Risco 3: Performance do Preview
**Mitigação:**
- Debounce nas atualizações
- Virtual scrolling para muitos componentes
- Lazy loading de imagens

---

## 📅 CRONOGRAMA ESTIMADO

### Sprint 1 (1 semana) - Sistema de Tema
- Criar `ThemeService` e `ThemeLoaderService`
- Criar tabela `company_themes`
- Implementar CSS Variables
- Testar carregamento de tema

### Sprint 2 (1 semana) - Refatorar Componentes
- Atualizar todos os componentes para usar CSS Variables
- Remover estilos hardcoded
- Testar consistência visual

### Sprint 3 (1 semana) - Header e Footer Melhorados
- Expandir configs de Header e Footer
- Atualizar metadata
- Implementar novos layouts

### Sprint 4 (1 semana) - Live Preview
- Sistema reativo de atualização
- Sincronização em tempo real
- Otimizações de performance

### Sprint 5 (1 semana) - Editor Melhorado
- Image upload
- Color picker melhorado
- Rich text editor
- Validações

### Sprint 6 (1 semana) - Testes e Refinamentos
- Testes end-to-end
- Correções de bugs
- Documentação
- Deploy

**TOTAL: 6 semanas (1.5 meses)**

---

## 🎓 CONCLUSÃO

### Estado Atual: 70% Implementado ✅
A arquitetura base já está correta! Os componentes já são compartilhados e o sistema de editMode funciona bem.

### Faltam: 30% de Melhorias 🔄
- Sistema de tema centralizado
- CSS Variables dinâmicas
- Customização avançada de Header/Footer
- Live preview reativo
- Editor de propriedades melhorado

### Resultado Final: 100% Unificado 🎯
Após a refatoração, o que o usuário monta no CRM será **EXATAMENTE** o que aparece no site público, sem nenhuma divergência visual ou estrutural.

---

**Documento criado em:** 02/01/2026  
**Versão:** 1.0  
**Status:** Aguardando aprovação para implementação
