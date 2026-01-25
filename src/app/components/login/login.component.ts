import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="bg-slate-50 dark:bg-enterprise-dark h-screen overflow-hidden">
      <div class="flex h-full w-full">
        <div class="hidden lg:flex w-[55%] relative overflow-hidden animate-fade-in">
          <div class="absolute inset-0 z-0 animate-ken-burns-smooth bg-cover bg-center" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3c7-8HG2ABj0fibtO-QDArcHMZacXfoJLtZLr2wZu5tR3Xc3Pp65zj1KoReOmnqO1c4-7mjNayUrh_FxcQ4c0_F-xTvtwwh79dLtiK5U2uRIbZ9XuJP9VMVAWFyFydG8VYiUHrlfEsk7xkQ39sWcOu-s0JNob3dzFBoGnQj2_bx0BM4WQNqqoqvbfY8Z6cf3OUxcjWHT0qH6lPuiFWh-XZSM0dbGnHVG7j760YkW7BNhjy-ztN78WuzQWpBh9HjP6-1MUCrEd6EzI');"></div>
          <div class="absolute inset-0 z-10 dynamic-overlay animate-fluid-gradient"></div>
          <div class="relative z-30 flex flex-col justify-between p-20 w-full text-white">
            <div class="flex items-center gap-3 opacity-0 animate-stagger-in delay-200">
              <div class="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-xl shadow-primary/30">
                <span class="material-symbols-outlined text-white text-3xl">hub</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold tracking-tight leading-none">HSP CRM</h1>
                <p class="text-[10px] uppercase tracking-[0.2em] text-white/60 font-semibold mt-1">Enterprise Solution</p>
              </div>
            </div>
            <div class="max-w-xl">
              <h2 class="text-6xl font-bold leading-tight opacity-0 animate-stagger-in delay-300">
                Excelência em <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-primary/80">Gestão de Ativos.</span>
              </h2>
              <p class="text-xl text-white/70 mt-6 opacity-0 animate-stagger-in delay-400 font-light leading-relaxed">
                A plataforma inteligente da HSP Tech desenhada para o mercado de alto luxo. Tecnologia, confiança e performance em cada transação.
              </p>
              <div class="mt-12 flex items-center gap-4 opacity-0 animate-stagger-in delay-500">
                <div class="flex -space-x-3">
                  <img alt="User" class="w-10 h-10 rounded-full border-2 border-enterprise-dark/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIvNmgHq5g-7Yue9w0lMHD-F_oj9-pNZvhcBJ_UHEMwk2KYhjnInNV85pY7Y09637Kmjj5oMcUO78bto_vdIz6v8V9mALuqO2foKg-18pL6qS0FjmJJinyP0DG_Q_VgF1QfAms04QwLQN-7U0pko9Q_gbshtwIXPxmYf1sciOUeCGQaGOe96OkpwrsSCrfnu0cfLgHUARtBcEd8RPSbYs6DE6HcAnEeSm6kz5I1D_ho-9Tzhu7Tp8kSJk4PVyqCWdFdbf4dyOXz5mB"/>
                  <img alt="User" class="w-10 h-10 rounded-full border-2 border-enterprise-dark/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0RWLsLVqt8kyrDTAduGcMuoJ6GJshT_sd0ZYC5sKQ2qXVoSBgJPd_PjD3PqSsGypYhHJGNfTWtcr4q7dqwB4FaTsKbXvDw24dy-LRkos1_480uzApF35IgJoCy1auaGSPwqTzWqiqV099YiwW2TwoGk7ASOFEnAv9ODXqS0OaQ2scnIG9RPQ-8CQhTcCL7fDbSQK0Ct_w-dkskqMCDcX4VWaaw7zDChAu6C8Y6BCIWZEUqLdGHJfv6nHL4Jx4G2UrdkWhDaqNijXw"/>
                  <img alt="User" class="w-10 h-10 rounded-full border-2 border-enterprise-dark/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCryx-9Bh1uVIpWe5JkyQ2fyGbpObed28yXJFOwInhUwkBjC3Bsbrwauiw7brMviYnkYu9kysy7q0NUXCJXwqHjlNBTtfCZ4NnVD5OCrbPbNxaafKv54FrrrB-hIC-tJ1W4OmSKGgceOglZtquR9sCbDdiMYFQ3tOvA1cUmFvqWIhKOMeHSp9UMhrSxmTDkxzPmGp-cIP47CEBCtPLtFovHtrlV7EzKkTIw84Yw0ZjYXkl9txwT52ZGqiVVUe8MAyeH2d_kh6vhmMJF"/>
                </div>
                <span class="text-sm text-white/60 font-medium">+5000 consultores ativos</span>
              </div>
            </div>
            <div class="text-sm text-white/30 flex gap-8 opacity-0 animate-stagger-in delay-700">
              <span>© 2024 HSP Tech</span>
              <div class="flex gap-4">
                <a class="hover:text-white transition-colors" href="#">Privacidade</a>
                <a class="hover:text-white transition-colors" href="#">Termos de Uso</a>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full lg:w-[45%] flex items-center justify-center p-8 bg-slate-50 dark:bg-enterprise-dark relative overflow-hidden">
          <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-royal-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div class="w-full max-w-[460px] opacity-0 animate-fade-in-up-card delay-300">
            <div class="glass-card p-12 rounded-[2.5rem] relative">
              <div class="mb-12 opacity-0 animate-stagger-in delay-400">
                <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Bem-vindo</h2>
                <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Acesse o ecossistema HSP CRM</p>
              </div>
              <form class="space-y-5" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="opacity-0 animate-stagger-in delay-500">
                  <div class="input-container h-16 flex items-center px-4">
                    <span class="material-symbols-outlined text-slate-400 mr-3">alternate_email</span>
                    <div class="relative flex-1 h-full">
                      <input class="floating-input w-full h-full pt-4 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white text-base outline-none"
                             id="email"
                             placeholder=" "
                             required
                             type="email"
                             formControlName="email"/>
                      <label class="floating-label" for="email">E-mail corporativo</label>
                    </div>
                  </div>
                </div>
                <div class="opacity-0 animate-stagger-in delay-500" style="animation-delay: 600ms;">
                  <div class="input-container h-16 flex items-center px-4">
                    <span class="material-symbols-outlined text-slate-400 mr-3">lock</span>
                    <div class="relative flex-1 h-full">
                      <input class="floating-input w-full h-full pt-4 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white text-base outline-none"
                             id="password"
                             placeholder=" "
                             required
                             [type]="showPassword ? 'text' : 'password'"
                             formControlName="password"/>
                      <label class="floating-label" for="password">Senha de acesso</label>
                    </div>
                    <button class="p-2 text-slate-400 hover:text-primary transition-colors" type="button" (click)="togglePassword()">
                      <span class="material-symbols-outlined text-xl">visibility</span>
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between px-1 opacity-0 animate-stagger-in delay-700">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input class="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox" formControlName="remember"/>
                    <span class="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Permanecer conectado</span>
                  </label>
                  <a class="text-sm font-semibold text-primary hover:text-royal-blue transition-colors" href="#">Recuperar senha</a>
                </div>
                <div class="pt-4 opacity-0 animate-stagger-in delay-700" style="animation-delay: 800ms;">
                  <button class="w-full h-16 bg-gradient-to-r from-primary to-royal-blue rounded-2xl text-white font-bold flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-500 hover:scale-[1.01] hover:-translate-y-0.5 shadow-xl shadow-primary/20 group" type="submit" [disabled]="loading">
                    <div class="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-[200%] animate-shimmer"></div>
                    <span class="relative z-10 text-lg">Entrar no Sistema</span>
                    <span class="material-symbols-outlined relative z-10 transition-transform duration-300 group-hover:translate-x-1 text-2xl">arrow_right_alt</span>
                  </button>
                </div>
              </form>
              <p class="mt-4 text-sm text-red-500 font-medium" *ngIf="errorMessage">{{ errorMessage }}</p>
              <div class="mt-10 opacity-0 animate-stagger-in delay-700" style="animation-delay: 900ms;">
                <div class="relative flex items-center justify-center mb-6">
                  <div class="absolute w-full border-t border-slate-200 dark:border-slate-800"></div>
                  <span class="relative px-6 bg-white dark:bg-[#111] text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ou acesse com</span>
                </div>
                <button class="w-full flex items-center justify-center gap-3 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300" type="button">
                  <img alt="Google" class="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfy4-D6fQ89ibsv7gqRlwAgBDw0UjcTOMVQow2lmQtzdahcmTRI1GF58HfZXit0cCLlhrI7WPet9TEP4TsQEdhw53XoT_ftjPpT-w_1dcblj0SSvOtlnWmCf1Q-D-KY7mFkTmfhiWhMuJZVnqOQz8ZIDkK-zGqpU_FhPs90XwDItrje5tc7DkFrdXnWTgvFCsV_7cOvbLEyCSlB_6BK8n3Mn4x14I2R9dYDr7CxXTCDndfybRPZyAgX8K3JsePjUs_jpOqIX9wAvvM"/>
                  <span>Google Workspace</span>
                </button>
              </div>
              <p class="mt-10 text-center text-sm text-slate-500 dark:text-slate-400 font-medium opacity-0 animate-stagger-in delay-700" style="animation-delay: 1000ms;">
                Suporte especializado HSP Tech? <a class="text-primary font-bold hover:underline" href="#">Clique aqui</a>
              </p>
            </div>
            <p class="mt-8 text-center text-xs text-slate-400 font-medium opacity-60">
              Acesso restrito para colaboradores e parceiros autorizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `:host { display: contents; }`
  ]
})
export class LoginComponent {
  loading = false;
  errorMessage = '';
  showPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Preencha e-mail e senha válidos.';
      return;
    }
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password } = this.loginForm.getRawValue();
      const { error } = await this.authService.signIn(email || '', password || '');

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
