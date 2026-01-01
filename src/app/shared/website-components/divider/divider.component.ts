import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-divider-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="divider-container">
      <hr [style.border-color]="config.color" [style.border-width]="config.thickness">
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Divider</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .divider-container { position: relative; }
    hr { border: none; border-top-style: solid; }
    :host.edit-mode .divider-container { border: 2px dashed #004AAD; padding: 0.5rem; }
    .edit-overlay { position: absolute; top: 0; left: 0; z-index: 10; pointer-events: none; }
    .edit-badge { display: inline-block; background: #004AAD; color: white; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 0 0 4px 0; }
  `]
})
export class DividerComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: any = { style: 'solid', thickness: '1px', color: '#e0e0e0' };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  @HostBinding('class.edit-mode') get isEditMode() { return this.editMode; }
  @HostBinding('style.margin') get margin() { return this.style?.margin || '2rem 0'; }
}
