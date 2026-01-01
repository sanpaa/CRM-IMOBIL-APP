import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

export interface TextBlockConfig {
  title?: string;
  content: string;
  alignment: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-text-block-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-block-container" [class]="'align-' + config.alignment">
      <h2 *ngIf="config.title" class="text-title">{{ config.title }}</h2>
      <div class="text-content" [innerHTML]="config.content"></div>
      
      <!-- Edit Mode Overlay -->
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Text Block</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }
    
    .text-block-container {
      position: relative;
      
      &.align-left { text-align: left; }
      &.align-center { text-align: center; }
      &.align-right { text-align: right; }
    }
    
    .text-title {
      margin: 0 0 1rem 0;
      font-size: 2rem;
    }
    
    .text-content {
      line-height: 1.6;
    }
    
    :host.edit-mode .text-block-container {
      border: 2px dashed #004AAD;
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 74, 173, 0.05);
        pointer-events: none;
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
  `]
})
export class TextBlockComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: TextBlockConfig = {
    title: 'Título',
    content: 'Seu conteúdo aqui...',
    alignment: 'left'
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  @HostBinding('class.edit-mode') get isEditMode() { return this.editMode; }
  @HostBinding('style.background-color') get backgroundColor() { 
    return this.style?.backgroundColor || 'transparent'; 
  }
  @HostBinding('style.color') get textColor() { 
    return this.style?.textColor || 'inherit'; 
  }
  @HostBinding('style.padding') get padding() { 
    return this.style?.padding || '2rem'; 
  }
}
