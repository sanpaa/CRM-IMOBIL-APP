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
import { GlobalSearchComponent } from '../../shared/components/global-search.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, GlobalSearchComponent],
  template: `
    <div class="dashboard-wrapper">
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Olá, <span class="header-name" [class.is-loading]="isLoadingStats">{{ isLoadingStats ? 'Carregando' : displayName }}</span>!</h1>
            <p class="header-subtitle">Bem-vindo de volta.</p>
          </div>
          <app-global-search class="header-search"></app-global-search>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card stat-card-primary">
            <span class="stat-trend neutral">0%</span>
            <div class="stat-icon">
              <i class="bi bi-people-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Total de Clientes</div>
              <div class="stat-value">{{ stats.clients }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-success">
            <span class="stat-trend neutral">0%</span>
            <div class="stat-icon">
              <i class="bi bi-house-door-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Imóveis Cadastrados</div>
              <div class="stat-value">{{ stats.properties }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-warning">
            <span class="stat-trend neutral">0%</span>
            <div class="stat-icon">
              <i class="bi bi-calendar-check-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-label">Visitas Agendadas</div>
              <div class="stat-value">{{ stats.visits }}</div>
            </div>
          </div>

          <div class="stat-card stat-card-info">
            <span class="stat-trend neutral">0%</span>
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
          <div class="chart-card chart-card-wide">
            <div class="chart-header">
              <h3>Atividades dos Últimos 6 Meses</h3>
              <p>Visão histórica de clientes e imóveis</p>
            </div>
            <div class="chart-container chart-container-wide">
              <canvas #monthlyChart></canvas>
              <div class="chart-overlay chart-loading" *ngIf="isLoadingStats">
                <div class="shimmer-block shimmer-chart"></div>
              </div>
              <div class="chart-overlay chart-empty" *ngIf="!isLoadingStats && !hasMonthlyData">
                <span>Sem dados para exibir</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>Clientes por Status</h3>
              <p>Distribuição dos clientes no funil</p>
            </div>
            <div class="chart-container">
              <canvas #clientsChart></canvas>
              <div class="chart-overlay chart-loading" *ngIf="isLoadingStats">
                <div class="shimmer-block shimmer-chart"></div>
              </div>
              <div class="chart-overlay chart-empty" *ngIf="!isLoadingStats && !hasClientsData">
                <span>Sem dados para exibir</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3>Pipeline de Negócios</h3>
              <p>Status dos negócios em andamento</p>
            </div>
            <div class="chart-container">
              <canvas #dealsChart></canvas>
              <div class="chart-overlay chart-loading" *ngIf="isLoadingStats">
                <div class="shimmer-block shimmer-chart"></div>
              </div>
              <div class="chart-overlay chart-empty" *ngIf="!isLoadingStats && !hasDealsData">
                <span>Sem dados para exibir</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>Ações Rápidas</h3>
          <div class="actions-grid">
            <a routerLink="/clients" class="action-card">
              <span class="action-icon">
                <i class="bi bi-person-fill"></i>
              </span>
              <span class="action-label">Novo Cliente</span>
            </a>
            <a routerLink="/properties" class="action-card">
              <span class="action-icon">
                <i class="bi bi-house-door-fill"></i>
              </span>
              <span class="action-label">Novo Imóvel</span>
            </a>
            <a routerLink="/visits" class="action-card">
              <span class="action-icon">
                <i class="bi bi-calendar-check-fill"></i>
              </span>
              <span class="action-label">Agendar Visita</span>
            </a>
            <a routerLink="/deals" class="action-card">
              <span class="action-icon">
                <i class="bi bi-briefcase-fill"></i>
              </span>
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
      background: var(--color-bg-primary);
    }

    .page-header {
      background: var(--color-bg-primary);
      padding: 2rem 2.75rem 1.5rem;
      border-bottom: 1px solid transparent;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    .header-text h1 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 2rem;
      font-weight: 700;
    }

    .header-name {
      position: relative;
      display: inline-flex;
      align-items: center;
      min-width: 120px;
    }

    .header-name.is-loading {
      color: transparent;
    }

    .header-name.is-loading::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 70%;
      border-radius: 999px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      background-size: 220% 100%;
      animation: shimmer 1.2s ease-in-out infinite;
      background-color: rgba(148, 163, 184, 0.35);
    }

    .header-subtitle {
      margin: 0.25rem 0 0 0;
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .header-search {
      min-width: 320px;
    }

    .dashboard-content {
      padding: 1.5rem 2.75rem 2.25rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }

    .stat-card {
      position: relative;
      background: var(--color-bg-secondary);
      padding: 1.2rem 1.4rem;
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      border: 1px solid var(--color-border-light);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .stat-card-primary { background: linear-gradient(135deg, #6FA8FF, #4F6EDB); color: #fff; border-color: transparent; }
    .stat-card-success { background: linear-gradient(135deg, #74D99A, #2EBB6D); color: #fff; border-color: transparent; }
    .stat-card-warning { background: linear-gradient(135deg, #FFD07A, #F5A623); color: #fff; border-color: transparent; }
    .stat-card-info { background: linear-gradient(135deg, #B394FF, #7B5BDA); color: #fff; border-color: transparent; }

    .stat-trend {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #1F2937;
      background: rgba(255, 255, 255, 0.85);
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.6);
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      font-size: 1.3rem;
    }

    .stat-card-primary .stat-icon,
    .stat-card-success .stat-icon,
    .stat-card-warning .stat-icon,
    .stat-card-info .stat-icon { color: #fff; }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2.1rem;
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
      margin-bottom: 2.25rem;
    }

    .chart-card {
      background: var(--color-bg-secondary);
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border-light);
    }

    .chart-card-wide { grid-column: 1 / -1; }

    .chart-header {
      margin-bottom: 1.5rem;
    }

    .chart-header h3 {
      margin: 0 0 0.25rem 0;
      color: var(--color-text-primary);
      font-size: 1.1rem;
      font-weight: 700;
    }

    .chart-header p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 0.85rem;
    }

    .chart-container {
      position: relative;
      height: 300px;
    }

    .chart-card-wide {
      grid-column: 1 / -1;
    }

    .chart-container-wide {
      height: 260px;
    }

    .chart-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      border-radius: 10px;
    }

    .chart-loading {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(2px);
    }

    .chart-empty span {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      background: rgba(148, 163, 184, 0.12);
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      border: 1px solid var(--color-border-light);
    }

    .shimmer-block {
      width: 70%;
      height: 60%;
      border-radius: 12px;
      background: linear-gradient(90deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.5), rgba(148, 163, 184, 0.2));
      background-size: 200% 100%;
      animation: shimmer 1.2s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .quick-actions {
      background: var(--color-bg-secondary);
      padding: 1.75rem;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border-light);
    }

    .quick-actions h3 {
      margin: 0 0 1.5rem 0;
      color: var(--color-text-primary);
      font-size: 1.1rem;
      font-weight: 700;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem 1rem;
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
      text-decoration: none;
      border-radius: 18px;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border-light);
    }

    .action-card:hover {
      transform: translateY(-4px);
      border-color: #C7D2FE;
      box-shadow: var(--shadow-md);
    }

    .action-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(59, 130, 246, 0.12);
      color: #3B82F6;
      font-size: 1rem;
    }

    .action-label {
      font-weight: 600;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        padding: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-search {
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }

    :host-context(body[data-theme='dark']) .stat-card {
      border-color: transparent;
    }

    :host-context(body[data-theme='dark']) .stat-card-primary {
      background: linear-gradient(135deg, #2A4B8D, #1E3A8A);
    }

    :host-context(body[data-theme='dark']) .stat-card-success {
      background: linear-gradient(135deg, #166534, #14532D);
    }

    :host-context(body[data-theme='dark']) .stat-card-warning {
      background: linear-gradient(135deg, #7C4A03, #92400E);
    }

    :host-context(body[data-theme='dark']) .stat-card-info {
      background: linear-gradient(135deg, #4C1D95, #312E81);
    }

    :host-context(body[data-theme='dark']) .stat-trend {
      color: var(--color-text-primary);
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(15, 23, 42, 0.6);
    }

    :host-context(body[data-theme='dark']) .action-icon {
      background: rgba(59, 130, 246, 0.2);
    }

    :host-context(body[data-theme='dark']) .chart-loading {
      background: rgba(15, 23, 42, 0.55);
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

  isLoadingStats = true;
  hasClientsData = false;
  hasDealsData = false;
  hasMonthlyData = false;

  private charts: any[] = [];
  private themeObserver?: MutationObserver;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private propertyService: PropertyService,
    private visitService: VisitService,
    private dealService: DealService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser() || this.getStoredUser();
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        return;
      }
      if (!this.currentUser) {
        this.currentUser = this.getStoredUser();
      }
    });

    this.observeThemeChanges();
    await this.loadStats();
  }

  get displayName(): string {
    const directName = this.currentUser?.name || (this.currentUser as any)?.username;
    if (directName) return directName;

    const stored = this.getStoredUser();
    return stored?.name || (stored as any)?.username || 'Cliente';
  }

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (typeof parsed.name === 'string') return parsed as User;
      if (typeof parsed.username === 'string') {
        return { ...parsed, name: parsed.username } as User;
      }
      return null;
    } catch {
      return null;
    }
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
    this.isLoadingStats = true;
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
    } finally {
      this.isLoadingStats = false;
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

    this.hasClientsData = this.sumArray(this.clientsData) > 0;
    this.hasDealsData = this.sumArray(this.dealsData) > 0;
    this.hasMonthlyData = (this.sumArray(monthlyClients) + this.sumArray(monthlyProperties)) > 0;
  }

  private sumArray(values: number[]): number {
    return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
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

  private observeThemeChanges() {
    const target = document.body;
    this.themeObserver = new MutationObserver(() => {
      if (this.clientsChartRef && this.dealsChartRef && this.monthlyChartRef) {
        this.destroyCharts();
        this.createCharts();
      }
    });
    this.themeObserver.observe(target, { attributes: true, attributeFilter: ['data-theme'] });
  }

  private getChartTheme() {
    const styles = getComputedStyle(document.body);
    return {
      text: styles.getPropertyValue('--color-text-secondary').trim() || '#64748B',
      grid: styles.getPropertyValue('--color-border-light').trim() || 'rgba(15, 23, 42, 0.08)',
      card: styles.getPropertyValue('--color-bg-secondary').trim() || '#FFFFFF',
      accent: styles.getPropertyValue('--color-primary').trim() || '#3B82F6'
    };
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

    const theme = this.getChartTheme();
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Leads', 'Em Contato', 'Interessados', 'Clientes'],
        datasets: [{
          data: this.clientsData.length > 0 ? this.clientsData : [0, 0, 0, 0],
          backgroundColor: [
            '#93C5FD',
            '#60A5FA',
            '#3B82F6',
            '#2563EB'
          ],
          borderWidth: 2,
          borderColor: theme.card
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
              },
              color: theme.text
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

    const theme = this.getChartTheme();
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Proposta', 'Negociação', 'Aceito', 'Fechado'],
        datasets: [{
          label: 'Negócios',
          data: this.dealsData.length > 0 ? this.dealsData : [0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.85)',
          borderColor: theme.accent,
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
              stepSize: 5,
              color: theme.text
            },
            grid: {
              color: theme.grid
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: theme.text
            },
            border: {
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

    const theme = this.getChartTheme();
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getMonthLabels(),
        datasets: [
          {
            label: 'Novos Clientes',
            data: this.monthlyData.clients.length > 0 ? this.monthlyData.clients : [0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.18)',
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
            data: this.monthlyData.properties.length > 0 ? this.monthlyData.properties : [0, 0, 0, 0, 0, 0],
            borderColor: 'rgb(129, 140, 248)',
            backgroundColor: 'rgba(129, 140, 248, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(129, 140, 248)',
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
              usePointStyle: true,
              color: theme.text
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
              stepSize: 10,
              color: theme.text
            },
            grid: {
              color: theme.grid
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: theme.text
            },
            border: {
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
    this.themeObserver?.disconnect();
  }

  logout() {
    this.authService.signOut();
  }
}
