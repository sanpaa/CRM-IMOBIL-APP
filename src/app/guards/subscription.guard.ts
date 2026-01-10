import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard para verificar acesso a features baseado no plano de assinatura
 * 
 * Uso:
 * {
 *   path: 'feature',
 *   component: FeatureComponent,
 *   canActivate: [subscriptionGuard('feature_name')]
 * }
 */
export function subscriptionGuard(requiredFeature?: string): CanActivateFn {
  return () => {
    const subscriptionService = inject(SubscriptionService);
    const router = inject(Router);

    // Se não há feature requerida, permite acesso
    if (!requiredFeature) {
      return true;
    }

    return subscriptionService.checkFeatureAccess(requiredFeature).pipe(
      map(response => {
        if (response.success && response.hasAccess) {
          return true;
        } else {
          // Exibe alerta e redireciona para página de assinatura
          alert(
            `Recurso '${requiredFeature}' não disponível no seu plano ${response.planName}.\n` +
            'Faça upgrade para ter acesso a este recurso!'
          );
          router.navigate(['/subscription']);
          return false;
        }
      }),
      catchError(err => {
        console.error('Error checking feature access:', err);
        // Graceful degradation: permite acesso em caso de erro
        // para não bloquear usuários por problemas temporários
        return of(true);
      })
    );
  };
}
