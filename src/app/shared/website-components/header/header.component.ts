import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  encapsulation: ViewEncapsulation.None,
  template: `
    <header
      class="site-header"
      [style.--header-bg]="config?.backgroundColor || 'rgba(15, 23, 42, 0.85)'"
      [style.--header-text]="config?.textColor || '#ffffff'">
      <div class="header-container">
        <div class="brand">
          <img
            *ngIf="config?.showLogo && config?.logoUrl && !editMode"
            [src]="config.logoUrl"
            alt="Logo" />
          <span class="brand-text">{{ config?.companyName || 'Sua Imobiliária' }}</span>
        </div>

        <nav class="nav" *ngIf="config?.showMenu" [class.open]="isMenuOpen">
          <ng-container *ngFor="let item of getNavigation()">
            <ng-container *ngIf="isExternalLink(item.link); else internalNav">
              <a [href]="getCleanUrl(item.link)"
                 target="_blank"
                 rel="noopener noreferrer"
                 [class.edit-mode-link]="editMode"
                 (click)="editMode ? $event.preventDefault() : null">
                {{ item.label }}
              </a>
            </ng-container>
            <ng-template #internalNav>
              <a [routerLink]="item.link"
                 [class.edit-mode-link]="editMode"
                 (click)="onNavClick($event)">
                {{ item.label }}
              </a>
            </ng-template>
          </ng-container>
          <ng-container *ngIf="shouldShowCta()">
            <ng-container *ngIf="isExternalLink(getCtaLink()); else internalCta">
              <a
                class="cta"
                [href]="getCleanUrl(getCtaLink())"
                target="_blank"
                rel="noopener noreferrer"
                [class.edit-mode-link]="editMode"
                (click)="editMode ? $event.preventDefault() : null">
                {{ getCtaLabel() }}
              </a>
            </ng-container>
            <ng-template #internalCta>
              <a
                class="cta"
                [routerLink]="getCtaLink()"
                [class.edit-mode-link]="editMode"
                (click)="onNavClick($event)">
                {{ getCtaLabel() }}
              </a>
            </ng-template>
          </ng-container>
        </nav>

        <button
          class="menu-toggle"
          *ngIf="config?.showMenu"
          aria-label="Abrir menu"
          [attr.aria-expanded]="isMenuOpen"
          (click)="toggleMenu()"
          [class.edit-mode-button]="editMode">
          ☰
        </button>
      </div>

      <!-- Edit Mode Overlay -->
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Header</span>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; position: relative; }

    :host {
      --primary: #1f6aff;
      --dark: #0f172a;
      --light: #ffffff;
      --border: rgba(255, 255, 255, 0.1);
    }

    .site-header {
      position: sticky;
      top: 0;
      z-index: 999;
      background: var(--header-bg);
      color: var(--header-text);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }

    .header-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 12px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .brand img {
      height: 42px;
      display: block;
    }

    .brand-text {
      font-size: 18px;
      font-weight: 600;
      color: var(--light);
      white-space: nowrap;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 28px;
    }

    .nav a {
      text-decoration: none;
      color: #e5e7eb;
      font-weight: 500;
      position: relative;
    }

    .nav a::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: 0;
      width: 0%;
      height: 2px;
      background: var(--primary);
      transition: 0.3s ease;
    }

    .nav a:hover::after {
      width: 100%;
    }

    .cta {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: 0.2s;
    }

    .cta:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }

    .menu-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 26px;
      color: #ffffff;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .nav {
        display: none;
        position: absolute;
        top: 100%;
        right: 16px;
        background: var(--header-bg);
        border: 1px solid var(--border);
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        border-radius: 12px;
        padding: 0.75rem 1rem;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 200px;
        z-index: 1200;
      }

      .nav.open {
        display: flex;
      }

      .nav a::after {
        display: none;
      }

      .menu-toggle {
        display: block;
      }
    }

    /* Edit-mode visuals */
    .edit-overlay { position: absolute; right: 1rem; top: 1rem; }
    .edit-badge { background: #ffeb3b; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
    .edit-mode-link { outline: 1px dashed rgba(0,0,0,0.15); }
    .edit-mode-button { opacity: 0.5; }
  `]
})
export class HeaderComponent {
  @Input() config: any = {};
  @Input() editMode: boolean = false;

  isMenuOpen = false;

  toggleMenu() {
    if (this.editMode) return; // não togglar em modo de edição
    this.isMenuOpen = !this.isMenuOpen;
    // para animação do botão hamburger (classe aplicada via JS)
    this.updateHamburgerClass();
  }

  onNavClick(event: Event) {
    if (this.editMode) {
      event.preventDefault();
      return;
    }
    // fecha o menu ao navegar em telas pequenas
    if (window.innerWidth <= 768) {
      this.isMenuOpen = false;
      this.updateHamburgerClass();
    }
  }
  constructor() {
    document.body.classList.add('header-css-loaded');
  }


  @HostListener('window:resize')
  onResize() {
    // garante que no resize para desktop o menu não fique aberto no mobile
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.isMenuOpen = false;
      this.updateHamburgerClass();
    }
  }

  // aplica/remover classe .open ao botão hamburger (apenas para animação)
  private updateHamburgerClass() {
    const btn = document.querySelector('.menu-toggle');
    if (!btn) return;
    if (this.isMenuOpen) btn.classList.add('open');
    else btn.classList.remove('open');
  }

  getWhatsappLink(): string {
    const rawPhone = (this.config?.phone || '').toString();
    const normalized = rawPhone.replace(/\D/g, '');
    return normalized ? `https://wa.me/${normalized}` : '#';
  }

  getCtaLabel(): string {
    return (this.config?.ctaLabel || 'Anunciar Imovel').toString();
  }

  getCtaLink(): string {
    const raw = (this.config?.ctaLink || '').toString().trim();
    if (raw) return raw;
    const whatsapp = this.getWhatsappLink();
    return whatsapp !== '#' ? whatsapp : '';
  }

  shouldShowCta(): boolean {
    if (this.config?.showCta === false) return false;
    return !!this.getCtaLink();
  }

  getNavigation(): Array<{ label: string; link: string }> {
    const navigation = this.config?.navigation;
    if (Array.isArray(navigation) && navigation.length) {
      return navigation;
    }
    return [
      { label: 'Início', link: '/' },
      { label: 'Imóveis', link: '/imoveis' },
      { label: 'Sobre', link: '/sobre' },
      { label: 'Contato', link: '/contato' }
    ];
  }

  isExternalLink(url: string): boolean {
    if (!url) return false;
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return cleanUrl.startsWith('http://')
      || cleanUrl.startsWith('https://')
      || cleanUrl.startsWith('#')
      || cleanUrl.startsWith('mailto:')
      || cleanUrl.startsWith('tel:');
  }

  getCleanUrl(url: string): string {
    if (!url) return url;
    if (this.isExternalLink(url)) {
      return url.startsWith('/') && !url.startsWith('//') ? url.substring(1) : url;
    }
    return url;
  }
}
