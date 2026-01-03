import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { WhatsAppConnection, WhatsAppConnectionStatus, WhatsAppMessage } from '../models/whatsapp-connection.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppService {
  private connectionStatusSubject = new BehaviorSubject<WhatsAppConnectionStatus>({
    is_connected: false,
    status: 'disconnected'
  });
  
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  private pollingSubscription: any;

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtém o token - como você não usa Supabase Auth, usa o anonKey direto
   */
  private async getAccessTokenFromSupabase(): Promise<string | null> {
    try {
      // Verifica se usuário está logado checando localStorage
      const currentUser = localStorage.getItem('currentUser');
      const companyId = localStorage.getItem('company_id');
      
      console.log('📦 currentUser from localStorage:', currentUser ? 'FOUND' : 'NOT FOUND');
      console.log('📦 company_id from localStorage:', companyId);
      
      if (!currentUser || !companyId) {
        console.log('❌ User not logged in');
        return null;
      }
      
      // Como você não usa Supabase Auth, retorna o anonKey
      // O backend deve aceitar o anonKey e validar se o usuário existe via outro método
      const token = environment.supabase.anonKey;
      console.log('✅ Using Supabase anonKey as token');
      return token;
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

      const url = `${environment.apiUrl}/whatsapp/initialize`;
      console.log('🌐 Chamando:', url);
      console.log('🔑 Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({})
      });

      console.log('📡 Response status:', response.status, response.statusText);

      const text = await response.text();
      console.log('📄 Response body (first 500 chars):', text.substring(0, 500));

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} - ${text.substring(0, 100)}`);
      }

      const result = JSON.parse(text);
      
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
      if (!accessToken) {
        // Retorna status desconectado se não tiver token
        const status: WhatsAppConnectionStatus = {
          is_connected: false,
          status: 'disconnected'
        };
        this.connectionStatusSubject.next(status);
        return status;
      }

      const response = await fetch(`${environment.apiUrl}/whatsapp/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get WhatsApp status');
      }

      const status = await response.json();
      this.connectionStatusSubject.next(status);
      return status;
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
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
      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${environment.apiUrl}/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect WhatsApp');
      }

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
      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${environment.apiUrl}/whatsapp/messages?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get messages');
      }

      return await response.json();
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
      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${environment.apiUrl}/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ to, message })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
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
      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${environment.apiUrl}/whatsapp/conversation/${phone}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
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
      const { data: { session } } = await this.supabaseService.client.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${environment.apiUrl}/whatsapp/auto-clients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
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
    
    // Verifica status a cada 3 segundos
    this.pollingSubscription = interval(3000).subscribe(() => {
      this.getConnectionStatus();
    });
  }

  /**
   * Para o polling de status
   */
  private stopStatusPolling(): void {
    if (this.pollingSubscription) {
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
  }
}
