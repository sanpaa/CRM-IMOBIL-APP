# 🛠️ PLANO TÉCNICO DE IMPLEMENTAÇÃO - ARQUITETURA UNIFICADA

## 📋 ÍNDICE
1. [Arquivos que Precisam ser Criados](#arquivos-criar)
2. [Arquivos que Precisam ser Refatorados](#arquivos-refatorar)
3. [Código Duplicado Identificado](#codigo-duplicado)
4. [Separação Modo Edição vs Leitura](#modo-edicao-leitura)
5. [Implementação Passo a Passo](#implementacao-passo-a-passo)

---

## 🆕 ARQUIVOS QUE PRECISAM SER CRIADOS <a id="arquivos-criar"></a>

### 1. Sistema de Tema

#### `src/app/services/theme.service.ts`
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { ThemeColors, ThemeTypography, ThemeSpacing } from '../models/theme.model';

export interface FullTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<FullTheme | null>(null);
  public theme$: Observable<FullTheme | null> = this.themeSubject.asObservable();

  constructor(private supabase: SupabaseService) {}

  /**
   * Carrega o tema de uma empresa do banco de dados
   */
  async loadTheme(companyId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.client
        .from('company_themes')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error) {
        console.error('Error loading theme:', error);
        this.loadDefaultTheme();
        return;
      }

      if (data) {
        const theme: FullTheme = {
          colors: {
            primaryColor: data.primary_color,
            secondaryColor: data.secondary_color,
            accentColor: data.accent_color,
            textColor: data.text_color,
            textLightColor: data.text_light_color,
            backgroundColor: data.background_color,
            backgroundDark: data.background_dark,
            borderColor: data.border_color,
            successColor: data.success_color,
            errorColor: data.error_color,
            warningColor: data.warning_color,
            infoColor: data.info_color,
            linkColor: data.link_color
          },
          typography: {
            fontFamily: data.font_family,
            fontSize: data.font_size,
            fontWeight: data.font_weight,
            lineHeight: data.line_height
          },
          spacing: {
            borderRadius: data.border_radius,
            paddingSmall: data.padding_small,
            paddingMedium: data.padding_medium,
            paddingLarge: data.padding_large,
            marginSmall: data.margin_small,
            marginMedium: data.margin_medium,
            marginLarge: data.margin_large
          }
        };

        this.themeSubject.next(theme);
        this.applyCSSVariables(theme);
      } else {
        this.loadDefaultTheme();
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      this.loadDefaultTheme();
    }
  }

  /**
   * Carrega o tema padrão
   */
  private loadDefaultTheme(): void {
    const theme: FullTheme = {
      colors: {
        primaryColor: '#004AAD',
        secondaryColor: '#FFA500',
        accentColor: '#2c7a7b',
        textColor: '#333333',
        textLightColor: '#718096',
        backgroundColor: '#ffffff',
        backgroundDark: '#1a202c',
        borderColor: '#e2e8f0',
        successColor: '#10b981',
        errorColor: '#ef4444',
        warningColor: '#f59e0b',
        infoColor: '#3b82f6',
        linkColor: '#004AAD'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.6'
      },
      spacing: {
        borderRadius: '8px',
        paddingSmall: '0.5rem',
        paddingMedium: '1rem',
        paddingLarge: '2rem',
        marginSmall: '0.5rem',
        marginMedium: '1rem',
        marginLarge: '2rem'
      }
    };

    this.themeSubject.next(theme);
    this.applyCSSVariables(theme);
  }

  /**
   * Aplica as variáveis CSS no documento
   */
  private applyCSSVariables(theme: FullTheme): void {
    const root = document.documentElement;

    // Cores
    root.style.setProperty('--primary-color', theme.colors.primaryColor);
    root.style.setProperty('--secondary-color', theme.colors.secondaryColor);
    root.style.setProperty('--accent-color', theme.colors.accentColor);
    root.style.setProperty('--text-color', theme.colors.textColor);
    root.style.setProperty('--text-light-color', theme.colors.textLightColor);
    root.style.setProperty('--background-color', theme.colors.backgroundColor);
    root.style.setProperty('--background-dark', theme.colors.backgroundDark);
    root.style.setProperty('--border-color', theme.colors.borderColor);
    root.style.setProperty('--success-color', theme.colors.successColor);
    root.style.setProperty('--error-color', theme.colors.errorColor);
    root.style.setProperty('--warning-color', theme.colors.warningColor);
    root.style.setProperty('--info-color', theme.colors.infoColor);
    root.style.setProperty('--link-color', theme.colors.linkColor);

    // Tipografia
    root.style.setProperty('--font-family', theme.typography.fontFamily);
    root.style.setProperty('--font-size', theme.typography.fontSize);
    root.style.setProperty('--font-weight', theme.typography.fontWeight);
    root.style.setProperty('--line-height', theme.typography.lineHeight);

    // Espaçamentos
    root.style.setProperty('--border-radius', theme.spacing.borderRadius);
    root.style.setProperty('--padding-small', theme.spacing.paddingSmall);
    root.style.setProperty('--padding-medium', theme.spacing.paddingMedium);
    root.style.setProperty('--padding-large', theme.spacing.paddingLarge);
    root.style.setProperty('--margin-small', theme.spacing.marginSmall);
    root.style.setProperty('--margin-medium', theme.spacing.marginMedium);
    root.style.setProperty('--margin-large', theme.spacing.marginLarge);

    console.log('✅ CSS Variables aplicadas com sucesso');
  }

  /**
   * Atualiza o tema (para preview em tempo real)
   */
  updateTheme(partialTheme: Partial<FullTheme>): void {
    const currentTheme = this.themeSubject.value;
    if (!currentTheme) return;

    const updatedTheme: FullTheme = {
      colors: { ...currentTheme.colors, ...(partialTheme.colors || {}) },
      typography: { ...currentTheme.typography, ...(partialTheme.typography || {}) },
      spacing: { ...currentTheme.spacing, ...(partialTheme.spacing || {}) }
    };

    this.themeSubject.next(updatedTheme);
    this.applyCSSVariables(updatedTheme);
  }

  /**
   * Salva o tema no banco de dados
   */
  async saveTheme(companyId: string, theme: FullTheme): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('company_themes')
        .upsert({
          company_id: companyId,
          primary_color: theme.colors.primaryColor,
          secondary_color: theme.colors.secondaryColor,
          accent_color: theme.colors.accentColor,
          text_color: theme.colors.textColor,
          text_light_color: theme.colors.textLightColor,
          background_color: theme.colors.backgroundColor,
          background_dark: theme.colors.backgroundDark,
          border_color: theme.colors.borderColor,
          success_color: theme.colors.successColor,
          error_color: theme.colors.errorColor,
          warning_color: theme.colors.warningColor,
          info_color: theme.colors.infoColor,
          link_color: theme.colors.linkColor,
          font_family: theme.typography.fontFamily,
          font_size: theme.typography.fontSize,
          font_weight: theme.typography.fontWeight,
          line_height: theme.typography.lineHeight,
          border_radius: theme.spacing.borderRadius,
          padding_small: theme.spacing.paddingSmall,
          padding_medium: theme.spacing.paddingMedium,
          padding_large: theme.spacing.paddingLarge,
          margin_small: theme.spacing.marginSmall,
          margin_medium: theme.spacing.marginMedium,
          margin_large: theme.spacing.marginLarge,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'company_id'
        });

      if (error) {
        console.error('Error saving theme:', error);
        throw error;
      }

      console.log('✅ Tema salvo com sucesso');
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  }

  /**
   * Obtém o tema atual
   */
  getCurrentTheme(): FullTheme | null {
    return this.themeSubject.value;
  }
}
```

---

#### `src/app/styles/_theme-variables.scss`
```scss
/**
 * CSS Variables para Theme Customization
 * Estes valores são sobrescritos dinamicamente via ThemeService
 */

:root {
  /* =========================
     CORES PRINCIPAIS
     ========================= */
  --primary-color: #004AAD;
  --secondary-color: #FFA500;
  --accent-color: #2c7a7b;

  /* =========================
     CORES DE TEXTO
     ========================= */
  --text-color: #333333;
  --text-light-color: #718096;

  /* =========================
     CORES DE BACKGROUND
     ========================= */
  --background-color: #ffffff;
  --background-dark: #1a202c;
  --border-color: #e2e8f0;

  /* =========================
     CORES DE STATUS
     ========================= */
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --info-color: #3b82f6;
  --link-color: #004AAD;

  /* =========================
     TIPOGRAFIA
     ========================= */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-size: 1rem;
  --font-weight: 400;
  --line-height: 1.6;

  /* Tamanhos de fonte */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  /* Pesos de fonte */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* =========================
     ESPAÇAMENTOS
     ========================= */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */

  /* Espaçamentos configuráveis */
  --padding-small: 0.5rem;
  --padding-medium: 1rem;
  --padding-large: 2rem;
  --margin-small: 0.5rem;
  --margin-medium: 1rem;
  --margin-large: 2rem;

  /* =========================
     BORDER RADIUS
     ========================= */
  --border-radius: 8px;
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* =========================
     SOMBRAS
     ========================= */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* =========================
     BREAKPOINTS (informativo)
     ========================= */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* =========================
     Z-INDEX
     ========================= */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* =========================
   CLASSES UTILITÁRIAS
   ========================= */

/* Cores de texto */
.text-primary { color: var(--primary-color) !important; }
.text-secondary { color: var(--secondary-color) !important; }
.text-accent { color: var(--accent-color) !important; }
.text-muted { color: var(--text-light-color) !important; }

/* Backgrounds */
.bg-primary { background-color: var(--primary-color) !important; }
.bg-secondary { background-color: var(--secondary-color) !important; }
.bg-accent { background-color: var(--accent-color) !important; }
.bg-dark { background-color: var(--background-dark) !important; }

/* Botões com tema */
.btn-themed {
  background-color: var(--primary-color);
  color: white;
  padding: var(--padding-small) var(--padding-medium);
  border-radius: var(--border-radius);
  border: none;
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }
}

.btn-themed-secondary {
  background-color: var(--secondary-color);
  color: white;
  padding: var(--padding-small) var(--padding-medium);
  border-radius: var(--border-radius);
  border: none;
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.btn-themed-outline {
  background-color: transparent;
  color: var(--primary-color);
  padding: var(--padding-small) var(--padding-medium);
  border-radius: var(--border-radius);
  border: 2px solid var(--primary-color);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
}

/* Cards com tema */
.card-themed {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--padding-medium);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

/* Links com tema */
.link-themed {
  color: var(--link-color);
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
}
```

---

#### `src/app/components/settings/theme-editor/theme-editor.component.ts`
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, FullTheme } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-theme-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="theme-editor-container">
      <div class="theme-editor-header">
        <h2>🎨 Editor de Tema</h2>
        <p>Personalize as cores e estilos do seu site</p>
      </div>

      <div class="theme-editor-content" *ngIf="theme">
        <!-- Cores Principais -->
        <section class="theme-section">
          <h3>🎨 Cores Principais</h3>
          <div class="color-grid">
            <div class="color-field">
              <label>Cor Primária</label>
              <div class="color-input-group">
                <input type="color" [(ngModel)]="theme.colors.primaryColor" (change)="onThemeChange()">
                <input type="text" [(ngModel)]="theme.colors.primaryColor" (change)="onThemeChange()">
                <div class="color-preview" [style.background-color]="theme.colors.primaryColor"></div>
              </div>
            </div>

            <div class="color-field">
              <label>Cor Secundária</label>
              <div class="color-input-group">
                <input type="color" [(ngModel)]="theme.colors.secondaryColor" (change)="onThemeChange()">
                <input type="text" [(ngModel)]="theme.colors.secondaryColor" (change)="onThemeChange()">
                <div class="color-preview" [style.background-color]="theme.colors.secondaryColor"></div>
              </div>
            </div>

            <div class="color-field">
              <label>Cor de Destaque</label>
              <div class="color-input-group">
                <input type="color" [(ngModel)]="theme.colors.accentColor" (change)="onThemeChange()">
                <input type="text" [(ngModel)]="theme.colors.accentColor" (change)="onThemeChange()">
                <div class="color-preview" [style.background-color]="theme.colors.accentColor"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Cores de Texto -->
        <section class="theme-section">
          <h3>📝 Cores de Texto</h3>
          <div class="color-grid">
            <div class="color-field">
              <label>Texto Principal</label>
              <div class="color-input-group">
                <input type="color" [(ngModel)]="theme.colors.textColor" (change)="onThemeChange()">
                <input type="text" [(ngModel)]="theme.colors.textColor" (change)="onThemeChange()">
              </div>
            </div>

            <div class="color-field">
              <label>Texto Secundário</label>
              <div class="color-input-group">
                <input type="color" [(ngModel)]="theme.colors.textLightColor" (change)="onThemeChange()">
                <input type="text" [(ngModel)]="theme.colors.textLightColor" (change)="onThemeChange()">
              </div>
            </div>
          </div>
        </section>

        <!-- Tipografia -->
        <section class="theme-section">
          <h3>🔤 Tipografia</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Fonte</label>
              <select [(ngModel)]="theme.typography.fontFamily" (change)="onThemeChange()">
                <option value="Inter, sans-serif">Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Open Sans, sans-serif">Open Sans</option>
                <option value="Montserrat, sans-serif">Montserrat</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Times New Roman, serif">Times New Roman</option>
              </select>
            </div>

            <div class="form-field">
              <label>Tamanho Base</label>
              <input type="text" [(ngModel)]="theme.typography.fontSize" (change)="onThemeChange()" placeholder="1rem">
            </div>
          </div>
        </section>

        <!-- Espaçamentos -->
        <section class="theme-section">
          <h3>📏 Espaçamentos</h3>
          <div class="form-grid">
            <div class="form-field">
              <label>Border Radius</label>
              <input type="text" [(ngModel)]="theme.spacing.borderRadius" (change)="onThemeChange()" placeholder="8px">
            </div>
          </div>
        </section>

        <!-- Preview -->
        <section class="theme-section">
          <h3>👁️ Preview</h3>
          <div class="theme-preview">
            <button class="btn-themed">Botão Primário</button>
            <button class="btn-themed-secondary">Botão Secundário</button>
            <button class="btn-themed-outline">Botão Outline</button>
            <div class="card-themed">
              <h4>Card de Exemplo</h4>
              <p>Este é um card usando o tema personalizado.</p>
              <a href="#" class="link-themed">Link de exemplo</a>
            </div>
          </div>
        </section>

        <!-- Ações -->
        <div class="theme-actions">
          <button class="btn-secondary" (click)="resetTheme()">Restaurar Padrão</button>
          <button class="btn-primary" (click)="saveTheme()" [disabled]="saving">
            {{ saving ? 'Salvando...' : 'Salvar Tema' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theme-editor-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .theme-editor-header {
      margin-bottom: 2rem;
      
      h2 {
        margin: 0 0 0.5rem 0;
        font-size: 2rem;
      }
      
      p {
        margin: 0;
        color: var(--text-light-color);
      }
    }

    .theme-section {
      background: white;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 1.5rem;
      margin-bottom: 1.5rem;

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
      }
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .color-field {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
    }

    .color-input-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      input[type="color"] {
        width: 50px;
        height: 40px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        cursor: pointer;
      }

      input[type="text"] {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-family: monospace;
      }

      .color-preview {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .form-field {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      input, select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
      }
    }

    .theme-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: var(--border-radius);
    }

    .theme-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background-color: white;
      color: var(--text-color);
      border: 1px solid var(--border-color);

      &:hover {
        background-color: #f7fafc;
      }
    }
  `]
})
export class ThemeEditorComponent implements OnInit {
  theme: FullTheme | null = null;
  saving = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      if (theme) {
        // Create a deep copy to avoid mutating the original
        this.theme = JSON.parse(JSON.stringify(theme));
      }
    });
  }

  onThemeChange() {
    if (this.theme) {
      // Update theme in real-time for preview
      this.themeService.updateTheme(this.theme);
    }
  }

  async saveTheme() {
    if (!this.theme) return;

    const user = this.authService.getCurrentUser();
    if (!user?.company_id) {
      alert('Erro: Usuário não autenticado');
      return;
    }

    this.saving = true;
    try {
      await this.themeService.saveTheme(user.company_id, this.theme);
      alert('✅ Tema salvo com sucesso!');
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('❌ Erro ao salvar tema. Tente novamente.');
    } finally {
      this.saving = false;
    }
  }

  async resetTheme() {
    if (!confirm('Tem certeza que deseja restaurar o tema padrão?')) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.company_id) return;

    // Load default theme
    await this.themeService.loadTheme(user.company_id);
  }
}
```

---

## 🔄 ARQUIVOS QUE PRECISAM SER REFATORADOS <a id="arquivos-refatorar"></a>

### Lista Completa de Componentes para Atualizar

1. ✅ `src/app/shared/website-components/header/header.component.ts`
2. ✅ `src/app/shared/website-components/header/header.component.scss`
3. ✅ `src/app/shared/website-components/footer/footer.component.ts`
4. ✅ `src/app/shared/website-components/hero/hero.component.ts`
5. ✅ `src/app/shared/website-components/hero/hero.component.scss`
6. ✅ `src/app/shared/website-components/property-grid/property-grid.component.ts`
7. ✅ `src/app/shared/website-components/property-grid/property-grid.component.scss`
8. ✅ `src/app/shared/website-components/text-block/text-block.component.scss`
9. ✅ `src/app/shared/website-components/newsletter/newsletter.component.scss`
10. ✅ `src/app/shared/website-components/faq/faq.component.scss`
11. ✅ `src/app/shared/website-components/features-grid/features-grid.component.scss`
12. ✅ Todos os outros componentes

### Padrão de Refatoração

**ANTES:**
```typescript
// header.component.ts
@HostBinding('style.background-color')
get backgroundColor() {
  return this.style?.backgroundColor || '#ffffff';
}

@HostBinding('style.color')
get textColor() {
  return this.style?.textColor || '#333333';
}
```

**DEPOIS:**
```typescript
// header.component.ts
// REMOVER @HostBinding de cores
// Manter apenas classes dinâmicas se necessário

@HostBinding('class.edit-mode')
get isEditMode() {
  return this.editMode;
}
```

```scss
// header.component.scss
.header-container {
  // USAR CSS VARIABLES
  background-color: var(--bg-primary, #ffffff);
  color: var(--text-color, #333333);
  font-family: var(--font-family);
  padding: var(--padding-medium);
  border-radius: var(--border-radius);
  
  // Permitir override via style inline se necessário
  background-color: var(--component-bg, var(--bg-primary));
  color: var(--component-text, var(--text-color));
}
```

---

## 🔍 CÓDIGO DUPLICADO IDENTIFICADO <a id="codigo-duplicado"></a>

### 1. Estilos de Edit Mode (5 arquivos)
**LOCALIZAÇÃO:**
- `header.component.scss`
- `hero.component.scss`
- `property-grid.component.scss`
- Outros componentes...

**CÓDIGO DUPLICADO:**
```scss
:host.edit-mode {
  .component-container {
    border: 2px dashed #004AAD;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 74, 173, 0.05);
      pointer-events: none;
    }
  }
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  pointer-events: none;
}

.edit-badge {
  display: inline-block;
  background: #004AAD;
  color: white;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0 0 4px 0;
}

.edit-mode-link {
  pointer-events: none;
  cursor: default;
}
```

**SOLUÇÃO: Criar mixin compartilhado**
```scss
// src/app/styles/_mixins.scss
@mixin edit-mode-styles {
  &.edit-mode {
    .component-container {
      border: 2px dashed var(--primary-color);
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 74, 173, 0.05);
        pointer-events: none;
      }
    }
  }
}

@mixin edit-overlay {
  .edit-overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: var(--z-fixed);
    pointer-events: none;
  }

  .edit-badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 0 0 4px 0;
  }
}

@mixin disable-links-in-edit-mode {
  .edit-mode-link {
    pointer-events: none;
    cursor: default;
    opacity: 0.8;
  }
}
```

**USO NOS COMPONENTES:**
```scss
// header.component.scss
@import '../../styles/mixins';

:host {
  @include edit-mode-styles;
  @include edit-overlay;
  @include disable-links-in-edit-mode;
}
```

---

### 2. @HostBinding de Cores (Todos os componentes)
**ENCONTRADO EM:** Todos os componentes

**SOLUÇÃO:** Remover e usar CSS Variables

---

## 🎛️ SEPARAÇÃO MODO EDIÇÃO VS LEITURA <a id="modo-edicao-leitura"></a>

### Como Funciona Atualmente (✅ CORRETO)

#### 1. Interface Base
```typescript
// component-base.interface.ts
export interface WebsiteComponentBase {
  editMode: boolean;      // 👈 CONTROLA O MODO
  config: any;
  style?: ComponentStyle;
  sectionId?: string;
}
```

#### 2. Implementação nos Componentes
```typescript
// header.component.ts
export class HeaderComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;  // 👈 RECEBE VIA INPUT
  @Input() config: HeaderConfig = { /* ... */ };
  @Input() style?: ComponentStyle;

  @HostBinding('class.edit-mode')     // 👈 APLICA CLASSE CSS
  get isEditMode() {
    return this.editMode;
  }
}
```

#### 3. Uso no Builder (MODO EDIÇÃO)
```html
<!-- website-builder.component.html -->
<ng-container *appRenderComponent="section; editMode: true"></ng-container>
                                                    ☝️ MODO EDIÇÃO
```

#### 4. Uso no Site Público (MODO LEITURA)
```html
<!-- public-website.component.html -->
<ng-container *appRenderComponent="section; editMode: false"></ng-container>
                                                    ☝️ MODO LEITURA
```

#### 5. Diretiva Repassa o Valor
```typescript
// render-component.directive.ts
@Directive({ selector: '[appRenderComponent]' })
export class RenderComponentDirective {
  @Input('appRenderComponent') section!: LayoutSection;
  @Input('appRenderComponentEditMode') editMode: boolean = false;

  private loadComponent(): void {
    const component = this.componentLoader.loadComponent(this.section.type);
    
    // Repassa editMode para o componente 👇
    componentRef.instance.editMode = this.editMode;
    componentRef.instance.config = this.section.config;
    componentRef.instance.style = this.section.style;
  }
}
```

### Diferenças Visuais

| Característica | Modo Edição (editMode: true) | Modo Leitura (editMode: false) |
|----------------|------------------------------|--------------------------------|
| Border visual | ✅ Border azul tracejada | ❌ Sem border |
| Overlay | ✅ Badge com nome do componente | ❌ Sem overlay |
| Links | ❌ Desabilitados (preventDefault) | ✅ Funcionam normalmente |
| Hover effects | ✅ Highlight ao passar mouse | ❌ Efeitos normais |
| Drag handle | ✅ Visível | ❌ Não existe |
| Actions | ✅ Botões editar/excluir | ❌ Não existem |

### CSS Condicional
```html
<!-- header.component.html -->
<div class="header-container">
  <nav class="navbar">
    <!-- Conteúdo do header -->
    <a [href]="item.link" 
       [class.edit-mode-link]="editMode"
       (click)="editMode ? $event.preventDefault() : null">
      {{ item.label }}
    </a>
  </nav>
  
  <!-- Overlay só aparece em modo edição -->
  <div class="edit-overlay" *ngIf="editMode">
    <span class="edit-badge">Header</span>
  </div>
</div>
```

---

## 🚀 IMPLEMENTAÇÃO PASSO A PASSO <a id="implementacao-passo-a-passo"></a>

### SPRINT 1: Sistema de Tema (1 semana)

#### Dia 1-2: Banco de Dados
```sql
-- Executar migration
psql -U postgres -d crm_database -f migration-company-themes.sql

-- Verificar
SELECT * FROM company_themes LIMIT 1;
```

#### Dia 3-4: ThemeService
1. Criar `theme.service.ts`
2. Criar `_theme-variables.scss`
3. Importar no `styles.scss`:
```scss
// styles.scss
@import 'styles/theme-variables';
```

#### Dia 5: Integração
1. Injetar ThemeService no `app.component.ts`
2. Carregar tema no `ngOnInit`
3. Testar mudança de cores em tempo real

### SPRINT 2: Refatorar Componentes (1 semana)

#### Template de Refatoração
Para cada componente:

1. **Abrir arquivo `.ts`**
2. **Remover @HostBinding de cores:**
```typescript
// REMOVER ISTO:
@HostBinding('style.background-color')
get backgroundColor() { return '...'; }
```

3. **Abrir arquivo `.scss`**
4. **Substituir valores hardcoded por CSS variables:**
```scss
// ANTES
background-color: #ffffff;
color: #333333;

// DEPOIS
background-color: var(--background-color);
color: var(--text-color);
```

5. **Adicionar mixins de edit-mode:**
```scss
@import '../../styles/mixins';

:host {
  @include edit-mode-styles;
  @include edit-overlay;
}
```

6. **Testar o componente**

#### Ordem Sugerida:
1. ✅ Header (mais usado)
2. ✅ Footer (mais usado)
3. ✅ Hero
4. ✅ Property Grid
5. ✅ Text Block
6. ✅ Demais componentes

### SPRINT 3: Header e Footer Melhorados (1 semana)

#### Header
1. Expandir `HeaderConfig` interface
2. Atualizar `header.metadata.ts` com novos campos
3. Implementar novos layouts no template
4. Adicionar lógica de sticky header
5. Implementar CTA button
6. Testar responsividade

#### Footer
1. Expandir `FooterConfig` interface
2. Atualizar `footer.metadata.ts`
3. Adicionar logo no footer
4. Implementar social links
5. Layouts variados (columns/centered/minimal)
6. Integração com newsletter

### SPRINT 4: Live Preview (1 semana)

#### Implementação
1. Converter `sections` para `BehaviorSubject`
2. Atualizar `website-builder.component.ts`:
```typescript
private sectionsSubject = new BehaviorSubject<LayoutSection[]>([]);
sections$ = this.sectionsSubject.asObservable();
```

3. Atualizar preview para usar Observable:
```html
<ng-container *ngFor="let section of sections$ | async">
  <ng-container *appRenderComponent="section; editMode: false"></ng-container>
</ng-container>
```

4. Property editor emite mudanças:
```typescript
@Output() configChange = new EventEmitter<{sectionId: string, config: any}>();
```

5. Builder escuta e atualiza:
```typescript
onConfigChange(event: {sectionId: string, config: any}) {
  this.updateSectionConfig(event.sectionId, event.config);
}
```

### SPRINT 5: Theme Editor UI (1 semana)

1. Criar `theme-editor.component.ts`
2. Adicionar rota no CRM
3. Implementar interface de edição
4. Preview em tempo real
5. Salvar no banco
6. Testar persistência

### SPRINT 6: Testes e Refinamentos (1 semana)

1. Testes manuais de todos os componentes
2. Testes de responsividade
3. Verificar consistência CRM vs Site Público
4. Corrigir bugs encontrados
5. Documentação
6. Deploy

---

## ✅ CRITÉRIOS DE SUCESSO

### Funcionalidades Obrigatórias
- [ ] ThemeService carrega tema do banco
- [ ] CSS Variables aplicadas dinamicamente
- [ ] Todos os componentes usam CSS Variables
- [ ] Header customizável (logo, layout, cores)
- [ ] Footer customizável (logo, links, social)
- [ ] Preview atualiza em tempo real
- [ ] Theme Editor funcional
- [ ] Tema persiste no banco
- [ ] Site público usa mesmo tema
- [ ] Zero divergências entre CRM e site público

### Testes de Validação
- [ ] Mudar cor primária → Atualiza em todos os botões
- [ ] Mudar fonte → Atualiza em todo o site
- [ ] Editar header no CRM → Aparece igual no site
- [ ] Modo preview vs modo edição → Visual correto
- [ ] Salvar layout → Persiste no banco
- [ ] Publicar → Site público atualiza
- [ ] Múltiplas empresas → Temas isolados

---

## 📝 NOTAS FINAIS

### Não Esquecer
1. ✅ Fazer backup do banco antes de migrations
2. ✅ Testar em ambiente de dev primeiro
3. ✅ Documentar mudanças no CHANGELOG
4. ✅ Atualizar USER_GUIDE.md
5. ✅ Comunicar breaking changes (se houver)

### Performance
- Debounce de 300ms no property editor
- Lazy loading de componentes pesados
- Virtual scrolling no component library
- Otimizar imagens (WebP, compressão)

### Acessibilidade
- Contraste de cores (WCAG AA)
- Labels em formulários
- Navegação por teclado
- ARIA labels onde necessário

---

**Documento Técnico Completo**  
**Versão:** 1.0  
**Data:** 02/01/2026  
**Status:** Pronto para implementação
