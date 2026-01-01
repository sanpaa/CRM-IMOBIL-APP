import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';
import { RenderComponentDirective } from '../render-component.directive';

@Component({
  selector: 'app-flex-container',
  standalone: true,
  imports: [CommonModule, RenderComponentDirective, DragDropModule],
  template: `
    <section class="flex-container-section" [style]="getStyles()">
      <div class="flex-wrapper" 
           [style]="getFlexStyles()"
           cdkDropList
           [id]="'container-' + sectionId"
           [cdkDropListData]="config.children"
           [cdkDropListConnectedTo]="['main-sections-list']"
           (cdkDropListDropped)="onDrop($event)"
           [class.drop-zone-empty]="editMode && (!config.children || config.children.length === 0)">
        
        <div *ngIf="editMode && (!config.children || config.children.length === 0)" class="empty-state">
          ⬇️ Arraste componentes aqui
        </div>
        
        <div *ngFor="let child of config.children; let i = index" 
             class="flex-item"
             cdkDrag
             [class.edit-mode]="editMode">
          
          <div class="item-controls" *ngIf="editMode">
            <button class="btn-remove" (click)="removeChild(i); $event.stopPropagation()" title="Remover">
              ✕
            </button>
          </div>
          
          <ng-container *appRenderComponent="child.type; config: child.config; style: child.style; editMode: editMode"></ng-container>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .flex-container-section {
      width: 100%;
    }
    
    .flex-wrapper {
      display: flex;
      width: 100%;
      min-height: 100px;
      position: relative;
    }
    
    .flex-wrapper.drop-zone-empty {
      border: 2px dashed #cbd5e0;
      background: #f7fafc;
      border-radius: 8px;
      justify-content: center;
      align-items: center;
    }
    
    .empty-state {
      padding: 2rem;
      color: #a0aec0;
      font-size: 1.1rem;
      text-align: center;
    }
    
    .flex-item {
      flex: 1 1 auto;
      position: relative;
    }
    
    .flex-item.edit-mode {
      padding: 0.5rem;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    
    .flex-item.edit-mode:hover {
      border-color: #4299e1;
      background: rgba(66, 153, 225, 0.05);
    }
    
    .item-controls {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .flex-item.edit-mode:hover .item-controls {
      opacity: 1;
    }
    
    .btn-remove {
      background: #f56565;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
    }
    
    .btn-remove:hover {
      background: #e53e3e;
    }
    
    .cdk-drag-preview {
      opacity: 0.8;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    
    .cdk-drag-placeholder {
      opacity: 0.4;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .flex-wrapper.cdk-drop-list-dragging .flex-item:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class FlexContainerComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: any = {
    direction: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    wrap: 'wrap',
    gap: '2rem',
    children: []
  };
  @Input() style?: ComponentStyle = {};
  @Input() sectionId?: string;

  getFlexStyles(): string {
    const styles: string[] = [];
    if (this.config.direction) styles.push(`flex-direction: ${this.config.direction}`);
    if (this.config.justifyContent) styles.push(`justify-content: ${this.config.justifyContent}`);
    if (this.config.alignItems) styles.push(`align-items: ${this.config.alignItems}`);
    if (this.config.wrap) styles.push(`flex-wrap: ${this.config.wrap}`);
    if (this.config.gap) styles.push(`gap: ${this.config.gap}`);
    if (this.config.padding) styles.push(`padding: ${this.config.padding}`);
    if (this.config.backgroundColor) styles.push(`background-color: ${this.config.backgroundColor}`);
    return styles.join('; ');
  }

  getStyles(): string {
    const styles: string[] = [];
    if (this.style?.backgroundColor) styles.push(`background-color: ${this.style.backgroundColor}`);
    if (this.style?.padding) styles.push(`padding: ${this.style.padding}`);
    if (this.style?.margin) styles.push(`margin: ${this.style.margin}`);
    if (this.style?.maxWidth) styles.push(`max-width: ${this.style.maxWidth}`);
    return styles.join('; ');
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    if (!this.config.children) {
      this.config.children = [];
    }
    
    if (event.previousContainer === event.container) {
      // Reordenando dentro do mesmo container
      moveItemInArray(this.config.children, event.previousIndex, event.currentIndex);
    } else {
      // Movendo de outra lista (main sections list) para este container
      const draggedSection = event.previousContainer.data[event.previousIndex];
      
      // Converter LayoutSection para child format
      const newChild = {
        type: draggedSection.type,
        config: draggedSection.config,
        style: draggedSection.style
      };
      
      // Adicionar ao container
      this.config.children.splice(event.currentIndex, 0, newChild);
      
      // Remover da lista original
      event.previousContainer.data.splice(event.previousIndex, 1);
    }
  }

  removeChild(index: number): void {
    if (this.config.children && this.config.children[index]) {
      this.config.children.splice(index, 1);
    }
  }
}
