import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header [class]="headerClass">
      <div class="header-top"><ng-content select="[header-top]"></ng-content></div>
      <div class="header-main">
        <div class="header-left">
          <ng-content select="[header-left]"></ng-content>
          <div class="header-title" *ngIf="title">
            <div class="title-stack">
              <h1>{{ title }}</h1>
              <p class="header-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
              <p class="header-meta" *ngIf="meta">{{ meta }}</p>
            </div>
            <span class="header-badge" *ngIf="badge !== null && badge !== undefined">{{ badge }}</span>
          </div>
        </div>
        <div class="header-actions"><ng-content select="[header-actions]"></ng-content></div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }

    header {
      background: var(--page-header-bg, var(--color-bg-secondary));
      padding: var(--page-header-padding, 2rem 2.5rem);
      border-bottom: var(--page-header-border, 1px solid var(--color-border-light));
      box-shadow: var(--page-header-shadow, 0 2px 4px rgba(0, 0, 0, 0.05));
    }

    .header-top {
      display: flex;
      align-items: center;
      gap: var(--page-header-top-gap, 0.75rem);
      margin-bottom: var(--page-header-top-gap, 0.75rem);
    }

    .header-top:empty {
      display: none;
      margin-bottom: 0;
    }

    .header-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }

    .title-stack {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }

    h1 {
      margin: 0;
      color: var(--page-header-title-color, var(--color-text-primary));
      font-size: var(--page-header-title-size, 2rem);
      font-weight: var(--page-header-title-weight, 700);
      font-family: var(--page-header-title-font, inherit);
      letter-spacing: var(--page-header-title-letter-spacing, normal);
    }

    .header-subtitle {
      margin: 0;
      color: var(--page-header-subtitle-color, var(--color-text-secondary));
      font-size: var(--page-header-subtitle-size, 0.95rem);
      font-weight: var(--page-header-subtitle-weight, 500);
    }

    .header-meta {
      margin: 0;
      color: var(--page-header-meta-color, var(--color-text-tertiary));
      font-size: var(--page-header-meta-size, 0.85rem);
    }

    .header-badge {
      font-size: var(--page-header-badge-size, 0.85rem);
      font-weight: 600;
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      background: var(--page-header-badge-bg, var(--color-bg-tertiary));
      color: var(--page-header-badge-color, var(--color-text-secondary));
      white-space: nowrap;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--page-header-actions-gap, 0.75rem);
      flex-wrap: wrap;
    }

    .header-actions:empty {
      display: none;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() meta?: string;
  @Input() badge?: string | number | null;
  @Input() headerClass = 'page-header';
}
