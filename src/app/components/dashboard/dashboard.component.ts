import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { PropertyService } from '../../services/property.service';
import { VisitService } from '../../services/visit.service';
import { DealService } from '../../services/deal.service';
import { User } from '../../models/user.model';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  template: `
    <div class="dashboard-wrapper">
      <header class="page-header">
        <div class="header-content">
          <h1>Dashboard</h1>
          <p class="header-subtitle">Visão geral do seu negócio</p>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card stat-card-primary">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-label">Total de Clientes</div>
              <div class="stat-value">{{ stats.clients }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-success">
            <div class="stat-icon">🏠</div>
            <div class="stat-content">
              <div class="stat-label">Imóveis Cadastrados</div>
              <div class="stat-value">{{ stats.properties }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-warning">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-label">Visitas Agendadas</div>
              <div class="stat-value">{{ stats.visits }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-info">
            <div class="stat-icon">💼</div>
            <div class="stat-content">
              <div class="stat-label">Negócios Ativos</div>
              <div class="stat-value">{{ stats.deals }}</div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Clientes por Status</h3>
              <p>Distribuição dos clientes no funil</p>
            </div>
            <div class="chart-container">
              <canvas #clientsChart></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>Pipeline de Negócios</h3>
              <p>Status dos negócios em andamento</p>
            </div>
            <div class="chart-container">
              <canvas #dealsChart></canvas>
            </div>
          </div>

          <div class="chart-card chart-card-wide">
            <div class="chart-header">
              <h3>Atividades dos Últimos 6 Meses</h3>
              <p>Visão histórica de clientes e imóveis</p>
            </div>
            <div class="chart-container">
              <canvas #monthlyChart></canvas>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Ações Rápidas</h3>
          <div class="actions-grid">
            <a routerLink="/clients" class="action-card">
              <span class="action-icon">➕</span>
              <span class="action-label">Novo Cliente</span>
            </a>
            <a routerLink="/properties" class="action-card">
              <span class="action-icon">🏡</span>
              <span class="action-label">Novo Imóvel</span>
            </a>
            <a routerLink="/visits" class="action-card">
              <span class="action-icon">📆</span>
              <span class="action-label">Agendar Visita</span>
            </a>
            <a routerLink="/deals" class="action-card">
              <span class="action-icon">💰</span>
              <span class="action-label">Novo Negócio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .page-header {
      background: white;
      padding: 2rem 2.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border-bottom: 1px solid #e5e7eb;
    }

    .header-content h1 {
      margin: 0;
      color: #1e293b;
      font-size: 2rem;
      font-weight: 700;
    }

    .header-subtitle {
      margin: 0.25rem 0 0 0;
      color: #64748b;
      font-size: 0.95rem;
    }

    .dashboard-content {
      padding: 2rem 2.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: all 0.3s ease;
      border: 1px solid #e5e7eb;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.12);
    }

    .stat-card-primary { border-left: 4px solid #3b82f6; }
    .stat-card-success { border-left: 4px solid #10b981; }
    .stat-card-warning { border-left: 4px solid #f59e0b; }
    .stat-card-info { border-left: 4px solid #8b5cf6; }

    .stat-icon {
      font-size: 3rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }

    .chart-card-wide {
      grid-column: 1 / -1;
    }

    .chart-header {
      margin-bottom: 1.5rem;
    }

    .chart-header h3 {
      margin: 0 0 0.25rem 0;
      color: #1e293b;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .chart-header p {
      margin: 0;
      color: #64748b;
      font-size: 0.85rem;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .chart-card-wide .chart-container {
      height: 350px;
    }

    .quick-actions {
      background: white;
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }

    .quick-actions h3 {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
    }

    .action-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    .action-label {
      font-weight: 600;
      font-size: 0.95rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('clientsChart') clientsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dealsChart') dealsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef<HTMLCanvasElement>;

  currentUser: User | null = null;
  stats = {
    clients: 0,
    properties: 0,
    visits: 0,
    deals: 0
  };

  private charts: any[] = [];

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private propertyService: PropertyService,
    private visitService: VisitService,
    private dealService: DealService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    await this.loadStats();
  }

  ngAfterViewInit() {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  async loadStats() {
    try {
      const [clients, properties, visits, deals] = await Promise.all([
        this.clientService.getAll(),
        this.propertyService.getAll(),
        this.visitService.getAll(),
        this.dealService.getAll()
      ]);

      this.stats = {
        clients: clients.length,
        properties: properties.length,
        visits: visits.length,
        deals: deals.length
      };
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  createCharts() {
    this.createClientsChart();
    this.createDealsChart();
    this.createMonthlyChart();
  }

  createClientsChart() {
    if (!this.clientsChartRef) return;

    const ctx = this.clientsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Leads', 'Em Contato', 'Interessados', 'Clientes'],
        datasets: [{
          data: [12, 8, 15, 20],
          backgroundColor: [
            '#3b82f6',
            '#f59e0b',
            '#8b5cf6',
            '#10b981'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  createDealsChart() {
    if (!this.dealsChartRef) return;

    const ctx = this.dealsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Prospecção', 'Negociação', 'Proposta', 'Fechado'],
        datasets: [{
          label: 'Negócios',
          data: [8, 12, 6, 15],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)',
            'rgb(16, 185, 129)'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 5
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  createMonthlyChart() {
    if (!this.monthlyChartRef) return;

    const ctx = this.monthlyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
          {
            label: 'Novos Clientes',
            data: [12, 19, 15, 25, 22, 30],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Novos Imóveis',
            data: [8, 12, 10, 18, 15, 20],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  ngOnDestroy() {
    // Clean up charts
    this.charts.forEach(chart => chart.destroy());
  }

  logout() {
    this.authService.signOut();
  }
}
