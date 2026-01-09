import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WhatsAppService } from '../../../services/whatsapp.service';
import { WhatsAppConnectionStatus } from '../../../models/whatsapp-connection.model';
import { SupabaseService } from '../../../services/supabase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-whatsapp-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="isCheckingAuth" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Verificando autenticação...</p>
    </div>

    <!-- Not Authenticated -->
    <div *ngIf="!isCheckingAuth && !isAuthenticated" class="auth-error-container">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3>Erro de Acesso</h3>
      <p>{{ errorMessage }}</p>
      <button class="btn btn-primary" (click)="checkAuthentication()">
        Tentar Novamente
      </button>
    </div>

    <!-- Main Content -->
    <div *ngIf="!isCheckingAuth && isAuthenticated" class="whatsapp-settings">
      <div class="settings-header">
        <h2>Integração WhatsApp</h2>
        <p class="subtitle">Conecte sua conta do WhatsApp para receber e gerenciar contatos automaticamente</p>
      </div>

      <div class="connection-card">
        <!-- Status Desconectado -->
        <div *ngIf="connectionStatus.status === 'disconnected'" class="status-section disconnected">
          <div class="status-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z"/>
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0z"/>
            </svg>
          </div>
          <h3>WhatsApp não conectado</h3>
          <p>Conecte sua conta do WhatsApp para começar a receber contatos automaticamente</p>
          <button class="btn btn-primary" (click)="connectWhatsApp()" [disabled]="isLoading">
            <span *ngIf="!isLoading">Conectar WhatsApp</span>
            <span *ngIf="isLoading">Conectando...</span>
          </button>
        </div>

        <!-- QR Code -->
        <div *ngIf="connectionStatus.status === 'qr_ready' && connectionStatus.qr_code" class="status-section qr-code">
          <div class="qr-container">
            <h3>Escaneie o QR Code</h3>
            <p>Abra o WhatsApp no seu celular e escaneie o código abaixo:</p>
            <div class="qr-image-container">
              <img [src]="connectionStatus.qr_code" alt="QR Code WhatsApp" class="qr-image">
            </div>
            <div class="qr-instructions">
              <ol>
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em <strong>Menu</strong> ou <strong>Configurações</strong></li>
                <li>Toque em <strong>Aparelhos conectados</strong></li>
                <li>Toque em <strong>Conectar um aparelho</strong></li>
                <li>Aponte seu celular para esta tela para escanear o código</li>
              </ol>
            </div>
            <button class="btn btn-secondary" (click)="cancelConnection()">Cancelar</button>
          </div>
        </div>

        <!-- Gerando QR Code / Restaurando Sessão -->
        <div *ngIf="connectionStatus.status === 'connecting'" class="status-section connecting">
          <div class="loading-spinner"></div>
          <h3>{{ getConnectingTitle() }}</h3>
          <p>{{ getConnectingMessage() }}</p>
        </div>

        <!-- Autenticando (após escanear QR) -->
        <div *ngIf="connectionStatus.status === 'authenticating'" class="status-section authenticating">
          <div class="loading-spinner"></div>
          <h3>Autenticando...</h3>
          <p>QR Code escaneado! Finalizando conexão com o WhatsApp</p>
        </div>

        <!-- Conectado -->
        <div *ngIf="connectionStatus.status === 'connected'" class="status-section connected">
          <div class="status-icon success">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3>✅ WhatsApp Conectado com Sucesso!</h3>
          <p class="phone-number">{{ getFormattedPhoneNumber() }}</p>
          <div class="connected-info">
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>Conexão ativa</span>
            </div>
            <div class="info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Novos contatos serão registrados automaticamente</span>
            </div>
          </div>
          <button class="btn btn-danger" (click)="disconnectWhatsApp()" [disabled]="isLoading">
            <span *ngIf="!isLoading">Desconectar WhatsApp</span>
            <span *ngIf="isLoading">Desconectando...</span>
          </button>
        </div>

        <!-- Erro -->
        <div *ngIf="errorMessage" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Informações adicionais -->
      <div class="info-card">
        <h3>Como funciona?</h3>
        <div class="info-content">
          <div class="info-block">
            <h4>📱 Recebimento Automático</h4>
            <p>Quando você receber uma mensagem de um número que não está cadastrado no CRM, o sistema criará automaticamente um novo cliente com os dados do contato.</p>
          </div>
          <div class="info-block">
            <h4>🔒 Segurança</h4>
            <p>Sua sessão do WhatsApp é criptografada e armazenada com segurança. Você pode desconectar a qualquer momento.</p>
          </div>
          <div class="info-block">
            <h4>🔄 Sincronização</h4>
            <p>As mensagens e contatos são sincronizados automaticamente. Você não perderá nenhuma conversa importante.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .whatsapp-settings {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .settings-header {
      margin-bottom: 2rem;
    }

    .settings-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #666;
      font-size: 1rem;
    }

    .connection-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .status-section {
      text-align: center;
    }

    .status-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f5f5f5;
      color: #666;
    }

    .status-icon.success {
      background: #dcfce7;
      color: #16a34a;
    }

    .status-section.authenticating {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-section h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    .status-section p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .phone-number {
      font-weight: 600;
      color: #25D366;
      font-size: 1.1rem;
    }

    .qr-container {
      max-width: 500px;
      margin: 0 auto;
    }

    .qr-image-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 2px solid #e5e5e5;
      margin: 1.5rem 0;
      display: inline-block;
    }

    .qr-image {
      max-width: 280px;
      height: auto;
      display: block;
    }

    .qr-instructions {
      text-align: left;
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .qr-instructions ol {
      margin: 0;
      padding-left: 1.5rem;
    }

    .qr-instructions li {
      margin: 0.5rem 0;
      color: #4b5563;
    }

    .connected-info {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0.75rem 0;
      color: #4b5563;
    }

    .info-item svg {
      flex-shrink: 0;
      color: #25D366;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #25D366;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn {
      padding: 0.75rem 2rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #25D366;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #20b959;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }

    .btn-secondary {
      background: #e5e5e5;
      color: #666;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #d4d4d4;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      margin-top: 1rem;
    }

    .info-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #1a1a1a;
    }

    .info-content {
      display: grid;
      gap: 1.5rem;
    }

    .info-block h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    .info-block p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 768px) {
      .whatsapp-settings {
        padding: 1rem;
      }

      .connection-card,
      .info-card {
        padding: 1.5rem;
      }

      .qr-image {
        max-width: 220px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .loading-container p {
      margin-top: 1rem;
      color: #666;
      font-weight: 500;
    }

    .auth-error-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .error-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fef2f2;
      border-radius: 50%;
      color: #dc2626;
    }

    .auth-error-container h3 {
      color: #dc2626;
      margin-bottom: 0.5rem;
    }

    .auth-error-container p {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
  `]
})
export class WhatsAppSettingsComponent implements OnInit, OnDestroy {
  connectionStatus: WhatsAppConnectionStatus = {
    is_connected: false,
    status: 'disconnected'
  };
  
  isLoading = false;
  errorMessage = '';
  isCheckingAuth = true;
  isAuthenticated = false;
  router: Router; // Exponha router para uso no template
  private statusSubscription?: Subscription;

  constructor(
    private whatsappService: WhatsAppService,
    private supabaseService: SupabaseService,
    private routerService: Router
  ) {
    this.router = this.routerService;
  }

  ngOnInit(): void {
    // Marca como autenticado e carrega status direto
    this.isCheckingAuth = false;
    this.isAuthenticated = true;
    this.loadConnectionStatus();
    
    // Observa mudanças no status
    this.statusSubscription = this.whatsappService.connectionStatus$.subscribe(
      status => {
        this.connectionStatus = status;
      }
    );
  }

  async checkAuthentication(): Promise<void> {
    // Método vazio - não verifica mais autenticação frontend
    // Backend valida token automaticamente nas requisições
  }

  ngOnDestroy(): void {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  async loadConnectionStatus(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      const status = await this.whatsappService.getConnectionStatus();
      this.connectionStatus = status;
    } catch (error: any) {
      // Set disconnected status silently instead of showing error
      this.connectionStatus = { is_connected: false, status: 'disconnected' };
      console.error('Error loading connection status:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async connectWhatsApp(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      console.log('🔵 Iniciando conexão WhatsApp...');
      const result = await this.whatsappService.initializeConnection();
      console.log('🟢 Resposta do initialize:', result);
      console.log('🎯 QR Code presente?', !!result?.qr_code);
      if (!result?.qr_code) {
        console.warn('⚠️ QR Code não foi retornado na resposta do initialize');
        this.errorMessage = 'QR Code não foi gerado. Tente novamente.';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao conectar WhatsApp';
      console.error('Error connecting WhatsApp:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async disconnectWhatsApp(): Promise<void> {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp? Você precisará escanear o QR code novamente para reconectar.')) {
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.whatsappService.disconnect();
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao desconectar WhatsApp';
      console.error('Error disconnecting WhatsApp:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async cancelConnection(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.whatsappService.disconnect();
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao cancelar conexão';
      console.error('Error canceling connection:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Returns the appropriate title for connecting status
   * Checks if backend is restoring session vs generating new QR code
   */
  getConnectingTitle(): string {
    const message = this.connectionStatus.message || '';
    // Check for keywords that indicate session restoration
    if (message.toLowerCase().includes('restaur') || message.toLowerCase().includes('restor')) {
      return 'Restaurando Conexão...';
    }
    return 'Gerando QR Code...';
  }

  /**
   * Returns the appropriate message for connecting status
   */
  getConnectingMessage(): string {
    if (this.connectionStatus.message) {
      return this.connectionStatus.message;
    }
    return 'Aguarde enquanto geramos o código de pareamento';
  }

  /**
   * Formats the phone number for better display
   * Handles Brazilian phone numbers and international formats
   */
  getFormattedPhoneNumber(): string {
    const phone = this.connectionStatus.phone_number;
    
    if (!phone) {
      return 'Número não disponível';
    }
    
    // If it's a Brazilian number (starts with 55) and has 13 digits (55 + 11 digits)
    if (phone.startsWith('55') && phone.length === 13) {
      // Format as: +55 (11) 91234-5678
      const countryCode = phone.substring(0, 2);
      const areaCode = phone.substring(2, 4);
      const firstPart = phone.substring(4, 9);
      const secondPart = phone.substring(9);
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    }
    
    // If it's a Brazilian number (starts with 55) and has 12 digits (55 + 10 digits) - old format
    if (phone.startsWith('55') && phone.length === 12) {
      // Format as: +55 (11) 1234-5678
      const countryCode = phone.substring(0, 2);
      const areaCode = phone.substring(2, 4);
      const firstPart = phone.substring(4, 8);
      const secondPart = phone.substring(8);
      return `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;
    }
    
    // For other international numbers, add + and split into groups
    // Example: 1234567890 -> +1 234 567 890
    if (phone.length >= 10) {
      const countryCode = phone.substring(0, phone.length - 9);
      const rest = phone.substring(phone.length - 9);
      return `+${countryCode} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6)}`;
    }
    
    // Fallback: just add + prefix
    return `+${phone}`;
  }
}
