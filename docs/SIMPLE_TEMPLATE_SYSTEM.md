# Sistema simples de templates (proposta)

## 1) Arquitetura técnica (3 camadas)

### A) Template (controlado pelo desenvolvedor)
- JSON versionado com estrutura de seções e tema.
- Define layout, ordem de seções e identidade visual base.
- Não contém conteúdo do cliente.

### B) Configuração do cliente
- JSON mínimo com campos editáveis (nome, logo, cor, whatsapp, textos).
- Nenhum controle sobre layout.

### C) Renderizador do site público
- Carrega Template + Configuração.
- Mescla defaults do template com o config do cliente.
- Renderiza seções fixas (componentes Angular).
- Nunca salva HTML ou CSS.

## 2) Fluxo de dados (editor -> banco -> site)

1. Admin escolhe template no painel.
2. Cliente edita apenas os campos permitidos.
3. Frontend salva apenas: `siteId`, `templateId` e `config`.
4. Site público consulta o `templateId`, carrega o JSON do template.
5. Renderizador mescla `template.theme.defaults` + `config`.
6. Seções são renderizadas por componentes fixos.

## 3) Estrutura de pastas sugerida

```
src/
  app/
    models/
      template-definition.model.ts
      site-config.model.ts
    services/
      site-renderer.service.ts
      site-config.service.ts
    site-renderer/
      site-renderer.component.ts
      site-renderer.component.html
      sections/
        hero/
        imoveis-grid/
        sobre/
        contato/
        footer/
  assets/
    site-templates/
      classico-imobiliaria-v1/
        template.json
        base.html
        base.css
      moderno-dark-v1/
        template.json
        base.html
        base.css
      alto-padrao-v1/
        template.json
        base.html
        base.css
```

## 4) Exemplo Angular (renderização simples)

```ts
// src/app/models/template-definition.model.ts
export interface TemplateDefinition {
  id: string;
  name: string;
  preview: string;
  sections: Array<'hero' | 'imoveis' | 'sobre' | 'contato' | 'footer'>;
  theme: {
    fonts: { title: string; body: string };
    defaults: {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      cardColor?: string;
    };
  };
}

// src/app/models/site-config.model.ts
export interface SiteConfig {
  companyName: string;
  logo: string;
  primaryColor: string;
  whatsapp: string;
  heroTitle: string;
  heroText: string;
  aboutText: string;
  contactText: string;
}
```

```ts
// src/app/site-renderer/site-renderer.component.ts
import { Component, Input } from '@angular/core';
import { TemplateDefinition } from '../models/template-definition.model';
import { SiteConfig } from '../models/site-config.model';

@Component({
  selector: 'app-site-renderer',
  templateUrl: './site-renderer.component.html'
})
export class SiteRendererComponent {
  @Input() template!: TemplateDefinition;
  @Input() config!: SiteConfig;

  get mergedConfig(): SiteConfig & TemplateDefinition['theme']['defaults'] {
    return {
      ...this.template.theme.defaults,
      ...this.config
    };
  }
}
```

```html
<!-- src/app/site-renderer/site-renderer.component.html -->
<ng-container *ngFor="let section of template.sections">
  <app-hero-section
    *ngIf="section === 'hero'"
    [config]="mergedConfig"
  ></app-hero-section>

  <app-imoveis-grid
    *ngIf="section === 'imoveis'"
    [config]="mergedConfig"
  ></app-imoveis-grid>

  <app-sobre-section
    *ngIf="section === 'sobre'"
    [config]="mergedConfig"
  ></app-sobre-section>

  <app-contato-section
    *ngIf="section === 'contato'"
    [config]="mergedConfig"
  ></app-contato-section>

  <app-footer-section
    *ngIf="section === 'footer'"
    [config]="mergedConfig"
  ></app-footer-section>
</ng-container>
```

```ts
// Exemplo simples de bloco (HeroSection)
renderHero(config: SiteConfig & { primaryColor: string }) {
  const title = config.companyName;
  const color = config.primaryColor;
  return { title, color };
}
```

## 5) Checklist (novo template em menos de 30 minutos)

1. Criar pasta do template em `src/assets/site-templates/<id>`.
2. Copiar `template.json` e ajustar `id`, `name`, `preview`, `sections` e `theme.defaults`.
3. Ajustar `base.html` e `base.css` (somente layout e estilo).
4. Adicionar preview estático (imagem) em `preview`.
5. Testar com um `config` mínimo (nome, logo, cor, whatsapp, textos).
6. Publicar versão `-v1`, `-v2` etc quando mudar layout.

Observação: `base.html` e `base.css` servem para preview/compatibilidade. O render oficial é feito pelos componentes Angular.
