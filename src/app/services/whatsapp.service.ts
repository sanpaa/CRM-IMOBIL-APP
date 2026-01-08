import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { WhatsAppConnection, WhatsAppConnectionStatus, WhatsAppMessage } from '../models/whatsapp-connection.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

/**
 * Custom error class for HTTP errors from backend
 */
class HttpError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'HttpError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService implements OnDestroy {
  private connectionStatusSubject = new BehaviorSubject<WhatsAppConnectionStatus>({
    is_connected: false,
    status: 'disconnected'
  });
  
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  private pollingSubscription: any;
  private authSubscription?: Subscription;
  private pollingErrorCount = 0;
  private maxPollingErrors = 5;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    // Inicializa verificação de conexão quando o usuário fizer login
    this.initializeConnectionCheck();
  }

  /**
   * Inicializa verificação de conexão existente quando o usuário está autenticado
   */
  private initializeConnectionCheck(): void {
    // Observa mudanças no estado de autenticação
    this.authSubscription = this.authService.currentUser$.subscribe(async (user) => {
      if (user && user.company_id) {
        // Usuário está autenticado, verifica se há conexão WhatsApp ativa
        // Adiciona um pequeno delay para garantir que o auth_token está completamente configurado
        console.log('🔄 Usuário autenticado, agendando verificação de conexão WhatsApp...');
        setTimeout(async () => {
          try {
            await this.getConnectionStatus();
          } catch (error) {
            // Suprime erros 401 durante verificação inicial - é normal quando não há conexão ativa
            if (error instanceof HttpError && error.statusCode !== 401) {
              console.log('⚠️ Não foi possível verificar conexão WhatsApp:', error);
            }
          }
        }, 500); // 500ms de delay para garantir que tudo está inicializado
      } else {
        // Usuário não está autenticado, reseta o status
        this.connectionStatusSubject.next({
          is_connected: false,
          status: 'disconnected'
        });
      }
    });
  }

  /**
   * Helper para tratar respostas do backend e detectar HTML/erros
   */
  private async handleBackendResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    // Verifica se retornou HTML (backend offline/erro)
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.error('⚠️ Backend retornou HTML (Status:', response.status, ')');
      
      if (response.status === 503) {
        throw new HttpError('Backend WhatsApp está offline ou não foi buildado. Contate o administrador.', 503);
      }
      throw new HttpError(`Backend WhatsApp indisponível (${response.status})`, response.status);
    }

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new HttpError(error.message || `Erro do servidor: ${response.status}`, response.status);
      } catch (parseError) {
        // Se parseError for HttpError, relança ele
        if (parseError instanceof HttpError) {
          throw parseError;
        }
        throw new HttpError(`Erro do servidor: ${response.status}`, response.status);
      }
    }

    // Tenta fazer parse do JSON
    try {
      return await response.json();
    } catch (parseError) {
      const text = await response.text();
      console.error('❌ Resposta não é JSON válido:', text.substring(0, 200));
      throw new HttpError('Backend retornou resposta inválida', response.status);
    }
  }

  /**
   * Obtém o access_token da sessão autenticada
   */
  private async getAccessTokenFromSupabase(): Promise<string | null> {
    try {
      // Verifica se usuário está logado checando localStorage
      const currentUser = localStorage.getItem('currentUser');
      const companyId = this.authService.getValidCompanyId();
      
      console.log('📦 currentUser from localStorage:', currentUser ? 'FOUND' : 'NOT FOUND');
      console.log('📦 company_id from localStorage:', companyId);
      
      if (!currentUser) {
        console.log('❌ User not logged in');
        return null;
      }
      
      if (!companyId) {
        console.log('❌ Invalid company_id');
        return null;
      }
      
      // Prioridade 1: Usa o auth_token gerado na autenticação (evita NavigatorLockAcquireTimeoutError)
      const authToken = this.authService.getAuthToken();
      if (authToken) {
        console.log('✅ Using auth_token from AuthService');
        return authToken;
      }
      
      // Prioridade 2: Fallback para anonKey (não tenta getSession() para evitar race condition)
      console.warn('⚠️ No auth_token found, using Supabase anonKey as fallback');
      return environment.supabase.anonKey;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  /**
   * Inicia o processo de conexão e gera QR code
   */
  async initializeConnection(): Promise<WhatsAppConnectionStatus> {
    try {
      const accessToken = await this.getAccessTokenFromSupabase();
      if (!accessToken) {
        throw new Error('Você precisa estar logado no CRM para conectar o WhatsApp');
      }

      // Busca user_id e company_id do localStorage
      const currentUser = localStorage.getItem('currentUser');
      const companyId = this.authService.getValidCompanyId();
      
      if (!currentUser || !companyId) {
        throw new Error('Dados do usuário não encontrados. Faça login novamente.');
      }

      const user = JSON.parse(currentUser);
      const userId = user.id;

      console.log('📦 Enviando para initialize:', { company_id: companyId, user_id: userId });

      const url = `${environment.apiUrl}/whatsapp/initialize`;
      console.log('🌐 Chamando:', url);
      console.log('🔑 Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          company_id: companyId,
          user_id: userId
        })
      });

      console.log('📡 Response status:', response.status, response.statusText);

      const result = await this.handleBackendResponse(response);
      console.log('✅ Initialize response:', result);
      
      // Atualiza o status com a resposta do initialize (que deve conter o QR code)
      this.connectionStatusSubject.next(result);
      
      // Inicia polling para verificar status
      this.startStatusPolling();

      return result;
    } catch (error) {
      console.error('Error initializing WhatsApp connection:', error);
      throw error;
    }
  }

  /**
   * Busca o status atual da conexão
   */
  async getConnectionStatus(): Promise<WhatsAppConnectionStatus> {
    try {
      const accessToken = await this.getAccessTokenFromSupabase();
      const companyId = this.authService.getValidCompanyId();
      
      // Return disconnected status if missing token
      if (!accessToken) {
        console.log('ℹ️ No access token available');
        const status: WhatsAppConnectionStatus = {
          is_connected: false,
          status: 'disconnected'
        };
        this.connectionStatusSubject.next(status);
        return status;
      }
      
      // Return disconnected status if invalid company_id
      if (!companyId) {
        console.log('ℹ️ Invalid company_id');
        const status: WhatsAppConnectionStatus = {
          is_connected: false,
          status: 'disconnected'
        };
        this.connectionStatusSubject.next(status);
        return status;
      }

      // Envia company_id na query string para o backend validar
      const url = new URL(`${environment.apiUrl}/whatsapp/status`);
      url.searchParams.append('company_id', companyId);

      console.log('🌐 Chamando status endpoint:', url.toString());
      console.log('📦 company_id:', companyId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('📡 Status response:', response.status);
      
      const status = await this.handleBackendResponse(response);
      console.log('🎯 Status recebido do backend:', status);
      console.log('🎯 QR Code presente no status?', !!status?.qr_code);
      console.log('🎯 Status do WhatsApp:', status?.status);
      
      // Detecta quando QR foi escaneado (status !== connected mas qr_code sumiu)
      const previousStatus = this.connectionStatusSubject.value;
      if (previousStatus.qr_code && !status.qr_code && status.status !== 'connected' && status.status !== 'disconnected') {
        console.log('📱 QR Code escaneado! Aguardando autenticação...');
        status.status = 'authenticating';
      }
      
      this.connectionStatusSubject.next(status);
      
      // Reset error count on success
      this.pollingErrorCount = 0;
      
      // Stop polling if connected
      if (status.is_connected && status.status === 'connected') {
        console.log('✅ WhatsApp conectado! Parando polling.');
        this.stopStatusPolling();
      }
      
      return status;
    } catch (error) {
      this.pollingErrorCount++;
      
      // 401 errors during status check are normal when there's no active WhatsApp session
      if (error instanceof HttpError && error.statusCode === 401) {
        console.log(`ℹ️ WhatsApp não conectado ou sessão expirada (${this.pollingErrorCount}/${this.maxPollingErrors})`);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️ WhatsApp status check failed (${this.pollingErrorCount}/${this.maxPollingErrors}):`, errorMessage);
      }
      
      // Stop polling after max errors
      if (this.pollingErrorCount >= this.maxPollingErrors) {
        console.error('❌ Máximo de erros atingido. Parando verificação de status.');
        this.stopStatusPolling();
      }
      
      // Retorna desconectado em caso de erro
      const status: WhatsAppConnectionStatus = {
        is_connected: false,
        status: 'disconnected'
      };
      this.connectionStatusSubject.next(status);
      return status;
    }
  }

  /**
   * Desconecta a sessão do WhatsApp
   */
  async disconnect(): Promise<void> {
    try {
      const accessToken = await this.getAccessTokenFromSupabase();
      const companyId = this.authService.getValidCompanyId();
      
      if (!accessToken) {
        throw new Error('Você precisa estar logado no CRM para desconectar o WhatsApp');
      }

      if (!companyId) {
        throw new Error('Dados da empresa não encontrados. Faça login novamente.');
      }

      const url = new URL(`${environment.apiUrl}/whatsapp/disconnect`);
      url.searchParams.append('company_id', companyId);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      await this.handleBackendResponse(response);

      this.stopStatusPolling();
      this.connectionStatusSubject.next({
        is_connected: false,
        status: 'disconnected'
      });
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Busca histórico de mensagens
   */
  async getMessages(limit: number = 50): Promise<WhatsAppMessage[]> {
    try {
      const accessToken = await this.getAccessTokenFromSupabase();
      const companyId = this.authService.getValidCompanyId();
      
      if (!accessToken) {
        throw new Error('Você precisa estar logado no CRM para buscar mensagens');
      }

      const url = new URL(`${environment.apiUrl}/whatsapp/messages`);
      url.searchParams.append('limit', limit.toString());
      if (companyId) {
        url.searchParams.append('company_id', companyId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return await this.handleBackendResponse(response);
    } catch (error) {
      console.error('Error getting WhatsApp messages:', error);
      throw error;
    }
  }

  /**
   * Envia uma mensagem via WhatsApp
   */
  async sendMessage(to: string, message: string): Promise<void> {
    try {
      const accessToken = await this.getAccessTokenFromSupabase();
      const companyId = this.authService.getValidCompanyId();
      
      if (!accessToken) {
        throw new Error('Você precisa estar logado no CRM para enviar mensagens');
      }

      const url = new URL(`${environment.apiUrl}/whatsapp/send`);
      if (companyId) {
        url.searchParams.append('company_id', companyId);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ to, message })
      });

      await this.handleBackendResponse(response);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Busca conversa com um contato específico
   */
  async getConversation(phone: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    try {
      const accessToken = await this.getAccessTokenFromSupabase();
      const companyId = this.authService.getValidCompanyId();
      
      if (!accessToken) {
        throw new Error('Você precisa estar logado no CRM para buscar conversas');
      }

      const url = new URL(`${environment.apiUrl}/whatsapp/conversation/${phone}`);
      url.searchParams.append('limit', limit.toString());
      if (companyId) {
        url.searchParams.append('company_id', companyId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get conversation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Busca clientes criados automaticamente via WhatsApp
   */
  async getAutoCreatedClients(): Promise<any[]> {
    try {
      const accessToken = await this.getAccessTokenFromSupabase();
      const companyId = this.authService.getValidCompanyId();
      
      if (!accessToken) {
        throw new Error('Você precisa estar logado no CRM para buscar clientes');
      }

      const url = new URL(`${environment.apiUrl}/whatsapp/auto-clients`);
      if (companyId) {
        url.searchParams.append('company_id', companyId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get auto-created clients');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting auto-created clients:', error);
      throw error;
    }
  }

  /**
   * Inicia polling para verificar status da conexão
   */
  private startStatusPolling(): void {
    this.stopStatusPolling();
    this.pollingErrorCount = 0; // Reset error count
    
    console.log('🔄 Iniciando polling de status (intervalo: 5 segundos)');
    // Verifica status a cada 5 segundos
    this.pollingSubscription = interval(5000).subscribe(() => {
      this.getConnectionStatus();
    });
  }

  /**
   * Para o polling de status
   */
  private stopStatusPolling(): void {
    if (this.pollingSubscription) {
      console.log('⏹️ Parando polling de status');
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  /**
   * Busca conexão ativa do banco de dados
   */
  async getActiveConnection(): Promise<WhatsAppConnection | null> {
    try {
      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      const user = session?.user;
      if (!user) return null;

      const { data: userData } = await this.supabaseService.client
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData?.company_id) return null;

      const { data, error } = await this.supabaseService.client
        .from('whatsapp_connections')
        .select('*')
        .eq('company_id', userData.company_id)
        .eq('is_connected', true)
        .single();

      if (error) {
        console.error('Error fetching active connection:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting active connection:', error);
      return null;
    }
  }

  /**
   * Cleanup ao destruir o serviço
   */
  ngOnDestroy(): void {
    this.stopStatusPolling();
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
