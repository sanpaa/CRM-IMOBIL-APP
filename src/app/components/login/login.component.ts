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
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <i class="bi bi-building"></i>
          <h1>CRM Imobiliário</h1>
        </div>
        <h2>Acesse sua conta</h2>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email" class="form-label">
              <i class="bi bi-envelope"></i>
              Email
            </label>
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

          <div class="form-group">
            <label for="password" class="form-label">
              <i class="bi bi-lock"></i>
              Senha
            </label>
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
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
      padding: 1rem;
    }

    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 420px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .logo-section i {
      font-size: 3rem;
      color: #1F2937;
      margin-bottom: 0.5rem;
    }

    .logo-section h1 {
      color: #1F2937;
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
    }

    h2 {
      text-align: center;
      color: #374151;
      margin-bottom: 2rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-label i {
      color: #6B7280;
    }

    .btn-primary {
      margin-top: 0.5rem;
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #6B7280;
      font-size: 0.95rem;
    }

    .register-link a {
      color: #1F2937;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 2rem 1.5rem;
      }

      .logo-section i {
        font-size: 2.5rem;
      }

      .logo-section h1 {
        font-size: 1.5rem;
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
