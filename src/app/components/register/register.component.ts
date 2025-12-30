import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>CRM Imobiliário</h1>
        <h2>Cadastro</h2>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="companyName">Nome da Imobiliária</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              [(ngModel)]="companyName"
              required
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="name">Seu Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="name"
              required
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              class="form-control"
            >
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button type="submit" [disabled]="!registerForm.form.valid || loading" class="btn-primary">
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
        </form>

        <div class="login-link">
          Já tem conta? <a routerLink="/login">Faça login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .register-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
      font-size: 1.3rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      color: #dc3545;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8d7da;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .success-message {
      color: #28a745;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #d4edda;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .login-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  companyName = '';
  name = '';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Note: In a real implementation, you would first create the company
      // then create the user with company_id. This is a simplified version.
      const { error } = await this.authService.signUp(this.email, this.password, {
        name: this.name,
        company_id: '', // Would be set after creating company
        role: 'admin'
      });
      
      if (error) {
        this.errorMessage = error.message || 'Erro ao criar conta';
      } else {
        this.successMessage = 'Conta criada com sucesso! Verifique seu email.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } catch (error: any) {
      this.errorMessage = 'Erro ao criar conta. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
