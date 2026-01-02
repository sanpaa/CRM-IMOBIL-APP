# 🌐 ARQUITETURA MULTI-TENANT - SITE PÚBLICO

## 📋 CONTEXTO CORRIGIDO

Este repositório é o **SITE PÚBLICO** que atende múltiplos clientes imobiliários.

### ❌ NÃO É:
- ❌ Um CRM completo
- ❌ Um site estático por cliente
- ❌ Build separado por domínio
- ❌ Configurações hardcoded

### ✅ É:
- ✅ **Aplicação única multi-tenant**
- ✅ **Resolve por domínio** (alancarmo.com.br, alancarmojuridico.com.br)
- ✅ **Tema 100% dinâmico** (vindo do backend)
- ✅ **Layout 100% dinâmico** (vindo do backend)
- ✅ **Componentes compartilhados** (mesmos do CRM)

---

## 🎯 OBJETIVO PRINCIPAL

Quando um usuário acessa qualquer domínio apontado para esta aplicação:

```
Usuário acessa → alancarmo.com.br
                       ↓
           Captura hostname no frontend
                       ↓
         GET /public/site-by-domain/alancarmo.com.br
                       ↓
           Backend retorna configuração
                       ↓
              { companyId, theme, layout, pages }
                       ↓
           Aplica tema via CSS Variables
                       ↓
           Renderiza componentes dinamicamente
                       ↓
           Site personalizado exibido ✅
```

---

## 🏗️ ARQUITETURA PROPOSTA

### 1. Fluxo de Inicialização

```typescript
// app.component.ts ou APP_INITIALIZER
1. Capturar window.location.hostname
2. Chamar DomainResolverService.resolve(hostname)
3. DomainResolverService → GET /public/site-by-domain/{hostname}
4. Backend retorna SiteConfig
5. ThemeService.applyTheme(config.theme)
6. SiteConfigService.setConfig(config)
7. Router libera navegação
8. Componentes renderizam com config
```

### 2. Estrutura de Pastas do Site Público

```
src/app/
├── core/
│   ├── services/
│   │   ├── domain-resolver.service.ts      ⭐ NOVO - Resolve domínio
│   │   ├── site-config.service.ts          ⭐ NOVO - Gerencia config global
│   │   ├── theme.service.ts                ⭐ NOVO - Aplica tema dinâmico
│   │   └── public-api.service.ts           ⭐ NOVO - API pública
│   │
│   ├── guards/
│   │   └── site-loaded.guard.ts            ⭐ NOVO - Garante site carregado
│   │
│   ├── interceptors/
│   │   └── domain-context.interceptor.ts   ⭐ NOVO - Injeta companyId
│   │
│   └── models/
│       ├── site-config.model.ts            ⭐ NOVO - Config do site
│       ├── theme-config.model.ts           ⭐ NOVO - Config de tema
│       └── page-config.model.ts            ⭐ NOVO - Config de página
│
├── shared/
│   ├── website-components/                 ✅ JÁ EXISTE
│   │   ├── header/
│   │   ├── footer/
│   │   ├── hero/
│   │   └── ... componentes compartilhados
│   │
│   └── resolvers/
│       └── page-data.resolver.ts           ⭐ NOVO - Resolve dados de página
│
├── pages/
│   ├── home/
│   │   └── home.component.ts               🔄 Dinâmico
│   ├── properties/
│   │   ├── properties-list.component.ts    🔄 Dinâmico
│   │   └── property-detail.component.ts    🔄 Dinâmico
│   ├── about/
│   │   └── about.component.ts              🔄 Dinâmico
│   ├── contact/
│   │   └── contact.component.ts            🔄 Dinâmico
│   └── not-found/
│       └── not-found.component.ts          ⭐ 404 personalizado
│
├── layouts/
│   └── main-layout/
│       └── main-layout.component.ts        🔄 Header/Footer dinâmicos
│
├── app.component.ts                        🔄 Inicialização
├── app.config.ts                           🔄 APP_INITIALIZER
└── app.routes.ts                           🔄 Rotas dinâmicas
```

---

## 📝 IMPLEMENTAÇÃO DETALHADA

### 1. Model: SiteConfig

```typescript
// src/app/core/models/site-config.model.ts

export interface SiteConfig {
  companyId: string;
  companyName: string;
  domain: string;
  theme: ThemeConfig;
  layout: LayoutConfig;
  pages: PageConfig[];
  seo: SeoConfig;
  features: FeatureFlags;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundDark: string;
    text: string;
    textLight: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
  };
  spacing: {
    borderRadius: string;
    paddingSmall: string;
    paddingMedium: string;
    paddingLarge: string;
  };
}

export interface LayoutConfig {
  header: {
    logo: string;
    logoHeight?: string;
    layout: 'horizontal' | 'vertical' | 'hamburger';
    sticky: boolean;
    backgroundColor?: string;
    textColor?: string;
    navigation: NavItem[];
    ctaButton?: CtaButton;
  };
  footer: {
    logo?: string;
    backgroundColor?: string;
    textColor?: string;
    columns: FooterColumn[];
    copyrightText: string;
    socialLinks?: SocialLinks;
    showNewsletter?: boolean;
  };
}

export interface PageConfig {
  id: string;
  slug: string;
  type: 'home' | 'properties' | 'property-detail' | 'about' | 'contact' | 'custom';
  name: string;
  isActive: boolean;
  sections: PageSection[];
  seo?: PageSeo;
}

export interface PageSection {
  id: string;
  type: string;
  order: number;
  config: any;
  style?: any;
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string[];
  favicon?: string;
  ogImage?: string;
  twitterCard?: string;
}

export interface FeatureFlags {
  showSearch: boolean;
  showNewsletter: boolean;
  showWhatsApp: boolean;
  whatsAppNumber?: string;
  enableAnalytics: boolean;
  analyticsId?: string;
}

export interface NavItem {
  label: string;
  link: string;
  external?: boolean;
}

export interface CtaButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary' | 'outline';
}

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface PageSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}
```

---

### 2. Service: DomainResolverService

```typescript
// src/app/core/services/domain-resolver.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SiteConfig } from '../models/site-config.model';

@Injectable({
  providedIn: 'root'
})
export class DomainResolverService {
  private siteConfigSubject = new BehaviorSubject<SiteConfig | null>(null);
  public siteConfig$ = this.siteConfigSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private resolvedDomain: string | null = null;
  private configCache: Map<string, SiteConfig> = new Map();

  constructor(private http: HttpClient) {}

  /**
   * Resolve site configuration by domain
   * Returns cached config if already loaded for this domain
   */
  async resolveSite(hostname?: string): Promise<SiteConfig> {
    const domain = hostname || this.getCurrentDomain();
    
    // Check cache first
    if (this.configCache.has(domain)) {
      const cached = this.configCache.get(domain)!;
      this.siteConfigSubject.next(cached);
      return cached;
    }

    // Avoid duplicate requests
    if (this.resolvedDomain === domain && this.siteConfigSubject.value) {
      return this.siteConfigSubject.value;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const config = await this.fetchSiteConfig(domain);
      
      // Cache the result
      this.configCache.set(domain, config);
      this.resolvedDomain = domain;
      
      // Update subjects
      this.siteConfigSubject.next(config);
      this.loadingSubject.next(false);
      
      console.log('✅ Site resolved:', domain, config);
      return config;
      
    } catch (error: any) {
      this.loadingSubject.next(false);
      
      const errorMessage = this.handleError(error);
      this.errorSubject.next(errorMessage);
      
      throw error;
    }
  }

  /**
   * Fetch site config from backend
   */
  private async fetchSiteConfig(domain: string): Promise<SiteConfig> {
    const url = `${environment.apiUrl}/public/site-by-domain/${encodeURIComponent(domain)}`;
    
    return this.http.get<SiteConfig>(url)
      .pipe(
        tap(config => {
          if (!config || !config.companyId) {
            throw new Error('Invalid site configuration received');
          }
        }),
        catchError(error => {
          console.error('Error fetching site config:', error);
          throw error;
        })
      )
      .toPromise() as Promise<SiteConfig>;
  }

  /**
   * Get current domain from window.location
   */
  private getCurrentDomain(): string {
    if (typeof window === 'undefined') {
      return 'localhost'; // SSR fallback
    }

    let hostname = window.location.hostname;
    
    // Remove 'www.' prefix if exists
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // For local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Check if there's a domain override in localStorage
      const overrideDomain = localStorage.getItem('dev_domain_override');
      if (overrideDomain) {
        console.log('🔧 Using domain override:', overrideDomain);
        return overrideDomain;
      }
    }
    
    return hostname;
  }

  /**
   * Get current site config (sync)
   */
  getCurrentSiteConfig(): SiteConfig | null {
    return this.siteConfigSubject.value;
  }

  /**
   * Check if site is loaded
   */
  isSiteLoaded(): boolean {
    return this.siteConfigSubject.value !== null;
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.configCache.clear();
    this.resolvedDomain = null;
    console.log('🗑️ Domain cache cleared');
  }

  /**
   * Set domain override for development
   */
  setDomainOverride(domain: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev_domain_override', domain);
      console.log('🔧 Domain override set:', domain);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: any): string {
    if (error.status === 404) {
      return 'Site not found for this domain';
    } else if (error.status === 500) {
      return 'Server error. Please try again later';
    } else if (error.status === 0) {
      return 'Network error. Please check your connection';
    } else {
      return error.message || 'Unknown error occurred';
    }
  }
}
```

---

### 3. Service: SiteConfigService

```typescript
// src/app/core/services/site-config.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SiteConfig, PageConfig } from '../models/site-config.model';

@Injectable({
  providedIn: 'root'
})
export class SiteConfigService {
  private configSubject = new BehaviorSubject<SiteConfig | null>(null);
  public config$: Observable<SiteConfig | null> = this.configSubject.asObservable();

  constructor() {}

  /**
   * Set site configuration
   */
  setConfig(config: SiteConfig): void {
    this.configSubject.next(config);
  }

  /**
   * Get current configuration
   */
  getConfig(): SiteConfig | null {
    return this.configSubject.value;
  }

  /**
   * Get company ID
   */
  getCompanyId(): string | null {
    return this.configSubject.value?.companyId || null;
  }

  /**
   * Get page by slug
   */
  getPageBySlug(slug: string): PageConfig | null {
    const config = this.configSubject.value;
    if (!config) return null;

    return config.pages.find(page => 
      page.slug === slug && page.isActive
    ) || null;
  }

  /**
   * Get page by type
   */
  getPageByType(type: string): PageConfig | null {
    const config = this.configSubject.value;
    if (!config) return null;

    return config.pages.find(page => 
      page.type === type && page.isActive
    ) || null;
  }

  /**
   * Get all active pages
   */
  getActivePages(): PageConfig[] {
    const config = this.configSubject.value;
    if (!config) return [];

    return config.pages.filter(page => page.isActive);
  }

  /**
   * Get navigation items from header config
   */
  getNavigationItems() {
    return this.configSubject.value?.layout.header.navigation || [];
  }

  /**
   * Get WhatsApp number if enabled
   */
  getWhatsAppNumber(): string | null {
    const config = this.configSubject.value;
    if (!config || !config.features.showWhatsApp) return null;
    return config.features.whatsAppNumber || null;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof SiteConfig['features']): boolean {
    return this.configSubject.value?.features[feature] || false;
  }
}
```

---

### 4. Service: ThemeService (Dinâmico)

```typescript
// src/app/core/services/theme.service.ts

import { Injectable } from '@angular/core';
import { ThemeConfig } from '../models/site-config.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: ThemeConfig | null = null;

  constructor() {}

  /**
   * Apply theme to document
   * Sets CSS variables dynamically
   */
  applyTheme(theme: ThemeConfig): void {
    this.currentTheme = theme;
    const root = document.documentElement;

    // Apply color variables
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--background-dark', theme.colors.backgroundDark);
    root.style.setProperty('--text', theme.colors.text);
    root.style.setProperty('--text-light', theme.colors.textLight);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--success', theme.colors.success);
    root.style.setProperty('--error', theme.colors.error);
    root.style.setProperty('--warning', theme.colors.warning);
    root.style.setProperty('--info', theme.colors.info);

    // Apply typography variables
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-size', theme.typography.fontSize);
    root.style.setProperty('--font-weight', theme.typography.fontWeight);
    root.style.setProperty('--line-height', theme.typography.lineHeight);

    // Apply spacing variables
    root.style.setProperty('--border-radius', theme.spacing.borderRadius);
    root.style.setProperty('--padding-sm', theme.spacing.paddingSmall);
    root.style.setProperty('--padding-md', theme.spacing.paddingMedium);
    root.style.setProperty('--padding-lg', theme.spacing.paddingLarge);

    console.log('✅ Theme applied:', theme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  /**
   * Get specific color
   */
  getColor(colorName: keyof ThemeConfig['colors']): string | undefined {
    return this.currentTheme?.colors[colorName];
  }
}
```

---

### 5. APP_INITIALIZER

```typescript
// src/app/app.config.ts

import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { DomainResolverService } from './core/services/domain-resolver.service';
import { ThemeService } from './core/services/theme.service';
import { SiteConfigService } from './core/services/site-config.service';

/**
 * Initialize application by resolving domain and loading site config
 */
export function initializeApp(
  domainResolver: DomainResolverService,
  themeService: ThemeService,
  siteConfigService: SiteConfigService
) {
  return async () => {
    try {
      console.log('🚀 Initializing application...');
      
      // Resolve site by domain
      const siteConfig = await domainResolver.resolveSite();
      
      // Set config globally
      siteConfigService.setConfig(siteConfig);
      
      // Apply theme
      themeService.applyTheme(siteConfig.theme);
      
      // Update document title and meta tags
      updateSeo(siteConfig);
      
      console.log('✅ Application initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      // Don't throw - allow app to show error page
      return false;
    }
  };
}

/**
 * Update SEO tags
 */
function updateSeo(config: any): void {
  if (typeof document === 'undefined') return;

  // Title
  document.title = config.seo.title || config.companyName;

  // Meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', config.seo.description || '');

  // Favicon
  if (config.seo.favicon) {
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = config.seo.favicon;
  }

  // Open Graph
  if (config.seo.ogImage) {
    updateMetaTag('og:image', config.seo.ogImage);
    updateMetaTag('og:title', config.seo.title);
    updateMetaTag('og:description', config.seo.description);
  }
}

function updateMetaTag(property: string, content: string): void {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DomainResolverService, ThemeService, SiteConfigService],
      multi: true
    }
  ]
};
```

---

### 6. Guard: SiteLoadedGuard

```typescript
// src/app/core/guards/site-loaded.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { DomainResolverService } from '../services/domain-resolver.service';

/**
 * Guard to ensure site is loaded before accessing routes
 */
export const siteLoadedGuard: CanActivateFn = (route, state) => {
  const domainResolver = inject(DomainResolverService);
  const router = inject(Router);

  // Check if site config is loaded
  if (!domainResolver.isSiteLoaded()) {
    console.warn('Site not loaded, redirecting to error page');
    router.navigate(['/site-not-found']);
    return false;
  }

  return true;
};
```

---

### 7. Component: Home (Dinâmico)

```typescript
// src/app/pages/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteConfigService } from '../../core/services/site-config.service';
import { PageConfig } from '../../core/models/site-config.model';
import { RenderComponentDirective } from '../../shared/website-components/render-component.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RenderComponentDirective],
  template: `
    <div class="home-page" *ngIf="pageConfig">
      <!-- Render sections dynamically -->
      <ng-container *ngFor="let section of pageConfig.sections">
        <ng-container *appRenderComponent="section; editMode: false"></ng-container>
      </ng-container>
    </div>

    <!-- Loading state -->
    <div class="loading" *ngIf="!pageConfig">
      <div class="spinner"></div>
      <p>Carregando...</p>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: 100vh;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class HomeComponent implements OnInit {
  pageConfig: PageConfig | null = null;

  constructor(private siteConfigService: SiteConfigService) {}

  ngOnInit() {
    // Get home page configuration
    this.pageConfig = this.siteConfigService.getPageByType('home');

    if (!this.pageConfig) {
      console.error('Home page configuration not found');
    }
  }
}
```

---

### 8. Layout: MainLayout (Header/Footer Dinâmicos)

```typescript
// src/app/layouts/main-layout/main-layout.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SiteConfigService } from '../../core/services/site-config.service';
import { HeaderComponent } from '../../shared/website-components/header/header.component';
import { FooterComponent } from '../../shared/website-components/footer/footer.component';
import { LayoutConfig } from '../../core/models/site-config.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="main-layout" *ngIf="layout">
      <!-- Dynamic Header -->
      <app-header-component 
        [editMode]="false"
        [config]="layout.header">
      </app-header-component>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Dynamic Footer -->
      <app-footer-component 
        [editMode]="false"
        [config]="layout.footer">
      </app-footer-component>
    </div>

    <!-- Loading -->
    <div class="loading-layout" *ngIf="!layout">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .main-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
    }

    .loading-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid var(--primary, #004AAD);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  layout: LayoutConfig | null = null;

  constructor(private siteConfigService: SiteConfigService) {}

  ngOnInit() {
    // Subscribe to config changes
    this.siteConfigService.config$.subscribe(config => {
      if (config) {
        this.layout = config.layout;
      }
    });
  }
}
```

---

### 9. Rotas

```typescript
// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { siteLoadedGuard } from './core/guards/site-loaded.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [siteLoadedGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'imoveis',
        loadComponent: () => import('./pages/properties/properties-list.component').then(m => m.PropertiesListComponent)
      },
      {
        path: 'imovel/:id',
        loadComponent: () => import('./pages/properties/property-detail.component').then(m => m.PropertyDetailComponent)
      },
      {
        path: 'sobre',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'contato',
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
      }
    ]
  },
  {
    path: 'site-not-found',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

---

### 10. CSS Variables (Global)

```scss
// src/styles.scss

/**
 * CSS Variables - Definidas dinamicamente pelo ThemeService
 * NÃO usar valores hardcoded nos componentes
 */

:root {
  /* Cores (sobrescritas dinamicamente) */
  --primary: #004AAD;
  --secondary: #FFA500;
  --accent: #2c7a7b;
  --background: #ffffff;
  --background-dark: #1a202c;
  --text: #333333;
  --text-light: #718096;
  --border: #e2e8f0;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;

  /* Tipografia */
  --font-family: 'Inter', sans-serif;
  --font-size: 1rem;
  --font-weight: 400;
  --line-height: 1.6;

  /* Espaçamentos */
  --border-radius: 8px;
  --padding-sm: 0.5rem;
  --padding-md: 1rem;
  --padding-lg: 2rem;

  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Reset e estilos globais */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  color: var(--text);
  background-color: var(--background);
}

/* Classes utilitárias usando CSS Variables */
.btn-primary {
  background-color: var(--primary);
  color: white;
  padding: var(--padding-sm) var(--padding-md);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.btn-secondary {
  background-color: var(--secondary);
  color: white;
  padding: var(--padding-sm) var(--padding-md);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--border-radius);
  padding: var(--padding-md);
  box-shadow: var(--shadow-sm);
}

.text-muted {
  color: var(--text-light);
}

/* Proibido usar cores hardcoded */
/* ❌ NÃO FAZER:
  color: #333;
  background: #fff;
*/

/* ✅ FAZER:
  color: var(--text);
  background: var(--background);
*/
```

---

## 🔧 BACKEND API NECESSÁRIA

### Endpoint Principal

```
GET /public/site-by-domain/:domain
```

**Request:**
```http
GET /public/site-by-domain/alancarmo.com.br
```

**Response (200 OK):**
```json
{
  "companyId": "uuid-123",
  "companyName": "Alan Carmo Imobiliária",
  "domain": "alancarmo.com.br",
  "theme": {
    "colors": {
      "primary": "#004AAD",
      "secondary": "#FFA500",
      "accent": "#2c7a7b",
      "background": "#ffffff",
      "backgroundDark": "#1a202c",
      "text": "#333333",
      "textLight": "#718096",
      "border": "#e2e8f0",
      "success": "#10b981",
      "error": "#ef4444",
      "warning": "#f59e0b",
      "info": "#3b82f6"
    },
    "typography": {
      "fontFamily": "Inter, sans-serif",
      "fontSize": "1rem",
      "fontWeight": "400",
      "lineHeight": "1.6"
    },
    "spacing": {
      "borderRadius": "8px",
      "paddingSmall": "0.5rem",
      "paddingMedium": "1rem",
      "paddingLarge": "2rem"
    }
  },
  "layout": {
    "header": {
      "logo": "https://cdn.alancarmo.com.br/logo.png",
      "logoHeight": "50px",
      "layout": "horizontal",
      "sticky": true,
      "navigation": [
        { "label": "Início", "link": "/" },
        { "label": "Imóveis", "link": "/imoveis" },
        { "label": "Sobre", "link": "/sobre" },
        { "label": "Contato", "link": "/contato" }
      ],
      "ctaButton": {
        "text": "Anunciar Imóvel",
        "link": "/contato",
        "style": "primary"
      }
    },
    "footer": {
      "logo": "https://cdn.alancarmo.com.br/logo-white.png",
      "columns": [
        {
          "title": "Empresa",
          "links": [
            { "label": "Sobre Nós", "link": "/sobre" },
            { "label": "Equipe", "link": "/equipe" }
          ]
        },
        {
          "title": "Serviços",
          "links": [
            { "label": "Comprar", "link": "/imoveis?type=venda" },
            { "label": "Alugar", "link": "/imoveis?type=aluguel" }
          ]
        }
      ],
      "copyrightText": "© 2026 Alan Carmo Imobiliária",
      "socialLinks": {
        "facebook": "https://facebook.com/alancarmo",
        "instagram": "https://instagram.com/alancarmo"
      },
      "showNewsletter": true
    }
  },
  "pages": [
    {
      "id": "page-1",
      "slug": "",
      "type": "home",
      "name": "Página Inicial",
      "isActive": true,
      "sections": [
        {
          "id": "section-1",
          "type": "hero",
          "order": 0,
          "config": {
            "title": "Encontre o Imóvel dos Seus Sonhos",
            "subtitle": "Mais de 1000 imóveis disponíveis",
            "backgroundImage": "https://cdn.alancarmo.com.br/hero-bg.jpg",
            "buttonText": "Ver Imóveis",
            "buttonLink": "/imoveis"
          }
        },
        {
          "id": "section-2",
          "type": "property-grid",
          "order": 1,
          "config": {
            "limit": 6,
            "showFeatured": true,
            "columns": 3
          }
        }
      ]
    }
  ],
  "seo": {
    "title": "Alan Carmo Imobiliária - Imóveis em Salvador",
    "description": "Encontre as melhores ofertas de imóveis em Salvador",
    "keywords": ["imóveis", "Salvador", "apartamentos", "casas"],
    "favicon": "https://cdn.alancarmo.com.br/favicon.ico",
    "ogImage": "https://cdn.alancarmo.com.br/og-image.jpg"
  },
  "features": {
    "showSearch": true,
    "showNewsletter": true,
    "showWhatsApp": true,
    "whatsAppNumber": "+5571999999999",
    "enableAnalytics": true,
    "analyticsId": "G-XXXXXXXXXX"
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Site not found",
  "message": "No site configured for domain: invalid-domain.com",
  "statusCode": 404
}
```

---

## 🚀 FLUXO DE FUNCIONAMENTO

### 1. Usuário Acessa o Site

```
User → https://alancarmo.com.br
```

### 2. APP_INITIALIZER Executa

```typescript
1. window.location.hostname = "alancarmo.com.br"
2. DomainResolverService.resolveSite("alancarmo.com.br")
3. HTTP GET → /public/site-by-domain/alancarmo.com.br
4. Backend retorna SiteConfig
5. ThemeService.applyTheme(config.theme)
6. SiteConfigService.setConfig(config)
7. Atualiza SEO (title, meta, favicon)
8. App renderiza ✅
```

### 3. Componentes Renderizam

```typescript
MainLayout carrega:
- Header com config.layout.header
- Footer com config.layout.footer

HomeComponent carrega:
- pageConfig = getPageByType('home')
- Renderiza sections dinamicamente
- Cada section usa componente compartilhado
```

---

## 💾 CACHE E PERFORMANCE

### Estratégias de Cache

1. **Cache em Memória (DomainResolverService)**
   ```typescript
   private configCache: Map<string, SiteConfig> = new Map();
   ```

2. **Cache no LocalStorage (Opcional)**
   ```typescript
   const cached = localStorage.getItem(`site_${domain}`);
   if (cached && isValid(cached)) {
     return JSON.parse(cached);
   }
   ```

3. **Service Worker (Futuro)**
   - Cache offline
   - Background sync

### Performance Checklist

- [ ] Lazy loading de rotas
- [ ] Lazy loading de componentes
- [ ] Imagens otimizadas (WebP)
- [ ] CDN para assets
- [ ] Gzip/Brotli no servidor
- [ ] Cache HTTP headers
- [ ] Preconnect para API
- [ ] Font preload

---

## 🧪 DESENVOLVIMENTO LOCAL

### Testar Múltiplos Domínios

**Opção 1: Domain Override**
```typescript
// No console do navegador
localStorage.setItem('dev_domain_override', 'alancarmo.com.br');
location.reload();
```

**Opção 2: Hosts File**
```
# /etc/hosts (Mac/Linux) ou C:\Windows\System32\drivers\etc\hosts
127.0.0.1 alancarmo.local
127.0.0.1 alancarmojuridico.local
```

**Opção 3: Query Param (Dev Only)**
```
http://localhost:4200?domain=alancarmo.com.br
```

---

## 🐛 TRATAMENTO DE ERROS

### Site Não Encontrado

```typescript
// not-found.component.ts
@Component({
  template: `
    <div class="not-found">
      <h1>Site Não Encontrado</h1>
      <p>Este domínio não está configurado.</p>
      <p>Domain: {{ domain }}</p>
    </div>
  `
})
export class NotFoundComponent {
  domain = window.location.hostname;
}
```

### Erro de Rede

```typescript
// App exibe mensagem amigável
<div *ngIf="error$ | async as error">
  <h2>Erro ao Carregar Site</h2>
  <p>{{ error }}</p>
  <button (click)="retry()">Tentar Novamente</button>
</div>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Core Services
- [ ] Criar models (SiteConfig, ThemeConfig, etc)
- [ ] Criar DomainResolverService
- [ ] Criar SiteConfigService
- [ ] Criar ThemeService
- [ ] Configurar APP_INITIALIZER
- [ ] Criar SiteLoadedGuard

### Fase 2: Páginas Dinâmicas
- [ ] Refatorar HomeComponent
- [ ] Refatorar PropertiesListComponent
- [ ] Refatorar PropertyDetailComponent
- [ ] Refatorar AboutComponent
- [ ] Refatorar ContactComponent
- [ ] Criar NotFoundComponent

### Fase 3: Layout
- [ ] Criar MainLayoutComponent
- [ ] Integrar Header dinâmico
- [ ] Integrar Footer dinâmico
- [ ] Configurar rotas

### Fase 4: CSS Variables
- [ ] Criar _theme-variables.scss
- [ ] Remover cores hardcoded
- [ ] Atualizar componentes compartilhados
- [ ] Testar responsividade

### Fase 5: Backend Integration
- [ ] Criar endpoint /public/site-by-domain/:domain
- [ ] Configurar CORS
- [ ] Testar com domínios reais
- [ ] Configurar cache no backend

### Fase 6: Testes
- [ ] Testar múltiplos domínios
- [ ] Testar tema dinâmico
- [ ] Testar páginas dinâmicas
- [ ] Testar 404
- [ ] Testar performance
- [ ] Testar SEO

---

## 🎯 RESULTADO FINAL

### ✅ Funcionalidades Implementadas

- ✅ Resolução automática por domínio
- ✅ Tema 100% dinâmico (sem hardcode)
- ✅ Header e Footer configuráveis
- ✅ Páginas renderizadas dinamicamente
- ✅ Componentes compartilhados (CRM + Site)
- ✅ Cache inteligente
- ✅ SEO dinâmico por empresa
- ✅ Tratamento de erros
- ✅ Performance otimizada

### ✅ Multi-Tenant Funcionando

```
alancarmo.com.br → Site da Alan Carmo
alancarmojuridico.com.br → Site Alan Carmo Jurídico
outrodominio.com.br → Site Outro Cliente

Mesma aplicação, configurações diferentes! 🎉
```

---

**Documento:** Arquitetura Multi-Tenant Site Público  
**Versão:** 1.0  
**Data:** 02/01/2026  
**Status:** ✅ Pronto para implementação
