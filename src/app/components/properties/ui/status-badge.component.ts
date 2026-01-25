import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [ngClass]="toneClass">{{ label }}</span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid transparent;
      text-transform: capitalize;
    }

    .status-available {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border-color: rgba(16, 185, 129, 0.2);
    }

    .status-reserved {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
      border-color: rgba(245, 158, 11, 0.2);
    }

    .status-sold {
      background: rgba(244, 63, 94, 0.12);
      color: #f43f5e;
      border-color: rgba(244, 63, 94, 0.2);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() sold?: boolean;
  @Input() status?: string | null;

  get label(): string {
    const normalized = (this.status || '').toLowerCase();
    if (this.sold || normalized === 'vendido') return 'Vendido';
    if (normalized.includes('reserv')) return 'Reservado';
    return 'Disponível';
  }

  get toneClass(): string {
    const normalized = (this.status || '').toLowerCase();
    if (this.sold || normalized === 'vendido') return 'status-sold';
    if (normalized.includes('reserv')) return 'status-reserved';
    return 'status-available';
  }
}
