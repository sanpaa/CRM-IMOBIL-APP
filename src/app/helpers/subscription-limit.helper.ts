import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';
import { PopupService } from '../shared/services/popup.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LimitCheckResult {
  allowed: boolean;
  message?: string;
  current?: number;
  max?: number | string;
}

/**
 * Helper service to validate subscription limits before performing actions
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionLimitHelper {
  constructor(
    private subscriptionService: SubscriptionService,
    private router: Router,
    private popupService: PopupService
  ) {}

  /**
   * Check if user can create a new user
   * Shows alert and redirects if limit is reached
   */
  checkCanAddUser(): Observable<LimitCheckResult> {
    return this.subscriptionService.getUsageStats().pipe(
      map(response => {
        if (response.success && response.stats) {
          const { users } = response.stats;
          
          if (users.current >= users.max) {
            return {
              allowed: false,
              message: `Limite de usuários atingido! Você está usando ${users.current} de ${users.max} usuários. Faça upgrade do seu plano para adicionar mais usuários.`,
              current: users.current,
              max: users.max
            };
          }

          // Warn if approaching limit (>= 90%)
          if (users.percentage >= 90) {
            return {
              allowed: true,
              message: `⚠️ Atenção: Você está usando ${users.current} de ${users.max} usuários (${users.percentage}%). Considere fazer upgrade em breve.`,
              current: users.current,
              max: users.max
            };
          }

          return {
            allowed: true,
            current: users.current,
            max: users.max
          };
        }

        // Allow if can't check (graceful degradation)
        return { allowed: true };
      }),
      catchError(err => {
        console.error('Error checking user limit:', err);
        // Allow in case of error (graceful degradation)
        return of({ allowed: true });
      })
    );
  }

  /**
   * Check if user can create a new property
   * Shows alert and redirects if limit is reached
   */
  checkCanAddProperty(): Observable<LimitCheckResult> {
    return this.subscriptionService.getUsageStats().pipe(
      map(response => {
        if (response.success && response.stats) {
          const { properties } = response.stats;
          
          // Unlimited properties
          if (properties.max === 'unlimited') {
            return {
              allowed: true,
              current: properties.current,
              max: 'unlimited'
            };
          }

          const maxNum = properties.max as number;
          
          if (properties.current >= maxNum) {
            return {
              allowed: false,
              message: `Limite de imóveis atingido! Você está usando ${properties.current} de ${maxNum} imóveis. Faça upgrade do seu plano para adicionar mais imóveis.`,
              current: properties.current,
              max: maxNum
            };
          }

          // Warn if approaching limit (>= 90%)
          if (properties.percentage >= 90) {
            return {
              allowed: true,
              message: `⚠️ Atenção: Você está usando ${properties.current} de ${maxNum} imóveis (${properties.percentage}%). Considere fazer upgrade em breve.`,
              current: properties.current,
              max: maxNum
            };
          }

          return {
            allowed: true,
            current: properties.current,
            max: maxNum
          };
        }

        // Allow if can't check (graceful degradation)
        return { allowed: true };
      }),
      catchError(err => {
        console.error('Error checking property limit:', err);
        // Allow in case of error (graceful degradation)
        return of({ allowed: true });
      })
    );
  }

  /**
   * Validate user creation and show alerts
   * Returns true if allowed, false if blocked
   */
  async validateUserCreation(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkCanAddUser().subscribe(result => {
        if (!result.allowed) {
          // Block and show error
          this.popupService.confirm(
            `${result.message}\n\n` +
            'Deseja ir para a página de planos para fazer upgrade?',
            {
              title: 'Limite do plano',
              confirmText: 'Ver planos',
              cancelText: 'Agora não',
              tone: 'warning'
            }
          ).then(confirmed => {
            if (confirmed) {
              this.router.navigate(['/subscription']);
            }
          });
          resolve(false);
        } else {
          // Allow but show warning if applicable
          if (result.message) {
            this.popupService.alert(result.message, { title: 'Aviso', tone: 'warning' });
          }
          resolve(true);
        }
      });
    });
  }

  /**
   * Validate property creation and show alerts
   * Returns true if allowed, false if blocked
   */
  async validatePropertyCreation(): Promise<boolean> {
    return new Promise((resolve) => {
      this.checkCanAddProperty().subscribe(result => {
        if (!result.allowed) {
          // Block and show error
          this.popupService.confirm(
            `${result.message}\n\n` +
            'Deseja ir para a página de planos para fazer upgrade?',
            {
              title: 'Limite do plano',
              confirmText: 'Ver planos',
              cancelText: 'Agora não',
              tone: 'warning'
            }
          ).then(confirmed => {
            if (confirmed) {
              this.router.navigate(['/subscription']);
            }
          });
          resolve(false);
        } else {
          // Allow but show warning if applicable
          if (result.message) {
            this.popupService.alert(result.message, { title: 'Aviso', tone: 'warning' });
          }
          resolve(true);
        }
      });
    });
  }
}
