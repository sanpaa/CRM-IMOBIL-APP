import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Verifica se o usuário está autenticado
    if (!this.authService.isAuthenticated()) {
      console.warn('🚫 AuthGuard: Usuário não autenticado');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Valida a sessão (token não expirado, company_id válido, etc.)
    const isValid = await this.authService.validateSession();
    
    if (!isValid) {
      console.warn('🚫 AuthGuard: Sessão inválida');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    console.log('✅ AuthGuard: Acesso permitido');
    return true;
  }
}
