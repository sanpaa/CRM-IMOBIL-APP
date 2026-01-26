import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer [class]="footerClass">
      <div class="footer-content"><ng-content></ng-content></div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }

    footer {
      background: var(--page-footer-bg, transparent);
      padding: var(--page-footer-padding, 1.5rem 2.5rem 2.5rem);
      border-top: var(--page-footer-border, 1px solid var(--color-border-light));
      box-shadow: var(--page-footer-shadow, none);
    }

    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      color: var(--page-footer-color, var(--color-text-secondary));
      font-size: var(--page-footer-font-size, 0.9rem);
    }
  `]
})
export class PageFooterComponent {
  @Input() footerClass = 'page-footer';
}
