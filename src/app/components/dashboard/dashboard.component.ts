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
            <div class="stat-icon">
              <i class="bi bi-people-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Total de Clientes</div>
              <div class="stat-value">{{ stats.clients }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-success">
            <div class="stat-icon">
              <i class="bi bi-house-door-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Imóveis Cadastrados</div>
              <div class="stat-value">{{ stats.properties }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-warning">
            <div class="stat-icon">
              <i class="bi bi-calendar-check-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Visitas Agendadas</div>
              <div class="stat-value">{{ stats.visits }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-info">
            <div class="stat-icon">
              <i class="bi bi-briefcase-fill"></i>
            </div>
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
              <i class="bi bi-person-plus-fill"></i>
              <span class="action-label">Novo Cliente</span>
            </a>
            <a routerLink="/properties" class="action-card">
              <i class="bi bi-house-add-fill"></i>
              <span class="action-label">Novo Imóvel</span>
            </a>
            <a routerLink="/visits" class="action-card">
              <i class="bi bi-calendar-plus-fill"></i>
              <span class="action-label">Agendar Visita</span>
            </a>
            <a routerLink="/deals" class="action-card">
              <i class="bi bi-cash-stack"></i>
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
      background: #F5F7FA;
    }

    .page-header {
      background: #FFFFFF;
      padding: 2rem 2.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border-bottom: 1px solid #E5E7EB;
    }

    .header-content h1 {
      margin: 0;
      color: #1F2933;
      font-size: 2rem;
      font-weight: 700;
    }

    .header-subtitle {
      margin: 0.25rem 0 0 0;
      color: #6B7280;
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
      background: #FFFFFF;
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: all 0.3s ease;
      border: 1px solid #E5E7EB;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .stat-card-primary { border-left: 4px solid #374151; }
    .stat-card-success { border-left: 4px solid #059669; }
    .stat-card-warning { border-left: 4px solid #D97706; }
    .stat-card-info { border-left: 4px solid #4B5563; }

    .stat-icon {
      font-size: 2.5rem;
      color: currentColor;
      opacity: 0.9;
    }

    .stat-card-primary .stat-icon { color: #374151; }
    .stat-card-success .stat-icon { color: #059669; }
    .stat-card-warning .stat-icon { color: #D97706; }
    .stat-card-info .stat-icon { color: #4B5563; }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #6B7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1F2933;
      line-height: 1;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: #FFFFFF;
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #E5E7EB;
    }

    .chart-card-wide {
      grid-column: 1 / -1;
    }

    .chart-header {
      margin-bottom: 1.5rem;
    }

    .chart-header h3 {
      margin: 0 0 0.25rem 0;
      color: #1F2933;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .chart-header p {
      margin: 0;
      color: #6B7280;
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
      background: #FFFFFF;
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #E5E7EB;
    }

    .quick-actions h3 {
      margin: 0 0 1.5rem 0;
      color: #1F2933;
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
      background: #374151;
      color: white;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(55, 65, 81, 0.2);
    }

    .action-card:hover {
      transform: translateY(-4px);
      background: #1F2937;
      box-shadow: 0 4px 12px rgba(55, 65, 81, 0.3);
    }

    .action-card i {
      font-size: 2.5rem;
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

  // Real data for charts
  private clientsData: any[] = [];
  private dealsData: any[] = [];
  private monthlyData: { clients: number[], properties: number[] } = { clients: [], properties: [] };

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
    // Initialize charts after view is ready - only if data is loaded
    setTimeout(() => {
      if (this.clientsData.length > 0 || this.dealsData.length > 0) {
        this.createCharts();
      }
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

      // Prepare data for charts
      this.prepareChartData(clients, deals, properties);
      
      // Destroy existing charts before recreating
      this.destroyCharts();
      
      // Recreate charts with real data if they exist
      if (this.clientsChartRef && this.dealsChartRef && this.monthlyChartRef) {
        this.createCharts();
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  prepareChartData(clients: any[], deals: any[], properties: any[]) {
    // Count clients by status
    const clientStatusCount: any = {
      'lead': 0,
      'contato': 0,
      'interessado': 0,
      'cliente': 0
    };

    clients.forEach(client => {
      const status = client.status?.toLowerCase() || 'lead';
      if (clientStatusCount.hasOwnProperty(status)) {
        clientStatusCount[status]++;
      }
    });

    this.clientsData = [
      clientStatusCount['lead'],
      clientStatusCount['contato'],
      clientStatusCount['interessado'],
      clientStatusCount['cliente']
    ];

    // Count deals by status
    const dealStatusCount: any = {
      'proposta': 0,
      'negociacao': 0,
      'aceito': 0,
      'fechado': 0
    };

    deals.forEach(deal => {
      const status = deal.status?.toLowerCase() || 'proposta';
      if (dealStatusCount.hasOwnProperty(status)) {
        dealStatusCount[status]++;
      }
    });

    this.dealsData = [
      dealStatusCount['proposta'],
      dealStatusCount['negociacao'],
      dealStatusCount['aceito'],
      dealStatusCount['fechado']
    ];

    // Prepare monthly data (last 6 months)
    const now = new Date();
    const monthlyClients = new Array(6).fill(0);
    const monthlyProperties = new Array(6).fill(0);

    clients.forEach(client => {
      const createdDate = new Date(client.created_at);
      const monthDiff = this.getMonthDifference(createdDate, now);
      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyClients[5 - monthDiff]++;
      }
    });

    properties.forEach(property => {
      const createdDate = new Date(property.created_at);
      const monthDiff = this.getMonthDifference(createdDate, now);
      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyProperties[5 - monthDiff]++;
      }
    });

    this.monthlyData = {
      clients: monthlyClients,
      properties: monthlyProperties
    };
  }

  getMonthDifference(date1: Date, date2: Date): number {
    return (date2.getFullYear() - date1.getFullYear()) * 12 + 
           (date2.getMonth() - date1.getMonth());
  }

  getMonthLabels(): string[] {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const labels: string[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(months[date.getMonth()]);
    }
    
    return labels;
  }

  destroyCharts() {
    this.charts.forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = [];
  }

  createCharts() {
    this.createClientsChart();
    this.createDealsChart();
    this.createMonthlyChart();
  }

  createClientsChart() {
    if (!this.clientsChartRef) return;

    const canvas = this.clientsChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get existing chart instance and destroy it
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Leads', 'Em Contato', 'Interessados', 'Clientes'],
        datasets: [{
          data: this.clientsData.length > 0 ? this.clientsData : [0, 0, 0, 0],
          backgroundColor: [
            '#6B7280',
            '#9CA3AF',
            '#4B5563',
            '#059669'
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

    const canvas = this.dealsChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get existing chart instance and destroy it
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Proposta', 'Negociação', 'Aceito', 'Fechado'],
        datasets: [{
          label: 'Negócios',
          data: this.dealsData.length > 0 ? this.dealsData : [0, 0, 0, 0],
          backgroundColor: [
            'rgba(107, 114, 128, 0.8)',
            'rgba(156, 163, 175, 0.8)',
            'rgba(75, 85, 99, 0.8)',
            'rgba(5, 150, 105, 0.8)'
          ],
          borderColor: [
            'rgb(107, 114, 128)',
            'rgb(156, 163, 175)',
            'rgb(75, 85, 99)',
            'rgb(5, 150, 105)'
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

    const canvas = this.monthlyChartRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get existing chart instance and destroy it
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getMonthLabels(),
        datasets: [
          {
            label: 'Novos Clientes',
            data: this.monthlyData.clients.length > 0 ? this.monthlyData.clients : [0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(75, 85, 99)',
            backgroundColor: 'rgba(75, 85, 99, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(75, 85, 99)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Novos Imóveis',
            data: this.monthlyData.properties.length > 0 ? this.monthlyData.properties : [0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(5, 150, 105)',
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(5, 150, 105)',
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
    this.destroyCharts();
  }

  logout() {
    this.authService.signOut();
  }
}
