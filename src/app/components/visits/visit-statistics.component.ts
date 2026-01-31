import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Visit } from '../../models/visit.model';

interface Statistics {
  total: number;
  agendada: number;
  confirmada: number;
  realizada: number;
  cancelada: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

@Component({
  selector: 'app-visit-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container">
      <div class="stats-title">Estatísticas do período</div>
      
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon"><i class="bi bi-calendar3"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total de Visitas</div>
          </div>
        </div>

        <div class="stat-card agendada">
          <div class="stat-icon"><i class="bi bi-clock"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.agendada }}</div>
            <div class="stat-label">Agendadas</div>
          </div>
        </div>

        <div class="stat-card confirmada">
          <div class="stat-icon"><i class="bi bi-patch-check"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.confirmada }}</div>
            <div class="stat-label">Confirmadas</div>
          </div>
        </div>

        <div class="stat-card realizada">
          <div class="stat-icon"><i class="bi bi-check2-circle"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.realizada }}</div>
            <div class="stat-label">Realizadas</div>
          </div>
        </div>

        <div class="stat-card cancelada">
          <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.cancelada }}</div>
            <div class="stat-label">Canceladas</div>
          </div>
        </div>
      </div>

      <div class="completion-rate">
        <div class="rate-header">
          <div>
            <strong>Taxa de Conclusão</strong>
            <small>{{ stats.realizada }} de {{ stats.total }} visitas finalizadas</small>
          </div>
          <span class="rate-value">{{ completionRate }}%</span>
        </div>
        <div class="rate-bar">
          <div class="rate-fill" [style.width.%]="completionRate"></div>
        </div>
        <div class="period-inline">
          <div>
            <span>Hoje</span>
            <strong>{{ stats.today }}</strong>
          </div>
          <div>
            <span>Semana</span>
            <strong>{{ stats.thisWeek }}</strong>
          </div>
          <div>
            <span>Mês</span>
            <strong>{{ stats.thisMonth }}</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      background: var(--color-bg-secondary);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid var(--color-border-light);
      margin-bottom: 2rem;
    }

    .stats-title {
      margin: 0 0 1.2rem 0;
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.75rem;
    }

    .stat-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-radius: 14px;
      transition: all 0.3s ease;
      border: 1px solid var(--color-border-light);
      background: var(--color-bg-secondary);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card.total {
      border-left: 3px solid var(--color-primary);
    }

    .stat-card.agendada {
      border-left: 3px solid #f59e0b;
    }

    .stat-card.confirmada {
      border-left: 3px solid #10b981;
    }

    .stat-card.realizada {
      border-left: 3px solid #3b82f6;
    }

    .stat-card.cancelada {
      border-left: 3px solid #ef4444;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.5rem;
      color: var(--color-text-primary);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    .completion-rate {
      padding: 1.25rem 1.5rem;
      background: var(--color-bg-secondary);
      border-radius: 14px;
      border: 1px solid var(--color-border-light);
    }

    .rate-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--color-text-primary);
    }

    .rate-header strong {
      display: block;
      font-weight: 700;
    }

    .rate-header small {
      display: block;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .rate-value {
      font-size: 1.5rem;
      color: var(--color-primary);
      font-weight: 700;
    }

    .rate-bar {
      height: 8px;
      background: var(--color-bg-tertiary);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .rate-fill {
      height: 100%;
      background: var(--color-primary);
      border-radius: 999px;
      transition: width 0.6s ease;
    }

    .period-inline {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      color: var(--color-text-secondary);
      font-size: 0.8rem;
    }

    .period-inline strong {
      display: block;
      color: var(--color-text-primary);
      font-size: 1rem;
      margin-top: 0.2rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 1rem;
      }

      .stat-value {
        font-size: 1.5rem;
      }

      .period-inline {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VisitStatisticsComponent implements OnInit, OnChanges {
  @Input() visits: Visit[] = [];
  @Input() filterView: 'day' | 'week' | 'month' = 'month';
  @Input() currentDate: Date = new Date();

  stats: Statistics = {
    total: 0,
    agendada: 0,
    confirmada: 0,
    realizada: 0,
    cancelada: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  };

  completionRate = 0;

  ngOnInit() {
    this.calculateStatistics();
  }

  ngOnChanges() {
    this.calculateStatistics();
  }

  calculateStatistics() {
    // Filter visits based on current view and date
    const filteredVisits = this.getFilteredVisits();

    // Reset stats
    this.stats = {
      total: filteredVisits.length,
      agendada: 0,
      confirmada: 0,
      realizada: 0,
      cancelada: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    };

    // Calculate status counts
    filteredVisits.forEach(visit => {
      const status = visit.status || 'agendada';
      switch (status) {
        case 'agendada':
          this.stats.agendada++;
          break;
        case 'confirmada':
          this.stats.confirmada++;
          break;
        case 'realizada':
          this.stats.realizada++;
          break;
        case 'cancelada':
          this.stats.cancelada++;
          break;
      }
    });

    // Calculate period counts from all visits
    const today = new Date();
    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = this.getEndOfWeek(today);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.visits.forEach(visit => {
      const visitDate = this.parseVisitDateLocal(visit.visit_date);
      if (!visitDate) return;
      
      // Today
      if (this.isSameDay(visitDate, today)) {
        this.stats.today++;
      }
      
      // This week
      if (visitDate >= startOfWeek && visitDate <= endOfWeek) {
        this.stats.thisWeek++;
      }
      
      // This month
      if (visitDate >= startOfMonth && visitDate <= endOfMonth) {
        this.stats.thisMonth++;
      }
    });

    // Calculate completion rate
    if (this.stats.total > 0) {
      this.completionRate = Math.round((this.stats.realizada / this.stats.total) * 100);
    } else {
      this.completionRate = 0;
    }
  }

  getFilteredVisits(): Visit[] {
    if (!this.currentDate) return this.visits;

    return this.visits.filter(visit => {
      const visitDate = this.parseVisitDateLocal(visit.visit_date);
      if (!visitDate) return false;
      
      switch (this.filterView) {
        case 'day':
          return this.isSameDay(visitDate, this.currentDate);
        
        case 'week':
          const weekStart = this.getStartOfWeek(this.currentDate);
          const weekEnd = this.getEndOfWeek(this.currentDate);
          return visitDate >= weekStart && visitDate <= weekEnd;
        
        case 'month':
          return visitDate.getMonth() === this.currentDate.getMonth() &&
                 visitDate.getFullYear() === this.currentDate.getFullYear();
        
        default:
          return true;
      }
    });
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  }

  private parseVisitDateLocal(value?: string | null): Date | null {
    if (!value) return null;
    const parts = value.split('-').map(part => Number(part));
    if (parts.length !== 3 || parts.some(part => Number.isNaN(part))) return null;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }
}
