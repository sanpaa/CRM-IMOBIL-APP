import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

interface ActivityMessage {
  type: 'ACTIVITY';
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos em milissegundos
  private inactivityTimer: any = null;
  private isTracking = false;
  private broadcastChannel: BroadcastChannel | null = null;
  private lastActivityTime: number = Date.now();
  private activityThrottleTimer: any = null;
  private readonly THROTTLE_DELAY = 1000; // 1 segundo para throttle de broadcasts

  constructor(private authService: AuthService) {
    this.initializeCrossTabSync();
  }

  /**
   * Inicializa comunicação entre abas para sincronizar atividade
   */
  private initializeCrossTabSync() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('inactivity_channel');
        
        this.broadcastChannel.onmessage = (event: MessageEvent<ActivityMessage>) => {
          if (event.data.type === 'ACTIVITY') {
            // Atividade detectada em outra aba - reseta o timer
            this.resetInactivityTimer();
          }
        };
        
        console.log('✅ Sincronização de inatividade entre abas inicializada');
      } else {
        console.warn('⚠️ BroadcastChannel não disponível neste navegador');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar BroadcastChannel de inatividade:', error);
    }
  }

  /**
   * Inicia o rastreamento de atividade do usuário
   */
  startTracking() {
    if (this.isTracking) {
      console.log('ℹ️ Rastreamento de inatividade já está ativo');
      return;
    }

    console.log('🎯 Iniciando rastreamento de inatividade (timeout: 15 minutos)');
    this.isTracking = true;
    this.lastActivityTime = Date.now();

    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.handleUserActivity, true);
    });

    // Inicia o timer de inatividade
    this.resetInactivityTimer();
  }

  /**
   * Para o rastreamento de atividade do usuário
   */
  stopTracking() {
    if (!this.isTracking) {
      return;
    }

    console.log('🛑 Parando rastreamento de inatividade');
    this.isTracking = false;

    // Remove event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.handleUserActivity, true);
    });

    // Limpa timers
    this.clearInactivityTimer();
    this.clearActivityThrottle();
  }

  /**
   * Handler para atividade do usuário
   */
  private handleUserActivity = () => {
    if (!this.isTracking) {
      return;
    }

    this.lastActivityTime = Date.now();
    this.resetInactivityTimer();

    // Throttle: só envia broadcast de atividade uma vez por segundo
    if (!this.activityThrottleTimer) {
      this.broadcastActivityToOtherTabs();
      
      this.activityThrottleTimer = setTimeout(() => {
        this.activityThrottleTimer = null;
      }, this.THROTTLE_DELAY);
    }
  }

  /**
   * Envia mensagem para outras abas informando atividade
   */
  private broadcastActivityToOtherTabs() {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'ACTIVITY',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ Erro ao enviar broadcast de atividade:', error);
      }
    }
  }

  /**
   * Reseta o timer de inatividade
   */
  private resetInactivityTimer() {
    this.clearInactivityTimer();
    
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivityTimeout();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Limpa o timer de inatividade
   */
  private clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Limpa o throttle de broadcast de atividade
   */
  private clearActivityThrottle() {
    if (this.activityThrottleTimer) {
      clearTimeout(this.activityThrottleTimer);
      this.activityThrottleTimer = null;
    }
  }

  /**
   * Chamado quando o usuário fica inativo por 15 minutos
   */
  private handleInactivityTimeout() {
    console.warn('⏰ Timeout de inatividade atingido (15 minutos). Fazendo logout...');
    
    // Para o rastreamento antes de fazer logout
    this.stopTracking();
    
    // Faz logout através do AuthService
    this.authService.signOut();
  }

  /**
   * Cleanup quando o serviço é destruído
   */
  ngOnDestroy() {
    this.stopTracking();
    
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
        console.log('✅ BroadcastChannel de inatividade fechado');
      } catch (error) {
        console.error('❌ Erro ao fechar BroadcastChannel de inatividade:', error);
      }
      this.broadcastChannel = null;
    }
  }

  /**
   * Obtém o tempo desde a última atividade (em milissegundos)
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivityTime;
  }

  /**
   * Verifica se o rastreamento está ativo
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }
}
