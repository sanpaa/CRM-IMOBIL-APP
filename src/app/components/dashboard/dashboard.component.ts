import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { PropertyService } from '../../services/property.service';
import { VisitService } from '../../services/visit.service';
import { DealService } from '../../services/deal.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <nav class="sidebar">
        <div class="logo">
          <h2>CRM Imobiliário</h2>
        </div>
        <ul class="nav-menu">
          <li><a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a></li>
          <li><a routerLink="/clients" routerLinkActive="active">Clientes</a></li>
          <li><a routerLink="/properties" routerLinkActive="active">Imóveis</a></li>
          <li><a routerLink="/visits" routerLinkActive="active">Visitas</a></li>
          <li><a routerLink="/deals" routerLinkActive="active">Negócios</a></li>
        </ul>
        <div class="user-info" *ngIf="currentUser">
          <div class="user-name">{{ currentUser.name }}</div>
          <div class="user-role">{{ currentUser.role }}</div>
          <button (click)="logout()" class="btn-logout">Sair</button>
        </div>
      </nav>

      <main class="main-content">
        <header class="header">
          <h1>Dashboard</h1>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>{{ stats.clients }}</h3>
              <p>Clientes</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🏠</div>
            <div class="stat-content">
              <h3>{{ stats.properties }}</h3>
              <p>Imóveis</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <h3>{{ stats.visits }}</h3>
              <p>Visitas</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💼</div>
            <div class="stat-content">
              <h3>{{ stats.deals }}</h3>
              <p>Negócios</p>
            </div>
          </div>
        </div>

        <div class="welcome-section">
          <h2>Bem-vindo ao CRM Imobiliário!</h2>
          <p>Sistema completo de gestão para imobiliárias com suporte multi-tenant.</p>
          
          <div class="features">
            <div class="feature">
              <h3>✓ Multi-Imobiliária</h3>
              <p>Dados isolados por empresa</p>
            </div>
            <div class="feature">
              <h3>✓ Gestão de Clientes</h3>
              <p>Leads e clientes organizados</p>
            </div>
            <div class="feature">
              <h3>✓ Controle de Imóveis</h3>
              <p>Cadastro completo de propriedades</p>
            </div>
            <div class="feature">
              <h3>✓ Agenda de Visitas</h3>
              <p>Organize visitas por corretor</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .logo {
      padding: 2rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo h2 {
      margin: 0;
      font-size: 1.3rem;
    }

    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }

    .nav-menu li a {
      display: block;
      padding: 1rem 1.5rem;
      color: white;
      text-decoration: none;
      transition: background 0.3s;
    }

    .nav-menu li a:hover,
    .nav-menu li a.active {
      background: rgba(255,255,255,0.1);
    }

    .user-info {
      padding: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .user-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .user-role {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 1rem;
      text-transform: uppercase;
    }

    .btn-logout {
      width: 100%;
      padding: 0.5rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-logout:hover {
      background: #c0392b;
    }

    .main-content {
      flex: 1;
      background: #f5f5f5;
      overflow-y: auto;
    }

    .header {
      background: white;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 2rem;
      color: #2c3e50;
    }

    .stat-content p {
      margin: 0.25rem 0 0 0;
      color: #7f8c8d;
    }

    .welcome-section {
      margin: 2rem;
      padding: 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .welcome-section h2 {
      color: #2c3e50;
      margin-top: 0;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .feature {
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .feature h3 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1rem;
    }

    .feature p {
      margin: 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats = {
    clients: 0,
    properties: 0,
    visits: 0,
    deals: 0
  };

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

  logout() {
    this.authService.signOut();
  }
}
