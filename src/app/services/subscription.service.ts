import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_properties: number;
  additional_user_price: number;
  activation_fee: number;
  features: {
    gestao_atendimentos: boolean;
    transferencia_leads: boolean;
    app_mobile: boolean;
    landing_page: boolean;
    treinamento_online: boolean;
    blog: boolean;
    suporte_vip: boolean;
    customer_success: boolean;
    api_imoveis: boolean;
    portal_corretor: boolean;
    treinamentos_gratuitos?: number;
  };
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  started_at: string;
  expires_at?: string;
  current_users: number;
  current_properties: number;
  additional_users: number;
  auto_renew: boolean;
  subscription_plans: SubscriptionPlan;
}

export interface UsageStats {
  users: {
    current: number;
    max: number;
    percentage: number;
  };
  properties: {
    current: number;
    max: number | 'unlimited';
    percentage: number;
  };
  plan: string;
  features: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  /**
   * Obter todos os planos disponíveis (público)
   */
  getPlans(): Observable<{ success: boolean; plans: SubscriptionPlan[] }> {
    return this.http.get<{ success: boolean; plans: SubscriptionPlan[] }>(`${this.apiUrl}/plans`);
  }

  /**
   * Obter plano específico por ID ou nome (público)
   */
  getPlan(identifier: string): Observable<{ success: boolean; plan: SubscriptionPlan }> {
    return this.http.get<{ success: boolean; plan: SubscriptionPlan }>(`${this.apiUrl}/plans/${identifier}`);
  }

  /**
   * Obter assinatura atual do tenant (requer autenticação)
   */
  getCurrentSubscription(): Observable<{ success: boolean; subscription: TenantSubscription | null }> {
    return this.http.get<{ success: boolean; subscription: TenantSubscription | null }>(`${this.apiUrl}/current`);
  }

  /**
   * Obter estatísticas de uso (requer autenticação)
   */
  getUsageStats(): Observable<{ success: boolean; stats: UsageStats }> {
    return this.http.get<{ success: boolean; stats: UsageStats }>(`${this.apiUrl}/usage`);
  }

  /**
   * Obter limites do plano (requer autenticação)
   */
  getLimits(): Observable<{ success: boolean; limits: any }> {
    return this.http.get<{ success: boolean; limits: any }>(`${this.apiUrl}/limits`);
  }

  /**
   * Criar nova assinatura (requer admin)
   */
  subscribe(planId: string): Observable<ApiResponse<TenantSubscription>> {
    return this.http.post<ApiResponse<TenantSubscription>>(`${this.apiUrl}/subscribe`, { planId });
  }

  /**
   * Trocar plano (requer admin)
   */
  changePlan(planId: string): Observable<ApiResponse<TenantSubscription>> {
    return this.http.put<ApiResponse<TenantSubscription>>(`${this.apiUrl}/change-plan`, { planId });
  }

  /**
   * Cancelar assinatura (requer admin)
   */
  cancelSubscription(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/cancel`, {});
  }

  /**
   * Verificar acesso a feature específica (requer autenticação)
   */
  checkFeatureAccess(featureName: string): Observable<{ success: boolean; hasAccess: boolean; planName: string }> {
    return this.http.get<{ success: boolean; hasAccess: boolean; planName: string }>(`${this.apiUrl}/feature/${featureName}`);
  }

  /**
   * Verificar se pode adicionar usuário
   */
  canAddUser(): Observable<{ success: boolean; canAdd: boolean; current: number; max: number }> {
    return this.http.get<{ success: boolean; canAdd: boolean; current: number; max: number }>(`${this.apiUrl}/can-add-user`);
  }

  /**
   * Verificar se pode adicionar imóvel
   */
  canAddProperty(): Observable<{ success: boolean; canAdd: boolean; current: number; max: number | string }> {
    return this.http.get<{ success: boolean; canAdd: boolean; current: number; max: number | string }>(`${this.apiUrl}/can-add-property`);
  }
}
