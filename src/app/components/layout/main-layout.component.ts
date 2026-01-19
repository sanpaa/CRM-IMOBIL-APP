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
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" *ngIf="!sidebarOpen">
        <i class="bi bi-list"></i>
      </button>

      <!-- Sidebar Overlay for Mobile -->
      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="closeMobileMenu()"></div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.sidebar-open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-mark">
              <i class="bi bi-buildings"></i>
            </div>
            <div class="logo-text">
              <h2>HSP CRM</h2>
              <p>Gestão Imobiliária</p>
            </div>
          </div>
          <button class="theme-toggle" (click)="toggleTheme()" aria-label="Alternar tema">
            <i class="bi" [class.bi-moon-stars]="!isDarkTheme" [class.bi-sun]="isDarkTheme"></i>
          </button>
          <button class="mobile-close-btn" (click)="closeMobileMenu()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-speedometer2"></i>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/clients" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-people"></i>
            <span class="nav-label">Clientes</span>
          </a>
          <a routerLink="/properties" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-house-door"></i>
            <span class="nav-label">Imóveis</span>
          </a>
          <a routerLink="/owners" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-person-badge"></i>
            <span class="nav-label">Proprietários</span>
          </a>
          <a routerLink="/visits" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-calendar-check"></i>
            <span class="nav-label">Agenda</span>
          </a>
          <a routerLink="/deals" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-briefcase"></i>
            <span class="nav-label">Negócios</span>
          </a>

          <div class="nav-section-label">Configuração</div>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-gear"></i>
            <span class="nav-label">Configurações</span>
          </a>
          <a routerLink="/website-builder" routerLinkActive="active" class="nav-item" *ngIf="isAdmin()" (click)="closeMobileMenu()">
            <i class="bi bi-globe"></i>
            <span class="nav-label">Site Público</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-card" *ngIf="currentUser">
            <div class="user-section">
              <div class="user-avatar">
                {{ getUserInitials(currentUser.name) }}
              </div>
              <div class="user-details">
                <div class="user-role">{{ getRoleLabel(currentUser.role) }}</div>
                <div class="user-name">{{ currentUser.name }}</div>
              </div>
            </div>
            <div class="user-card-divider"></div>
            <button (click)="logout()" class="btn-logout">
              <i class="bi bi-box-arrow-right"></i>
              <span>Sair</span>
            </button>
          </div>

          <div class="company-info" *ngIf="company">
            <i class="bi bi-building-fill"></i>
            <div class="company-details">
              <div class="company-name">{{ company.name }}</div>
              <div class="company-role">Corretor de Imóveis</div>
              <div class="company-label">Empresa</div>
            </div>
          </div>
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
      background: var(--color-bg-primary);
    }

    /* Mobile Menu Toggle Button */
    .mobile-menu-toggle {
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 999;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0.75rem;
      cursor: pointer;
      display: none;
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
    }

    .mobile-menu-toggle i {
      font-size: 1.5rem;
      display: block;
    }

    .mobile-menu-toggle:hover {
      background: var(--color-primary-dark);
      box-shadow: var(--shadow-lg);
    }

    /* Sidebar Overlay for Mobile */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.4);
      z-index: 1001;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .sidebar {
      width: 260px;
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      left: 0;
      top: 0;
      box-shadow: 6px 0 24px rgba(15, 23, 42, 0.08);
      border-right: 1px solid var(--color-border-light);
      z-index: 1002;
      transition: transform 0.3s ease;
    }

    .mobile-close-btn {
      display: none;
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .logo-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
    }

    .logo-mark i {
      font-size: 1.1rem;
    }

    .logo-text h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1.2;
      letter-spacing: 0.2px;
    }

    .logo-text p {
      margin: 0;
      font-size: 0.72rem;
      color: var(--color-text-tertiary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.18em;
    }

    .theme-toggle {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--color-border-light);
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.75rem 0.5rem 1rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.9rem;
      margin: 0.15rem 0.5rem;
      border-radius: 10px;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
      font-weight: 600;
    }

    .nav-item i {
      font-size: 1.1rem;
      width: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-tertiary);
    }

    .nav-item:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .nav-item.active {
      background: var(--color-selection-bg);
      color: var(--color-selection-text);
      font-weight: 600;
    }

    .nav-item.active i {
      color: var(--color-selection-text);
    }

    .nav-label {
      font-size: 0.9rem;
    }

    .nav-section-label {
      margin: 0.9rem 1rem 0.4rem;
      font-size: 0.6rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--color-text-tertiary);
      font-weight: 700;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--color-border-light);
      background: var(--color-bg-secondary);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .user-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-light);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      padding: 0.75rem;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--color-bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: var(--color-text-secondary);
      flex-shrink: 0;
      box-shadow: 0 4px 8px rgba(15, 23, 42, 0.12);
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-role {
      font-size: 0.65rem;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.12em;
      margin-bottom: 0.2rem;
    }

    .user-card-divider {
      height: 1px;
      background: var(--color-border-light);
      margin: 0.75rem 0;
    }

    .company-info {
      padding: 0.75rem;
      background: var(--color-bg-tertiary);
      border-radius: 10px;
      border: 1px solid var(--color-border-light);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-sm);
    }

    .company-info i {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-bg-secondary);
      color: var(--color-text-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .company-details {
      flex: 1;
      min-width: 0;
    }

    .company-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-text-primary);
      margin-bottom: 0.15rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .company-role {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.2rem;
    }

    .company-label {
      font-size: 0.7rem;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }

    .btn-logout {
      width: 100%;
      padding: 0.65rem;
      background: transparent;
      color: #EF4444;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .btn-logout i {
      font-size: 1.2rem;
    }

    .main-content {
      margin-left: 260px;
      flex: 1;
      min-height: 100vh;
      background: var(--color-bg-primary);
      transition: margin-left 0.3s ease;
    }

    /* Responsive Design for Tablets and Mobile */
    @media (max-width: 1024px) {
      .mobile-menu-toggle {
        display: block;
      }

      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.sidebar-open {
        transform: translateX(0);
      }

      .sidebar-overlay {
        display: block;
      }

      .mobile-close-btn {
        display: block;
      }

      .main-content {
        margin-left: 0;
      }
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 260px;
      }

      .logo-text h2 {
        font-size: 1.1rem;
      }

      .nav-label {
        font-size: 0.9rem;
      }

      .mobile-menu-toggle {
        top: 0.75rem;
        left: 0.75rem;
        padding: 0.625rem;
      }

      .mobile-menu-toggle i {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 85%;
        max-width: 300px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  company: Company | null = null;
  sidebarOpen = false;
  isDarkTheme = false;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.applyInitialTheme();
    this.authService.currentUser$.subscribe(async user => {
      this.currentUser = user;
      if (user && user.company_id) {
        this.company = await this.companyService.getById(user.company_id);
      }
    });
  }

  toggleMobileMenu() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeMobileMenu() {
    this.sidebarOpen = false;
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

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.setTheme(this.isDarkTheme ? 'dark' : 'light');
  }

  private applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.isDarkTheme = savedTheme === 'dark';
    } else {
      this.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.setTheme(this.isDarkTheme ? 'dark' : 'light');
  }

  private setTheme(theme: 'light' | 'dark') {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}
