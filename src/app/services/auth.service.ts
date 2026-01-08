import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.checkStoredSession();
  }

  private checkStoredSession() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Validate that user has a valid company_id
      if (user && this.isValidCompanyId(user.company_id)) {
        this.currentUserSubject.next(user);
      } else {
        // Clear invalid session
        console.warn('⚠️ Sessão inválida detectada (company_id ausente). Limpando localStorage...');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('company_id');
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Obtém o token de autenticação armazenado
   */
  getAuthToken(): string | null {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('✅ Auth token found in localStorage');
        return token;
      }
      console.warn('⚠️ No auth token found');
      return null;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Valida se o company_id é válido (não null, undefined, ou string 'null'/'undefined')
   */
  private isValidCompanyId(companyId: any): boolean {
    return companyId !== null && companyId !== undefined && companyId !== 'null' && companyId !== 'undefined' && companyId !== '';
  }

  /**
   * Valida se uma string de company_id é válida
   * Método público para uso em componentes
   */
  isValidCompanyIdString(companyId: string | null | undefined): boolean {
    return this.isValidCompanyId(companyId);
  }

  /**
   * Obtém o company_id válido do usuário atual
   * @returns company_id válido ou null se inválido
   */
  getValidCompanyId(): string | null {
    const user = this.getCurrentUser();
    if (!user || !this.isValidCompanyId(user.company_id)) {
      return null;
    }
    return user.company_id;
  }


  async signIn(email: string, password: string) {
    try {
      console.log('🔐 Chamando backend login:', `${environment.apiUrl}/auth/login`);
      console.log('📧 Email/Username:', email);
      console.log('🔑 Password length:', password.length);
      
      // Tenta diferentes nomes de campo que o backend pode esperar
      const payload1 = { email, password };
      const payload2 = { username: email, password };
      const payload3 = { user: email, password };
      
      let response = await fetch(`${environment.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload1)
      });

      // Se falhou com email, tenta com username
      if (response.status === 400) {
        console.log('⚠️ Email field não funcionou, tentando username...');
        response = await fetch(`${environment.apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload2)
        });
      }

      // Se falhou com username, tenta com user
      if (response.status === 400) {
        console.log('⚠️ Username field não funcionou, tentando user...');
        response = await fetch(`${environment.apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload3)
        });
      }

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error('❌ Backend login error:', result.error);
        return { data: null, error: { message: result.error || 'Email ou senha inválidos' } };
      }

      if (!result.token || !result.user) {
        console.error('❌ Backend não retornou token ou usuário');
        return { data: null, error: { message: 'Erro ao receber token do servidor' } };
      }

      // Validate company_id
      if (!this.isValidCompanyId(result.user.company_id)) {
        console.error('❌ Usuário não tem company_id válido:', result.user);
        return { 
          data: null, 
          error: { 
            message: 'Erro: Usuário não está associado a nenhuma empresa. Entre em contato com o administrador do sistema.' 
          } 
        };
      }

      // Store token and user from backend
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      localStorage.setItem('company_id', result.user.company_id);
      
      console.log('✅ Token recebido do backend:', result.token.substring(0, 20) + '...');
      console.log('✅ Usuário salvo no localStorage:', result.user.email);
      console.log('✅ Company ID salvo no localStorage:', result.user.company_id);
      
      this.currentUserSubject.next(result.user as User);

      return { data: result.user, error: null };
    } catch (error: any) {
      console.error('❌ Erro ao fazer login:', error);
      return { data: null, error: { message: 'Erro ao conectar com o servidor' } };
    }
  }

  async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          email: email,
          password: password,
          ...userData
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('company_id');
      localStorage.removeItem('auth_token');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(['admin']);
  }

  isGestor(): boolean {
    return this.hasRole(['admin', 'gestor']);
  }

  async resetPassword(email: string) {
    // Implementar lógica customizada de reset
    return { error: null };
  }

  async updatePassword(userId: string, newPassword: string) {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }
}
