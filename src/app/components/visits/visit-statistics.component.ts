import { Component, OnInit, Input } from '@angular/core';
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
      <h3 class="stats-title">Estatísticas</h3>
      
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total de Visitas</div>
          </div>
        </div>

        <div class="stat-card agendada">
          <div class="stat-icon">🕐</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.agendada }}</div>
            <div class="stat-label">Agendadas</div>
          </div>
        </div>

        <div class="stat-card confirmada">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.confirmada }}</div>
            <div class="stat-label">Confirmadas</div>
          </div>
        </div>

        <div class="stat-card realizada">
          <div class="stat-icon">✔</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.realizada }}</div>
            <div class="stat-label">Realizadas</div>
          </div>
        </div>

        <div class="stat-card cancelada">
          <div class="stat-icon">✖</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.cancelada }}</div>
            <div class="stat-label">Canceladas</div>
          </div>
        </div>
      </div>

      <div class="period-stats">
        <div class="period-card">
          <div class="period-value">{{ stats.today }}</div>
          <div class="period-label">Hoje</div>
        </div>
        <div class="period-card">
          <div class="period-value">{{ stats.thisWeek }}</div>
          <div class="period-label">Esta Semana</div>
        </div>
        <div class="period-card">
          <div class="period-value">{{ stats.thisMonth }}</div>
          <div class="period-label">Este Mês</div>
        </div>
      </div>

      <div class="completion-rate">
        <div class="rate-header">
          <span>Taxa de Conclusão</span>
          <span class="rate-value">{{ completionRate }}%</span>
        </div>
        <div class="rate-bar">
          <div class="rate-fill" [style.width.%]="completionRate"></div>
        </div>
        <div class="rate-details">
          <small>{{ stats.realizada }} de {{ stats.total }} visitas realizadas</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
      margin-bottom: 2rem;
    }

    .stats-title {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 700;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .stat-card.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-card.agendada {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
      color: white;
    }

    .stat-card.confirmada {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .stat-card.realizada {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
      color: white;
    }

    .stat-card.cancelada {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .stat-icon {
      font-size: 2.5rem;
      line-height: 1;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
      font-weight: 500;
    }

    .period-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .period-card {
      text-align: center;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .period-value {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .period-label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .completion-rate {
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9ff 0%, #f1f5ff 100%);
      border-radius: 12px;
      border: 2px solid #e0e7ff;
    }

    .rate-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .rate-value {
      font-size: 1.5rem;
      color: #667eea;
    }

    .rate-bar {
      height: 12px;
      background: #e0e7ff;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .rate-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 6px;
      transition: width 0.6s ease;
    }

    .rate-details {
      text-align: center;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .period-stats {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 1rem;
      }

      .stat-value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class VisitStatisticsComponent implements OnInit {
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
      const visitDate = new Date(visit.visit_date);
      
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
      const visitDate = new Date(visit.visit_date);
      
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
}
