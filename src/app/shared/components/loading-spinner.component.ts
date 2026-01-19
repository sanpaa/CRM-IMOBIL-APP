import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [class.fullscreen]="fullscreen">
      <div class="spinner-wrapper">
        <div class="spinner"></div>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      z-index: 9999;
    }

    .spinner-wrapper {
      text-align: center;
    }

    .spinner {
      display: inline-block;
      width: 3rem;
      height: 3rem;
      border: 4px solid rgba(31, 41, 55, 0.1);
      border-radius: 50%;
      border-top-color: var(--color-text-primary);
      animation: spinner 0.8s linear infinite;
    }

    @keyframes spinner {
      to { transform: rotate(360deg); }
    }

    .loading-message {
      margin-top: 1rem;
      color: #6B7280;
      font-size: 0.95rem;
      font-weight: 500;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message?: string;
  @Input() fullscreen = false;
}
