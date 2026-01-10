import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionService, UsageStats } from '../../services/subscription.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-usage-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="usage-widget" *ngIf="stats && !loading">
      <div class="widget-header">
        <h3>
          <i class="bi bi-speedometer2"></i>
          Uso do Plano
        </h3>
        <span class="plan-badge">{{ stats.plan.toUpperCase() }}</span>
      </div>
      
      <div class="usage-items">
        <div class="usage-item">
          <div class="usage-label">
            <i class="bi bi-people-fill"></i>
            <span>Usuários</span>
          </div>
          <div class="usage-value" [class.warning]="stats.users.percentage >= 90">
            {{ stats.users.current }}/{{ stats.users.max }}
          </div>
          <div class="usage-bar">
            <div 
              class="usage-fill" 
              [style.width.%]="stats.users.percentage"
              [class.warning]="stats.users.percentage >= 90"
              [class.danger]="stats.users.percentage >= 100">
            </div>
          </div>
        </div>

        <div class="usage-item">
          <div class="usage-label">
            <i class="bi bi-house-door-fill"></i>
            <span>Imóveis</span>
          </div>
          <div class="usage-value" [class.warning]="stats.properties.percentage >= 90 && stats.properties.max !== 'unlimited'">
            {{ stats.properties.current }}/{{ stats.properties.max === 'unlimited' ? '∞' : stats.properties.max }}
          </div>
          <div class="usage-bar" *ngIf="stats.properties.max !== 'unlimited'">
            <div 
              class="usage-fill" 
              [style.width.%]="stats.properties.percentage"
              [class.warning]="stats.properties.percentage >= 90"
              [class.danger]="stats.properties.percentage >= 100">
            </div>
          </div>
          <div class="unlimited-badge" *ngIf="stats.properties.max === 'unlimited'">
            <i class="bi bi-infinity"></i> Ilimitado
          </div>
        </div>
      </div>

      <div class="widget-footer">
        <a routerLink="/subscription" class="link-manage">
          <i class="bi bi-gear-fill"></i>
          Gerenciar Plano
        </a>
      </div>
    </div>

    <div class="usage-widget skeleton" *ngIf="loading">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>

    <div class="usage-widget error" *ngIf="error && !loading">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <p>Erro ao carregar uso do plano</p>
    </div>
  `,
  styles: [`
    .usage-widget {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid #e0e0e0;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .widget-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .plan-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .usage-items {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .usage-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .usage-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: #666;
    }

    .usage-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #333;
      transition: color 0.3s ease;
    }

    .usage-value.warning {
      color: #ff9800;
    }

    .usage-bar {
      width: 100%;
      height: 8px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .usage-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
      border-radius: 10px;
      transition: width 0.5s ease, background 0.3s ease;
    }

    .usage-fill.warning {
      background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
    }

    .usage-fill.danger {
      background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);
    }

    .unlimited-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #4CAF50;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .widget-footer {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f0f0f0;
    }

    .link-manage {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: color 0.2s ease;
    }

    .link-manage:hover {
      color: #5568d3;
      text-decoration: underline;
    }

    /* Loading skeleton */
    .usage-widget.skeleton {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skeleton-line {
      height: 20px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Error state */
    .usage-widget.error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #f44336;
      padding: 2rem;
    }

    .usage-widget.error i {
      font-size: 2rem;
    }

    @media (max-width: 768px) {
      .usage-widget {
        padding: 1rem;
      }

      .widget-header h3 {
        font-size: 1rem;
      }

      .usage-value {
        font-size: 1.1rem;
      }
    }
  `]
})
export class UsageWidgetComponent implements OnInit, OnDestroy {
  stats: UsageStats | null = null;
  loading = true;
  error = false;
  private refreshSubscription?: Subscription;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit() {
    this.loadStats();
    // Atualizar a cada 5 minutos
    this.refreshSubscription = interval(5 * 60 * 1000)
      .pipe(switchMap(() => this.subscriptionService.getUsageStats()))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stats = response.stats;
          }
        },
        error: (err) => {
          console.error('Error refreshing usage stats:', err);
        }
      });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadStats() {
    this.loading = true;
    this.error = false;

    this.subscriptionService.getUsageStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.stats;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading usage stats:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
