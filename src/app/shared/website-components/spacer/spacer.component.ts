import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-spacer-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spacer-container">
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Spacer ({{ config.height }})</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .spacer-container { position: relative; }
    :host.edit-mode .spacer-container { border: 2px dashed #004AAD; background: rgba(0,74,173,0.05); min-height: 20px; }
    .edit-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; pointer-events: none; }
    .edit-badge { display: inline-block; background: #004AAD; color: white; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 4px; }
  `]
})
export class SpacerComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: any = { height: '2rem' };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  @HostBinding('class.edit-mode') get isEditMode() { return this.editMode; }
  @HostBinding('style.height') get height() { return this.config?.height || '2rem'; }
}
