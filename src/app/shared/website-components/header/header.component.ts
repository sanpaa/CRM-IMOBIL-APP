import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header-container"
            [style.background-color]="config?.backgroundColor || '#ffffff'"
            [style.color]="config?.textColor || '#333333'">
      <div class="header-content">
        <div class="logo" *ngIf="config?.showLogo && config?.logoUrl">
          <img [src]="config.logoUrl" alt="Logo" class="logo-image">
        </div>

        <div class="brand" *ngIf="!config?.showLogo || !config?.logoUrl">
          <h1>{{ config?.companyName }}</h1>
        </div>

      <div class="nav-right">
        <!-- Menu de navegação -->
        <nav class="nav-menu" *ngIf="config?.showMenu" role="navigation" [class.open]="isMenuOpen">
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
        </nav>

        <a *ngIf="config?.phone"
           class="whatsapp-cta"
           [href]="getWhatsappLink()"
           target="_blank"
           rel="noopener noreferrer"
           [class.edit-mode-link]="editMode"
           (click)="editMode ? $event.preventDefault() : null">
          WhatsApp
        </a>

        <!-- Hamburger button (visible em telas pequenas) -->
        <button
          class="hamburger"
          *ngIf="config?.showMenu"
          aria-label="Alternar navegação"
          [attr.aria-expanded]="isMenuOpen"
          (click)="toggleMenu()"
          [class.edit-mode-button]="editMode">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      </div>
    </div>

      <!-- Edit Mode Overlay -->
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Header</span>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; position: relative; }

    .header-container { position: relative; padding: 1rem 2rem; }
    .header-content { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; position: relative; }

    .logo-image { height: 40px; display: block; }
    .brand h1 { margin: 0; font-size: 1.25rem; }

    .nav-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Menu desktop */
    .nav-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: transform 250ms ease, opacity 250ms ease;
    }

    .nav-menu a {
      text-decoration: none;
      color: inherit;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
    }

    .nav-menu a:hover { background: rgba(0,0,0,0.04); }

    .whatsapp-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      background: #0ea5e9;
      color: #0f172a;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 10px 24px rgba(14, 165, 233, 0.3);
      transition: transform 200ms ease, box-shadow 200ms ease;
    }

    .whatsapp-cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 28px rgba(14, 165, 233, 0.35);
    }

    /* Hamburger - hidden on desktop */
    .hamburger {
      display: none;
      margin-left: auto;
      width: 40px;
      height: 30px;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      align-items: center;
      justify-content: center;
    }
    .hamburger .bar {
      display: block;
      width: 22px;
      height: 2px;
      background: currentColor;
      margin: 4px 0;
      transition: transform 200ms ease, opacity 200ms ease;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .nav-right {
        gap: 0.5rem;
      }

      .nav-menu {
        position: absolute;
        top: 100%;
        right: 1rem;
        background: var(--header-bg, #fff);
        box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        border-radius: 8px;
        padding: 0.5rem;
        flex-direction: column;
        gap: 0;
        min-width: 180px;
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
        pointer-events: none;
        z-index: 1200;
      }

      .nav-menu.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .nav-menu a {
        display: block;
        padding: 0.75rem 1rem;
      }

      .hamburger { display: flex; }

      .whatsapp-cta {
        padding: 0.45rem 0.85rem;
        font-size: 0.85rem;
      }

      /* optional: animate hamburger to X when open */
      .hamburger.open .bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
      .hamburger.open .bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
      .hamburger.open .bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
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
    const btn = document.querySelector('.hamburger');
    if (!btn) return;
    if (this.isMenuOpen) btn.classList.add('open');
    else btn.classList.remove('open');
  }

  getWhatsappLink(): string {
    const rawPhone = (this.config?.phone || '').toString();
    const normalized = rawPhone.replace(/\D/g, '');
    return normalized ? `https://wa.me/${normalized}` : '#';
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
    return cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
  }

  getCleanUrl(url: string): string {
    if (!url) return url;
    if (this.isExternalLink(url)) {
      return url.startsWith('/') ? url.substring(1) : url;
    }
    return url;
  }
}
