import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { User } from '../../models/user.model';
import { Company } from '../../models/company.model';
import { NotificationCenterComponent } from '../../shared/components/notification-center.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, NotificationCenterComponent],
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
            <i class="bi bi-building"></i>
            <div class="logo-text">
              <h2>CRM Imobiliário</h2>
              <p>Sistema de Gestão</p>
            </div>
          </div>
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
            <span class="nav-label">Visitas</span>
          </a>
          <a routerLink="/deals" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-briefcase"></i>
            <span class="nav-label">Negócios</span>
          </a>
          <a routerLink="/subscription" routerLinkActive="active" class="nav-item nav-item-highlight" (click)="closeMobileMenu()">
            <i class="bi bi-gem"></i>
            <span class="nav-label">Meu Plano</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <i class="bi bi-gear"></i>
            <span class="nav-label">Configurações</span>
          </a>
          <a routerLink="/public-site-settings" routerLinkActive="active" class="nav-item" *ngIf="isAdmin()" (click)="closeMobileMenu()">
            <i class="bi bi-globe"></i>
            <span class="nav-label">Site Público</span>
          </a>
          <a routerLink="/website-builder" routerLinkActive="active" class="nav-item" *ngIf="isAdmin()" (click)="closeMobileMenu()">
            <i class="bi bi-palette"></i>
            <span class="nav-label">Construtor de Sites</span>
          </a>
          <a routerLink="/whatsapp" routerLinkActive="active" class="nav-item" *ngIf="isAdmin()" (click)="closeMobileMenu()">
            <i class="bi bi-whatsapp"></i>
            <span class="nav-label">WhatsApp</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <app-notification-center></app-notification-center>
          
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
            <i class="bi bi-building-fill"></i>
            <div class="company-details">
              <div class="company-name">{{ company.name }}</div>
              <div class="company-label">Empresa</div>
            </div>
          </div>

          <button (click)="logout()" class="btn-logout">
            <i class="bi bi-box-arrow-right"></i>
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
      background: #F5F7FA;
    }

    /* Mobile Menu Toggle Button */
    .mobile-menu-toggle {
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 999;
      background: #1F2937;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem;
      cursor: pointer;
      display: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .mobile-menu-toggle i {
      font-size: 1.5rem;
      display: block;
    }

    .mobile-menu-toggle:hover {
      background: #374151;
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }

    /* Sidebar Overlay for Mobile */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1001;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
      z-index: 1002;
      transition: transform 0.3s ease;
    }

    .mobile-close-btn {
      display: none;
      background: transparent;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .logo i {
      font-size: 2rem;
      color: white;
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

    .nav-item i {
      font-size: 1.25rem;
      width: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
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

    .nav-item-highlight {
      background: linear-gradient(90deg, rgba(147, 51, 234, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%);
      color: rgba(255, 255, 255, 0.95);
    }

    .nav-item-highlight i {
      color: #a78bfa;
    }

    .nav-item-highlight:hover {
      background: linear-gradient(90deg, rgba(147, 51, 234, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
      color: #fff;
    }

    .nav-item-highlight.active {
      background: linear-gradient(90deg, rgba(147, 51, 234, 0.25) 0%, rgba(96, 165, 250, 0.25) 100%);
      color: #a78bfa;
    }

    .nav-item-highlight.active::before {
      background: linear-gradient(180deg, #9333ea 0%, #60a5fa 100%);
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
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
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
      border: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .company-info i {
      font-size: 1.25rem;
      color: #60a5fa;
    }

    .company-details {
      flex: 1;
      min-width: 0;
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

    .btn-logout i {
      font-size: 1.2rem;
    }

    .main-content {
      margin-left: 280px;
      flex: 1;
      min-height: 100vh;
      background: #F5F7FA;
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

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private whatsappService: WhatsAppService, // Injeta para inicializar o serviço
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
}
