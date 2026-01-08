import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

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
  ): Promise<boolean | UrlTree> {
    // Verifica se o usuário está autenticado
    if (!this.authService.isAuthenticated()) {
      console.warn('🚫 AuthGuard: Usuário não autenticado');
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // Valida a sessão (token não expirado, company_id válido, etc.)
    const isValid = await this.authService.validateSession();
    
    if (!isValid) {
      console.warn('🚫 AuthGuard: Sessão inválida');
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    console.log('✅ AuthGuard: Acesso permitido');
    return true;
  }
}
