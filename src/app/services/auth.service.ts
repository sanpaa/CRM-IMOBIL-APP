import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

interface AuthMessage {
  type: 'LOGIN' | 'LOGOUT' | 'SESSION_INVALID';
  user?: User | null;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private broadcastChannel: BroadcastChannel | null = null;
  private sessionLock = false;
  private tokenExpirationTimer: any = null;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.initializeCrossTabSync();
    this.checkStoredSession();
    this.setupStorageListener();
  }

  /**
   * Inicializa comunicação entre abas usando BroadcastChannel
   */
  private initializeCrossTabSync() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('auth_channel');
        
        this.broadcastChannel.onmessage = (event: MessageEvent<AuthMessage>) => {
          console.log('📡 Mensagem recebida de outra aba:', event.data.type);
          
          switch (event.data.type) {
            case 'LOGIN':
              if (event.data.user) {
                this.currentUserSubject.next(event.data.user);
                console.log('✅ Sessão sincronizada: usuário logado em outra aba');
              }
              break;
            case 'LOGOUT':
              this.handleLogoutFromAnotherTab();
              break;
            case 'SESSION_INVALID':
              this.handleInvalidSessionFromAnotherTab();
              break;
          }
        };
        
        console.log('✅ Sincronização entre abas inicializada');
      } else {
        console.warn('⚠️ BroadcastChannel não disponível neste navegador');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar BroadcastChannel:', error);
    }
  }

  /**
   * Configura listener para mudanças no localStorage (fallback para navegadores antigos)
   */
  private setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'currentUser') {
        if (event.newValue === null) {
          // Logout detectado em outra aba
          console.log('📡 Logout detectado via storage event');
          this.handleLogoutFromAnotherTab();
        } else if (event.newValue && !this.currentUserSubject.value) {
          // Login detectado em outra aba
          try {
            const user = JSON.parse(event.newValue);
            if (this.isValidCompanyId(user.company_id)) {
              console.log('📡 Login detectado via storage event');
              this.currentUserSubject.next(user);
            }
          } catch (error) {
            console.error('❌ Erro ao processar storage event:', error);
          }
        }
      }
    });
  }

  /**
   * Trata logout iniciado em outra aba
   */
  private handleLogoutFromAnotherTab() {
    this.currentUserSubject.next(null);
    this.clearTokenExpirationTimer();
    
    // Redireciona apenas se não estiver já na página de login
    if (this.router.url !== '/login') {
      console.log('🔄 Redirecionando para login devido a logout em outra aba');
      this.router.navigate(['/login']);
    }
  }

  /**
   * Trata sessão inválida detectada em outra aba
   */
  private handleInvalidSessionFromAnotherTab() {
    console.warn('⚠️ Sessão inválida detectada em outra aba');
    this.clearSession();
    
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Envia mensagem para outras abas
   */
  private broadcastAuthMessage(message: AuthMessage) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
        console.log('📡 Mensagem enviada para outras abas:', message.type);
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem para outras abas:', error);
      }
    }
  }

  /**
   * Verifica sessão armazenada com validação de token
   */
  private checkStoredSession() {
    // Previne condições de corrida entre múltiplas abas
    if (this.sessionLock) {
      console.log('⏳ Aguardando liberação do lock de sessão...');
      return;
    }

    this.sessionLock = true;

    try {
      const storedUser = localStorage.getItem('currentUser');
      const authToken = localStorage.getItem('auth_token');
      
      if (storedUser && authToken) {
        const user = JSON.parse(storedUser);
        
        // Validate that user has a valid company_id
        if (user && this.isValidCompanyId(user.company_id)) {
          // Verifica se o token não expirou
          if (this.isTokenExpired(authToken)) {
            console.warn('⚠️ Token expirado detectado. Limpando sessão...');
            this.clearSession();
            this.broadcastAuthMessage({ type: 'SESSION_INVALID', timestamp: Date.now() });
          } else {
            this.currentUserSubject.next(user);
            this.setupTokenExpiration(authToken);
            console.log('✅ Sessão restaurada do localStorage');
          }
        } else {
          // Clear invalid session
          console.warn('⚠️ Sessão inválida detectada (company_id ausente). Limpando localStorage...');
          this.clearSession();
          this.broadcastAuthMessage({ type: 'SESSION_INVALID', timestamp: Date.now() });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sessão armazenada:', error);
      this.clearSession();
    } finally {
      this.sessionLock = false;
    }
  }

  /**
   * Limpa dados da sessão
   */
  private clearSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('company_id');
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.clearTokenExpirationTimer();
  }

  /**
   * Verifica se o token JWT expirou
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Valida estrutura do token
      if (!token || typeof token !== 'string') {
        console.warn('⚠️ Token inválido: não é uma string');
        return true; // Token inválido é considerado expirado
      }

      const parts = token.split('.');
      // Se não é JWT (não tem 3 partes), aceita como token simples sem expiração
      if (parts.length !== 3) {
        console.log('ℹ️ Token não-JWT detectado (token simples sem expiração)');
        return false; // Token simples é válido (backend gerencia expiração)
      }

      // Decodifica o payload do JWT (parte do meio)
      const payload = JSON.parse(atob(parts[1]));
      
      if (!payload.exp) {
        console.warn('⚠️ Token JWT não possui campo de expiração');
        return false; // Se não tem expiração, considera válido
      }
      
      // exp está em segundos, Date.now() em milissegundos
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const isExpired = currentTime >= expirationTime;
      
      if (isExpired) {
        console.warn('⚠️ Token JWT expirou em:', new Date(expirationTime).toISOString());
      }
      
      return isExpired;
    } catch (error) {
      console.error('❌ Erro ao verificar expiração do token:', error);
      // Em caso de erro ao parsear JWT, considera o token expirado por segurança
      return true;
    }
  }

  /**
   * Configura timer para expiração automática do token
   */
  private setupTokenExpiration(token: string) {
    this.clearTokenExpirationTimer();
    
    try {
      // Valida estrutura do token
      if (!token || typeof token !== 'string') {
        console.warn('⚠️ Token inválido para configurar expiração');
        return;
      }

      const parts = token.split('.');
      // Se não é JWT (não tem 3 partes), não configura expiração automática
      if (parts.length !== 3) {
        console.log('ℹ️ Token não-JWT detectado - expiração gerenciada pelo backend');
        return; // Backend gerencia a expiração para tokens simples
      }

      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp) {
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Limite máximo de 24 horas para o timeout (JavaScript setTimeout tem limite de ~24.8 dias)
        const MAX_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas em ms
        
        if (timeUntilExpiration > 0) {
          const actualTimeout = Math.min(timeUntilExpiration, MAX_TIMEOUT);
          console.log(`⏰ Token JWT expira em ${Math.round(timeUntilExpiration / 1000 / 60)} minutos`);
          
          this.tokenExpirationTimer = setTimeout(() => {
            console.warn('⏰ Token JWT expirou! Fazendo logout automático...');
            this.signOut();
            this.broadcastAuthMessage({ type: 'SESSION_INVALID', timestamp: Date.now() });
          }, actualTimeout);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao configurar timer de expiração:', error);
    }
  }

  /**
   * Limpa timer de expiração do token
   */
  private clearTokenExpirationTimer() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
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


  /**
   * Processa resposta do backend de login
   */
  private async processLoginResponse(response: Response): Promise<{ 
    data: { token: string; user: any } | null; 
    error: { message: string } | null 
  }> {
    try {
      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Email ou senha inválidos';
        console.error('❌ Backend login error:', errorMessage);
        return { data: null, error: { message: errorMessage } };
      }

      if (result.error) {
        console.error('❌ Backend login error:', result.error);
        return { data: null, error: { message: result.error || 'Email ou senha inválidos' } };
      }

      if (!result.token || !result.user) {
        console.error('❌ Backend não retornou token ou usuário');
        return { data: null, error: { message: 'Erro ao receber token do servidor' } };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      return { data: null, error: { message: 'Erro ao processar resposta do servidor' } };
    }
  }

  async signIn(email: string, password: string) {
    try {
      console.log('🔐 Chamando backend login:', `${environment.apiUrl}/auth/login`);
      console.log('📧 Email/Username:', email);
      console.log('🔑 Password length:', password.length);
      
      // Previne múltiplos logins simultâneos
      if (this.sessionLock) {
        console.warn('⚠️ Login já em andamento, aguarde...');
        return { data: null, error: { message: 'Login já em andamento' } };
      }

      this.sessionLock = true;
      
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

      // Processa resposta
      const { data: result, error } = await this.processLoginResponse(response);
      if (error || !result) {
        return { data: null, error: error || { message: 'Erro desconhecido ao processar resposta' } };
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
      this.setupTokenExpiration(result.token);
      
      // Notifica outras abas sobre o login
      this.broadcastAuthMessage({ 
        type: 'LOGIN', 
        user: result.user as User, 
        timestamp: Date.now() 
      });

      return { data: result.user, error: null };
    } catch (error: any) {
      console.error('❌ Erro ao fazer login:', error);
      // Não expõe detalhes internos do erro ao usuário
      return { data: null, error: { message: 'Erro ao conectar com o servidor. Tente novamente.' } };
    } finally {
      this.sessionLock = false;
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
      this.clearSession();
      
      // Notifica outras abas sobre o logout
      this.broadcastAuthMessage({ type: 'LOGOUT', timestamp: Date.now() });
      
      this.router.navigate(['/login']);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  /**
   * Verifica se a sessão atual ainda é válida
   * Útil para validação no guard e em componentes
   */
  async validateSession(): Promise<boolean> {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      console.warn('⚠️ Sessão inválida: token ou usuário ausente');
      return false;
    }
    
    if (this.isTokenExpired(token)) {
      console.warn('⚠️ Sessão inválida: token expirado');
      this.clearSession();
      this.broadcastAuthMessage({ type: 'SESSION_INVALID', timestamp: Date.now() });
      return false;
    }
    
    if (!this.isValidCompanyId(user.company_id)) {
      console.warn('⚠️ Sessão inválida: company_id inválido');
      this.clearSession();
      this.broadcastAuthMessage({ type: 'SESSION_INVALID', timestamp: Date.now() });
      return false;
    }
    
    return true;
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
