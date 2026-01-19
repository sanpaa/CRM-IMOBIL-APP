import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { User } from '../../models/user.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-overlay">
      <div class="welcome-card">
        <div class="welcome-icon">
          <i class="bi bi-check-circle"></i>
        </div>
        
        <h1 class="welcome-title">Bem-vindo, {{ getUserFirstName() }}!</h1>
        
        <div class="company-info" *ngIf="company">
          <div class="company-label">Você está conectado à</div>
          <div class="company-name">{{ company.name }}</div>
        </div>
        
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
        
        <p class="redirect-message">Redirecionando para o dashboard...</p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from {
        transform: translateY(-30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes progressBar {
      from { width: 0%; }
      to { width: 100%; }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .welcome-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    }

    .welcome-card {
      background: var(--color-bg-secondary);
      padding: 3rem 2.5rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 500px;
      width: 90%;
      animation: slideIn 0.5s ease-out;
    }

    .welcome-icon {
      margin-bottom: 1.5rem;
    }

    .welcome-icon i {
      font-size: 4rem;
      color: #059669;
      animation: scaleIn 0.5s ease-out 0.3s both;
    }

    .welcome-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 1.5rem;
      animation: fadeIn 0.6s ease-out 0.5s both;
    }

    .company-info {
      margin-bottom: 2rem;
      padding: 1.25rem;
      background: var(--color-bg-tertiary);
      border-radius: 8px;
      border: 1px solid var(--color-border-light);
      animation: fadeIn 0.6s ease-out 0.7s both;
    }

    .company-label {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .company-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .loading-bar {
      width: 100%;
      height: 4px;
      background: #E5E7EB;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 1rem;
      animation: fadeIn 0.6s ease-out 0.9s both;
    }

    .loading-progress {
      height: 100%;
      background: linear-gradient(90deg, #1F2937 0%, #4B5563 100%);
      border-radius: 2px;
      animation: progressBar 2s ease-in-out;
    }

    .redirect-message {
      font-size: 0.95rem;
      color: #6B7280;
      margin: 0;
      animation: fadeIn 0.6s ease-out 1.1s both;
    }

    @media (max-width: 768px) {
      .welcome-card {
        padding: 2.5rem 1.5rem;
      }

      .welcome-title {
        font-size: 1.5rem;
      }

      .company-name {
        font-size: 1.1rem;
      }
    }
  `]
})
export class WelcomeComponent implements OnInit {
  private readonly REDIRECT_DELAY_MS = 2500;
  currentUser: User | null = null;
  company: Company | null = null;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser() || this.getStoredUser();
    
    if (this.currentUser && this.currentUser.company_id) {
      this.company = await this.companyService.getById(this.currentUser.company_id);
    }

    // Redirect to dashboard after configured delay
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, this.REDIRECT_DELAY_MS);
  }

  getUserFirstName(): string {
    const name = this.currentUser?.name || (this.currentUser as any)?.username;
    if (!name) {
      return 'Usuário';
    }
    return name.split(' ')[0];
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
}
