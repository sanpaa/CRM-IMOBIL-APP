import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { User } from '../../models/user.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout-container">
      <!-- Sidebar - Always visible -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">🏢</div>
            <div class="logo-text">
              <h2>CRM Imobiliário</h2>
              <p>Sistema de Gestão</p>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/clients" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-label">Clientes</span>
          </a>
          <a routerLink="/properties" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">Imóveis</span>
          </a>
          <a routerLink="/owners" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👤</span>
            <span class="nav-label">Proprietários</span>
          </a>
          <a routerLink="/visits" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📅</span>
            <span class="nav-label">Visitas</span>
          </a>
          <a routerLink="/deals" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💼</span>
            <span class="nav-label">Negócios</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Configurações</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-section" *ngIf="currentUser">
            <div class="user-avatar">
              {{ getUserInitials(currentUser.name) }}
            </div>
            <div class="user-details">
              <div class="user-name">{{ currentUser.name }}</div>
              <div class="user-role">{{ getRoleLabel(currentUser.role) }}</div>
            </div>
          </div>
          
          <div class="company-info" *ngIf="company">
            <div class="company-name">{{ company.name }}</div>
            <div class="company-label">Empresa</div>
          </div>

          <button (click)="logout()" class="btn-logout">
            <span class="logout-icon">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .logo-text h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }

    .logo-text p {
      margin: 0;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 400;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
      font-weight: 500;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 0;
      background: #60a5fa;
      transition: height 0.2s ease;
      border-radius: 0 4px 4px 0;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .nav-item:hover::before {
      height: 70%;
    }

    .nav-item.active {
      background: rgba(96, 165, 250, 0.15);
      color: #60a5fa;
      font-weight: 600;
    }

    .nav-item.active::before {
      height: 100%;
      background: #60a5fa;
    }

    .nav-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-label {
      font-size: 0.95rem;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.15);
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }

    .user-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: #fff;
      margin-bottom: 0.15rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-role {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .company-info {
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
      margin-bottom: 0.75rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .company-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #60a5fa;
      margin-bottom: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .company-label {
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .btn-logout {
      width: 100%;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-logout:hover {
      background: rgba(220, 38, 38, 1);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .logout-icon {
      font-size: 1.2rem;
    }

    .main-content {
      margin-left: 280px;
      flex: 1;
      min-height: 100vh;
      background: #f8f9fa;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 240px;
      }

      .main-content {
        margin-left: 240px;
      }

      .logo-text h2 {
        font-size: 1.1rem;
      }

      .nav-label {
        font-size: 0.9rem;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  company: Company | null = null;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.authService.currentUser$.subscribe(async user => {
      this.currentUser = user;
      if (user && user.company_id) {
        this.company = await this.companyService.getById(user.company_id);
      }
    });
  }

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'corretor': 'Corretor'
    };
    return roleLabels[role] || role;
  }

  logout() {
    this.authService.signOut();
  }
}
