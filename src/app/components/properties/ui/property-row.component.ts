import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Property } from '../../../models/property.model';
import { StatusBadgeComponent } from './status-badge.component';

@Component({
  selector: 'app-property-row',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <div class="property-row card-row-hover">
      <div class="property-main">
        <ng-container *ngIf="imageUrl; else placeholder">
          <img [src]="imageUrl" [alt]="property.title" class="property-thumb"/>
        </ng-container>
        <ng-template #placeholder>
          <div class="property-thumb placeholder">
            <span class="material-symbols-outlined">image</span>
          </div>
        </ng-template>
        <div class="property-info">
          <h3>{{ property.title || '-' }}</h3>
          <p>
            <span class="material-symbols-outlined">location_on</span>
            {{ addressLine }}
          </p>
          <div class="property-tags">
            <span class="tag">{{ property.type || 'Imóvel' }}</span>
            <span class="tag" *ngIf="secondaryTag">{{ secondaryTag }}</span>
          </div>
        </div>
      </div>

      <div class="property-value">
        <span class="price">{{ property.price | currency:'BRL' }}</span>
        <span class="value-meta" *ngIf="valueMeta">{{ valueMeta }}</span>
      </div>

      <div class="property-status">
        <app-status-badge [sold]="property.sold" [status]="property.status"></app-status-badge>
      </div>

      <div class="property-actions">
        <details class="action-menu">
          <summary><span class="material-symbols-outlined">more_vert</span></summary>
          <div class="menu-panel">
            <button type="button" (click)="edit.emit(property)">Editar</button>
            <button type="button" title="Em breve">Duplicar</button>
            <button type="button" title="Em breve">Arquivar</button>
            <button type="button" class="danger" *ngIf="canDelete" (click)="remove.emit(property.id)">Excluir</button>
          </div>
        </details>
      </div>
    </div>
  `,
  styles: [`
    .property-row {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.6fr) minmax(0, 0.4fr) minmax(0, 0.4fr);
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 18px;
      background: #0f172a;
      border: 1px solid #1e293b;
      transition: all 0.3s ease;
    }

    .card-row-hover:hover {
      transform: translateY(-2px);
      background-color: rgba(59, 130, 246, 0.03);
      box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.3);
    }

    .property-main {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }

    .property-thumb {
      width: 80px;
      height: 80px;
      border-radius: 14px;
      object-fit: cover;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
      flex-shrink: 0;
    }

    .property-thumb.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #111827;
      color: #64748b;
    }

    .property-info h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .property-info p {
      margin: 0.35rem 0 0;
      color: #94a3b8;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .property-info .material-symbols-outlined {
      font-size: 16px;
    }

    .property-tags {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .tag {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      background: #0b1220;
      color: #94a3b8;
    }

    .property-value {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .price {
      font-size: 1rem;
      font-weight: 700;
      color: #e2e8f0;
    }

    .value-meta {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #64748b;
    }

    .property-status {
      display: flex;
      justify-content: center;
    }

    .property-actions {
      display: flex;
      justify-content: flex-end;
    }

    .action-menu {
      position: relative;
    }

    .action-menu summary {
      list-style: none;
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #0b1220;
      color: #94a3b8;
      border: 1px solid #1e293b;
    }

    .action-menu summary::-webkit-details-marker {
      display: none;
    }

    .menu-panel {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      background: #0b1220;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 0.5rem;
      min-width: 180px;
      z-index: 5;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
    }

    .menu-panel button {
      border: none;
      background: transparent;
      color: #e2e8f0;
      text-align: left;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .menu-panel button:hover {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .menu-panel button.danger {
      color: #f87171;
    }

    .menu-panel button.danger:hover {
      background: rgba(248, 113, 113, 0.15);
      color: #fca5a5;
    }

    :host-context(body[data-theme='light']) .property-row {
      background: #ffffff;
      border-color: rgba(148, 163, 184, 0.35);
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
    }

    :host-context(body[data-theme='light']) .card-row-hover:hover {
      background-color: rgba(59, 130, 246, 0.05);
      box-shadow: 0 12px 22px rgba(59, 130, 246, 0.12);
    }

    :host-context(body[data-theme='light']) .property-thumb.placeholder {
      background: #f1f5f9;
      color: #94a3b8;
    }

    :host-context(body[data-theme='light']) .property-info h3 {
      color: #1e293b;
    }

    :host-context(body[data-theme='light']) .property-info p {
      color: #64748b;
    }

    :host-context(body[data-theme='light']) .tag {
      background: #f1f5f9;
      color: #64748b;
    }

    :host-context(body[data-theme='light']) .price {
      color: #1e293b;
    }

    :host-context(body[data-theme='light']) .value-meta {
      color: #94a3b8;
    }

    :host-context(body[data-theme='light']) .action-menu summary {
      background: #f8fafc;
      color: #64748b;
      border-color: rgba(148, 163, 184, 0.4);
    }

    :host-context(body[data-theme='light']) .menu-panel {
      background: #ffffff;
      border-color: rgba(148, 163, 184, 0.4);
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
    }

    :host-context(body[data-theme='light']) .menu-panel button {
      color: #1e293b;
    }

    :host-context(body[data-theme='light']) .menu-panel button:hover {
      background: rgba(59, 130, 246, 0.08);
      color: #2563eb;
    }
  `]
})
export class PropertyRowComponent {
  @Input() property!: Property;
  @Input() canDelete = false;
  @Output() edit = new EventEmitter<Property>();
  @Output() remove = new EventEmitter<string>();

  get imageUrl(): string | null {
    const anyProp = this.property as any;
    if (anyProp.image_urls && anyProp.image_urls.length) return anyProp.image_urls[0];
    return anyProp.image_url || null;
  }

  get addressLine(): string {
    const street = this.property.street || '';
    const neighborhood = this.property.neighborhood || '';
    const city = this.property.city || '';
    const parts = [street, neighborhood].filter(Boolean).join(', ');
    return [parts, city].filter(Boolean).join(' - ') || '-';
  }

  get secondaryTag(): string | null {
    const anyProp = this.property as any;
    const area = anyProp.areaPrivativa ?? anyProp.areaConstrutiva ?? anyProp.areaTerreno ?? anyProp.area;
    if (area) return `${area}m²`;
    if (anyProp.suites) return `${anyProp.suites} Suítes`;
    if (anyProp.bedrooms) return `${anyProp.bedrooms} Quartos`;
    if (anyProp.parking) return `${anyProp.parking} Vagas`;
    return null;
  }

  get valueMeta(): string | null {
    const anyProp = this.property as any;
    if (anyProp.condominio) return `Cond: ${anyProp.condominio}`;
    if (anyProp.iptu) return `Iptu: ${anyProp.iptu}`;
    if (anyProp.status) return (anyProp.status as string).toUpperCase();
    return null;
  }
}
