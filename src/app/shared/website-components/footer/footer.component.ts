import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterConfig } from '../../../models/company.model';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-footer-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="footer-container" 
         [style.background-color]="config.backgroundColor || 'var(--background)'"
         [style.color]="config.textColor || 'var(--secondary)'">
      <div class="footer-content">
        
        <div class="footer-grid">
          <!-- Coluna 1: Informações da Empresa -->
          <div class="footer-column company-info">
            <div class="footer-brand" *ngIf="config.showLogo && config.logoUrl && !editMode">
              <img [src]="config.logoUrl" alt="Logo" class="logo-image">
            </div>
            <h3 class="company-name">{{ config.companyName }}</h3>
            <p class="company-description" *ngIf="config.description">{{ config.description }}</p>
            
            <!-- Informações de Contato -->
            <div class="contact-info">
              <p *ngIf="config.address" class="contact-item">
                <span class="icon">📍</span> {{ config.address }}
              </p>
              <p *ngIf="config.phone" class="contact-item">
                <span class="icon">📞</span> {{ config.phone }}
              </p>
              <p *ngIf="config.email" class="contact-item">
                <span class="icon">✉️</span> {{ config.email }}
              </p>
            </div>
            
            <!-- Redes Sociais -->
            <div class="social-links" *ngIf="config.instagram || config.facebook || config.whatsapp">
              <a *ngIf="config.instagram" [href]="config.instagram" target="_blank" class="social-link" aria-label="Instagram">
                📷
              </a>
              <a *ngIf="config.facebook" [href]="config.facebook" target="_blank" class="social-link" aria-label="Facebook">
                📘
              </a>
              <a *ngIf="config.whatsapp" [href]="'https://wa.me/' + config.whatsapp" target="_blank" class="social-link" aria-label="WhatsApp">
                💬
              </a>
            </div>
          </div>

          <!-- Coluna 2: Navegação -->
          <div class="footer-column nav-links">
            <h4>Navegação</h4>
            <ul>
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/buscar">Buscar</a></li>
              <li><a routerLink="/contato">Contato</a></li>
            </ul>
          </div>
          
          <!-- Coluna 3: Links Rápidos -->
          <div class="footer-column" *ngIf="config.quickLinks && config.quickLinks.length > 0">
            <h4>Links Rápidos</h4>
            <ul>
              <li *ngFor="let link of config.quickLinks">
                <ng-container *ngIf="isExternalLink(link.route); else internalQuickLink">
                  <a [href]="getCleanUrl(link.route)" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     [class.edit-mode-link]="editMode" 
                     (click)="editMode ? $event.preventDefault() : null">
                    {{ link.label }}
                  </a>
                </ng-container>
                <ng-template #internalQuickLink>
                  <a [routerLink]="link.route" 
                     [class.edit-mode-link]="editMode" 
                     (click)="editMode ? $event.preventDefault() : null">
                    {{ link.label }}
                  </a>
                </ng-template>
              </li>
            </ul>
          </div>
          
          <!-- Coluna 4: Serviços -->
          <div class="footer-column" *ngIf="config.services && config.services.length > 0">
            <h4>Serviços</h4>
            <ul>
              <li *ngFor="let service of config.services">
                <ng-container *ngIf="isExternalLink(service.route); else internalService">
                  <a [href]="getCleanUrl(service.route)" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     [class.edit-mode-link]="editMode" 
                     (click)="editMode ? $event.preventDefault() : null">
                    {{ service.label }}
                  </a>
                </ng-container>
                <ng-template #internalService>
                  <a [routerLink]="service.route" 
                     [class.edit-mode-link]="editMode" 
                     (click)="editMode ? $event.preventDefault() : null">
                    {{ service.label }}
                  </a>
                </ng-template>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer-trust">
          <span class="trust-badge">Imobiliária Premium</span>
          <span class="trust-badge">Atendimento Digital</span>
          <span class="trust-badge">Curadoria de Imóveis</span>
        </div>
        
        <!-- Copyright -->
        <div class="footer-bottom" *ngIf="config.showCopyright">
          <p>© {{ currentYear }} {{ config.companyName }}. Todos os direitos reservados.</p>
          <span class="template-badge">Template ativo</span>
        </div>
      </div>
      
      <!-- Edit Mode Overlay -->
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Footer</span>
      </div>
    </div>
  `,
  styles: [`
    :host { 
      display: block; 
      position: relative; 
    }
    
    .footer-container { 
      position: relative; 
      padding: 3rem 2rem 1.5rem; 
      border-top: 1px solid color-mix(in srgb, var(--secondary) 12%, transparent);
      backdrop-filter: blur(12px);
    }
    
    .footer-content { 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 2.5rem;
      margin-bottom: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
    
    .footer-column {
      h4 { 
        margin: 0 0 1rem 0; 
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      
      ul { 
        list-style: none; 
        padding: 0; 
        margin: 0; 
      }
      
      li { 
        margin: 0.5rem 0; 
      }
      
      a { 
        color: inherit; 
        text-decoration: none; 
        opacity: 0.8;
        transition: opacity 0.2s;
        
        &:hover { 
          opacity: 1; 
          color: var(--primary);
        }
        
        &.edit-mode-link { 
          pointer-events: none; 
          cursor: default; 
        }
      }
    }
    
    .company-info {
      .footer-brand {
        margin-bottom: 1rem;
        
        .logo-image {
          height: 50px;
          width: auto;
          object-fit: contain;
        }
      }
      
      .company-name {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: bold;
      }
      
      .company-description {
        margin: 0 0 1.5rem 0;
        opacity: 0.8;
        line-height: 1.5;
      }
    }
    
    .contact-info {
      margin-bottom: 1.5rem;
      
      .contact-item {
        margin: 0.5rem 0;
        display: flex;
        align-items: center;
        opacity: 0.9;
        
        .icon {
          margin-right: 0.5rem;
          font-size: 1.1rem;
        }
      }
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
      
      .social-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: color-mix(in srgb, var(--accent) 15%, transparent);
        font-size: 1.2rem;
        transition: all 0.2s;
        text-decoration: none;
        
        &:hover {
          background: color-mix(in srgb, var(--accent) 25%, transparent);
          transform: translateY(-2px);
        }
      }
    }
    
    .footer-trust {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 0 0 2rem 0;
    }

    .trust-badge {
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent) 18%, transparent);
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .footer-bottom { 
      border-top: 1px solid color-mix(in srgb, var(--secondary) 12%, transparent); 
      padding-top: 1rem; 
      text-align: center;
      margin-top: 1.5rem;
      
      p {
        margin: 0;
        opacity: 0.7;
        font-size: 0.9rem;
      }
    }

    .template-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.75rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--secondary) 18%, transparent);
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    
    /* Edit Mode */
    :host.edit-mode .footer-container { 
      border: 2px dashed var(--primary); 
    }
    
    :host.edit-mode .footer-container::after { 
      content: ''; 
      position: absolute; 
      inset: 0; 
      background: color-mix(in srgb, var(--primary) 8%, transparent); 
      pointer-events: none; 
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
      background: var(--primary); 
      color: var(--background); 
      padding: 0.25rem 0.75rem; 
      font-size: 0.75rem; 
      font-weight: 600; 
      border-radius: 0 0 4px 0; 
    }
  `]
})
export class FooterComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: FooterConfig = {
    companyName: 'Imobiliária',
    showLogo: false,
    showCopyright: true,
    quickLinks: [],
    services: []
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  currentYear = new Date().getFullYear();

  @HostBinding('class.edit-mode') 
  get isEditMode() { 
    return this.editMode; 
  }

  /**
   * Verifica se o link é externo (começa com http:// ou https://)
   */
  isExternalLink(url: string): boolean {
    if (!url) return false;
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://');
  }

  /**
   * Retorna a URL limpa (remove barra inicial de URLs externas)
   */
  getCleanUrl(url: string): string {
    if (!url) return url;
    if (this.isExternalLink(url)) {
      return url.startsWith('/') ? url.substring(1) : url;
    }
    return url;
  }
}
