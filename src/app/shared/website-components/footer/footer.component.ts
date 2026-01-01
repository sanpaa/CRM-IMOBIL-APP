import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsiteComponentBase, ComponentStyle } from '../component-base.interface';

@Component({
  selector: 'app-footer-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-columns">
          <div *ngFor="let column of config.columns" class="footer-column">
            <h4>{{ column.title }}</h4>
            <ul>
              <li *ngFor="let link of column.links">
                <a [href]="link.link" [class.edit-mode-link]="editMode" (click)="editMode ? $event.preventDefault() : null">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>{{ config.copyrightText }}</p>
        </div>
      </div>
      <div class="edit-overlay" *ngIf="editMode">
        <span class="edit-badge">Footer</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }
    .footer-container { position: relative; padding: 2rem; }
    .footer-content { max-width: 1200px; margin: 0 auto; }
    .footer-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
    .footer-column h4 { margin: 0 0 1rem 0; }
    .footer-column ul { list-style: none; padding: 0; margin: 0; }
    .footer-column li { margin: 0.5rem 0; }
    .footer-column a { color: inherit; text-decoration: none; opacity: 0.8; }
    .footer-column a:hover { opacity: 1; }
    .footer-column a.edit-mode-link { pointer-events: none; cursor: default; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1rem; text-align: center; }
    :host.edit-mode .footer-container { border: 2px dashed #004AAD; }
    :host.edit-mode .footer-container::after { content: ''; position: absolute; inset: 0; background: rgba(0,74,173,0.05); pointer-events: none; }
    .edit-overlay { position: absolute; top: 0; left: 0; z-index: 10; pointer-events: none; }
    .edit-badge { display: inline-block; background: #004AAD; color: white; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 0 0 4px 0; }
  `]
})
export class FooterComponent implements WebsiteComponentBase {
  @Input() editMode: boolean = false;
  @Input() config: any = {
    columns: [{ title: 'Empresa', links: [{ label: 'Sobre', link: '#' }] }],
    copyrightText: '© 2024 Todos os direitos reservados'
  };
  @Input() style?: ComponentStyle;
  @Input() sectionId?: string;

  @HostBinding('class.edit-mode') get isEditMode() { return this.editMode; }
  @HostBinding('style.background-color') get backgroundColor() { return this.style?.backgroundColor || '#1a1a1a'; }
  @HostBinding('style.color') get textColor() { return this.style?.textColor || '#ffffff'; }
}
