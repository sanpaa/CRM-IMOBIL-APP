import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-shell">
      <div class="login-visual">
        <div class="visual-content">
          <span class="visual-kicker">HSP TECH</span>
          <h1>Gestão imobiliária mais inteligente</h1>
          <p>Centralize clientes, visitas e negócios em um painel limpo e objetivo.</p>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-card">
          <div class="logo-section">
            <img src="/assets/logo.png" alt="HSP CRM" class="logo-image">
            <h1>HSP CRM</h1>
            <p>Sistema de Gestão Imobiliário</p>
          </div>
          <h2>Acesse sua conta</h2>
          
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <div class="input-wrapper">
                <i class="bi bi-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  email
                  class="form-control"
                  placeholder="seu@email.com"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Senha</label>
              <div class="input-wrapper">
                <i class="bi bi-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  [(ngModel)]="password"
                  required
                  class="form-control"
                  placeholder="Digite sua senha"
                >
              </div>
            </div>

            <div class="alert alert-danger" *ngIf="errorMessage">
              <i class="bi bi-exclamation-triangle"></i>
              {{ errorMessage }}
            </div>

            <button type="submit" [disabled]="!loginForm.form.valid || loading" class="btn btn-primary btn-lg">
              <span *ngIf="!loading">
                <i class="bi bi-box-arrow-in-right"></i>
                Entrar
              </span>
              <span *ngIf="loading" class="d-flex align-items-center justify-content-center">
                <span class="spinner"></span>
                Entrando...
              </span>
            </button>
          </form>

          <div class="register-link">
            Não tem conta? <a routerLink="/register">Cadastre-se</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;
      background: var(--color-bg-primary);
    }

    .login-visual {
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: 3rem;
      color: #fff;
      background-image:
        linear-gradient(135deg, rgba(29, 78, 216, 0.85), rgba(29, 78, 216, 0.35)),
        url('/assets/login-hero.jpg');
      background-size: cover;
      background-position: center;
    }

    .visual-content {
      max-width: 420px;
    }

    .visual-kicker {
      display: inline-block;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.18);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }

    .login-visual h1 {
      margin: 0 0 1rem 0;
      font-size: 2.6rem;
      font-weight: 700;
      color: #fff;
    }

    .login-visual p {
      margin: 0;
      font-size: 1.05rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
    }

    .login-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
    }

    .login-card {
      background: var(--color-bg-secondary);
      padding: 2.75rem;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 420px;
      border: 1px solid var(--color-border-light);
    }

    .logo-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .logo-section .logo-image {
      width: 84px;
      height: 84px;
      object-fit: contain;
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    .logo-section h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .logo-section p {
      margin: 0.35rem 0 0 0;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    h2 {
      text-align: center;
      color: var(--color-text-secondary);
      margin-bottom: 2rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper i {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-tertiary);
      font-size: 1rem;
      pointer-events: none;
    }

    .input-wrapper .form-control {
      padding-left: 2.6rem;
    }

    .btn-primary {
      margin-top: 0.5rem;
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }

    .register-link a {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 1024px) {
      .login-shell {
        grid-template-columns: 1fr;
      }

      .login-visual {
        min-height: 260px;
        align-items: center;
      }

      .login-panel {
        padding: 2.5rem 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 2rem 1.5rem;
      }

      .login-visual h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const { error } = await this.authService.signIn(this.email, this.password);
      
      if (error) {
        this.errorMessage = error.message || 'Email ou senha inválidos';
        console.error('❌ Erro no login:', this.errorMessage);
      } else {
        console.log('✅ Login realizado com sucesso');
        this.router.navigate(['/welcome']);
      }
    } catch (error: any) {
      this.errorMessage = error?.message || 'Erro ao fazer login. Tente novamente.';
      console.error('❌ Erro inesperado no login:', error);
    } finally {
      this.loading = false;
    }
  }
}
