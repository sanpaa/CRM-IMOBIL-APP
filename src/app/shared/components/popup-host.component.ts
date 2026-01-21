import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PopupRequest, PopupService } from '../services/popup.service';

@Component({
  selector: 'app-popup-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup-backdrop" *ngIf="request" (click)="handleCancel()">
      <div class="popup-card" (click)="$event.stopPropagation()">
        <div class="popup-header">
          <h3>{{ request?.title }}</h3>
        </div>
        <div class="popup-body">
          <p>{{ request?.message }}</p>
        </div>
        <div class="popup-actions">
          <button
            *ngIf="request?.type === 'confirm'"
            type="button"
            class="btn-secondary"
            (click)="handleCancel()">
            {{ request?.cancelText }}
          </button>
          <button
            type="button"
            class="btn-primary"
            [class.danger]="request?.tone === 'danger'"
            [class.warning]="request?.tone === 'warning'"
            (click)="handleConfirm()">
            {{ request?.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .popup-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      animation: fadeIn 0.2s ease;
    }

    .popup-card {
      width: min(520px, 92vw);
      background: var(--color-bg-secondary);
      border-radius: 14px;
      border: 1px solid var(--color-border-light);
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
      overflow: hidden;
    }

    .popup-header {
      padding: 1.25rem 1.5rem 0.5rem;
    }

    .popup-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--color-text-primary);
    }

    .popup-body {
      padding: 0 1.5rem 1.25rem;
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .popup-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem 1.5rem;
      background: var(--color-bg-tertiary);
      border-top: 1px solid var(--color-border-light);
    }

    .btn-primary,
    .btn-secondary {
      border: none;
      border-radius: 999px;
      padding: 0.55rem 1.25rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary.warning {
      background: #f59e0b;
    }

    .btn-primary.danger {
      background: #ef4444;
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border-light);
    }

    .btn-secondary:hover {
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class PopupHostComponent implements OnInit, OnDestroy {
  request: PopupRequest | null = null;
  private subscription?: Subscription;

  constructor(private popupService: PopupService) {}

  ngOnInit() {
    this.subscription = this.popupService.request$.subscribe(request => {
      this.request = request;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  handleConfirm() {
    if (!this.request) return;
    const resolver = this.request.resolve;
    this.request = null;
    resolver(true);
  }

  handleCancel() {
    if (!this.request) return;
    const resolver = this.request.resolve;
    const shouldConfirm = this.request.type === 'alert';
    this.request = null;
    resolver(shouldConfirm);
  }
}
