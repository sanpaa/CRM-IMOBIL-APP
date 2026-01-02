import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderConfig } from '../../../models/company.model';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-header-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header-container" 
            [style.background-color]="config.backgroundColor || '#ffffff'"
            [style.color]="config.textColor || '#333333'">
      <div class="header-content">
        <div class="logo" *ngIf="config.showLogo && config.logoUrl">
          <img [src]="config.logoUrl" alt="Logo" class="logo-image">
        </div>
        <nav class="nav-menu" *ngIf="config.showMenu">
          <a routerLink="/" 
             [class.edit-mode-link]="editMode"
             (click)="editMode ? $event.preventDefault() : null">Início</a>
          <a routerLink="/imoveis" 
             [class.edit-mode-link]="editMode"
             (click)="editMode ? $event.preventDefault() : null">Imóveis</a>
          <a routerLink="/sobre" 
             [class.edit-mode-link]="editMode"
             (click)="editMode ? $event.preventDefault() : null">Sobre</a>
          <a routerLink="/contato" 
             [class.edit-mode-link]="editMode"
             (click)="editMode ? $event.preventDefault() : null">Contato</a>
        </nav>
      </div>
      
      <!-- Edit Mode Overlay -->
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Header</span>
      </div>
    </header>
  `,
  styles: [`
    :host { 
      display: block; 
      position: relative; 
    }
    
    .header-container { 
      position: relative; 
      padding: 1rem 2rem; 
    }
    
    .header-content { 
      max-width: 1200px; 
      margin: 0 auto; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    
    .logo {
      .logo-image {
        height: 50px;
        width: auto;
        object-fit: contain;
      }
    }
    
    .nav-menu { 
      display: flex; 
      gap: 2rem; 
    }
    
    .nav-menu a { 
      color: inherit; 
      text-decoration: none; 
      font-weight: 500;
      transition: opacity 0.2s;
    }
    
    .nav-menu a:hover { 
      opacity: 0.7; 
    }
    
    .nav-menu a.edit-mode-link { 
      pointer-events: none; 
      cursor: default; 
    }
    
    /* Edit Mode */
    :host.edit-mode .header-container { 
      border: 2px dashed #004AAD; 
    }
    
    :host.edit-mode .header-container::after { 
      content: ''; 
      position: absolute; 
      inset: 0; 
      background: rgba(0,74,173,0.05); 
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
      background: #004AAD; 
      color: white; 
      padding: 0.25rem 0.75rem; 
      font-size: 0.75rem; 
      font-weight: 600; 
      border-radius: 0 0 4px 0; 
    }
  `]
})
export class HeaderComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: HeaderConfig = {
    showLogo: false,
    showMenu: true
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  @HostBinding('class.edit-mode') get isEditMode() {
    return this.editMode;
  }
}
