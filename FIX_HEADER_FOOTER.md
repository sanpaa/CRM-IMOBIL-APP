# 🔧 CORREÇÃO: Header e Footer no Site Público

## 🐛 PROBLEMA IDENTIFICADO

O componente `public-website.component.ts` está renderizando apenas as **sections** do layout, mas **NÃO está renderizando o header e footer** que deveriam estar sempre visíveis.

### Código Atual (INCORRETO)
```typescript
// public-website.component.ts
<ng-container *ngFor="let section of sections">
  <ng-container *appRenderComponent="section; editMode: false"></ng-container>
</ng-container>
```

**Problema:** Só renderiza as sections (hero, property-grid, etc), mas **não renderiza header e footer!**

---

## ✅ SOLUÇÃO

O header e footer devem ser:
1. **Sempre renderizados** (em todas as páginas)
2. **Configuráveis** (logo, menu, cores)
3. **Compartilhar os mesmos componentes** do CRM

### Opções de Implementação

#### OPÇÃO 1: Header e Footer como Sections Especiais (RECOMENDADO)

Garantir que o header seja sempre a **primeira section** e o footer a **última section** em todos os layouts.

**Vantagens:**
- ✅ Usa o mesmo sistema de renderização
- ✅ Configurável via CRM
- ✅ Ordem garantida

**Implementação:**

```typescript
// website-customization.service.ts
async getLayoutByPageType(companyId: string, pageType: string): Promise<WebsiteLayout | null> {
  const layout = await this.getLayout(...);
  
  // Garantir que header e footer estão sempre presentes
  if (layout) {
    layout.layout_config.sections = this.ensureHeaderAndFooter(
      layout.layout_config.sections,
      companyId
    );
  }
  
  return layout;
}

private ensureHeaderAndFooter(sections: LayoutSection[], companyId: string): LayoutSection[] {
  const hasHeader = sections.some(s => s.type === 'header');
  const hasFooter = sections.some(s => s.type === 'footer');
  
  const result = [...sections];
  
  // Adicionar header no início se não existir
  if (!hasHeader) {
    result.unshift({
      id: `header-${companyId}`,
      type: 'header',
      order: -1,
      config: {
        logo: 'Imobiliária',
        navigation: [
          { label: 'Início', link: '/' },
          { label: 'Imóveis', link: '/imoveis' },
          { label: 'Contato', link: '/contato' }
        ],
        showSearch: true
      }
    });
  }
  
  // Adicionar footer no final se não existir
  if (!hasFooter) {
    result.push({
      id: `footer-${companyId}`,
      type: 'footer',
      order: 9999,
      config: {
        columns: [
          {
            title: 'Empresa',
            links: [
              { label: 'Sobre', link: '/sobre' }
            ]
          }
        ],
        copyrightText: '© 2026 Todos os direitos reservados'
      }
    });
  }
  
  // Reordenar
  result.sort((a, b) => a.order - b.order);
  
  return result;
}
```

#### OPÇÃO 2: Layout Wrapper Component (ALTERNATIVO)

Criar um componente wrapper que sempre renderiza header e footer + conteúdo dinâmico.

```typescript
// public-website.component.ts
<div class="public-website" *ngIf="!loading && layout">
  <!-- Header sempre visível -->
  <app-header-component 
    [editMode]="false"
    [config]="headerConfig">
  </app-header-component>

  <!-- Conteúdo dinâmico (sections) -->
  <main class="main-content">
    <ng-container *ngFor="let section of sections">
      <ng-container *appRenderComponent="section; editMode: false"></ng-container>
    </ng-container>
  </main>

  <!-- Footer sempre visível -->
  <app-footer-component 
    [editMode]="false"
    [config]="footerConfig">
  </app-footer-component>
</div>
```

```typescript
export class PublicWebsiteComponent implements OnInit {
  headerConfig: any;
  footerConfig: any;
  sections: LayoutSection[] = [];
  
  async loadWebsite() {
    this.layout = await this.customizationService.getLayoutByPageType(this.companyId, 'home');
    
    if (this.layout) {
      const allSections = this.layout.layout_config?.sections || [];
      
      // Separar header, footer e content
      this.headerConfig = allSections.find(s => s.type === 'header')?.config || defaultHeader;
      this.footerConfig = allSections.find(s => s.type === 'footer')?.config || defaultFooter;
      this.sections = allSections.filter(s => s.type !== 'header' && s.type !== 'footer');
    }
  }
}
```

---

## 🚀 IMPLEMENTAÇÃO RECOMENDADA

Vou criar a correção usando a **OPÇÃO 2** (mais clara e explícita):

### 1. Atualizar public-website.component.ts
### 2. Importar HeaderComponent e FooterComponent
### 3. Adicionar lógica para separar header/footer das sections

---

## 📝 CHECKLIST

- [ ] Importar HeaderComponent no public-website.component.ts
- [ ] Importar FooterComponent no public-website.component.ts
- [ ] Adicionar propriedades headerConfig e footerConfig
- [ ] Modificar loadWebsite() para separar header/footer
- [ ] Atualizar template HTML
- [ ] Testar renderização
- [ ] Verificar responsividade

---

**Vou implementar a correção agora!**
