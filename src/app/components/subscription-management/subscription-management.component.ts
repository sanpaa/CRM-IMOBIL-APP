import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscriptionService, TenantSubscription, SubscriptionPlan, UsageStats } from '../../services/subscription.service';
import { PopupService } from '../../shared/services/popup.service';

@Component({
  selector: 'app-subscription-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subscription-management.component.html',
  styleUrls: ['./subscription-management.component.scss']
})
export class SubscriptionManagementComponent implements OnInit {
  currentSubscription: TenantSubscription | null = null;
  availablePlans: SubscriptionPlan[] = [];
  usageStats: UsageStats | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private popupService: PopupService
  ) {}

  ngOnInit() {
    this.loadSubscriptionData();
  }

  loadSubscriptionData() {
    this.loading = true;
    this.error = null;

    // Carregar assinatura atual
    this.subscriptionService.getCurrentSubscription().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentSubscription = response.subscription;
        }
      },
      error: (err) => {
        console.error('Error loading subscription:', err);
        this.error = 'Erro ao carregar assinatura';
      }
    });

    // Carregar planos disponíveis
    this.subscriptionService.getPlans().subscribe({
      next: (response) => {
        if (response.success) {
          this.availablePlans = response.plans;
        }
      },
      error: (err) => {
        console.error('Error loading plans:', err);
      }
    });

    // Carregar estatísticas de uso
    this.subscriptionService.getUsageStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.usageStats = response.stats;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading usage stats:', err);
        this.loading = false;
      }
    });
  }

  async changePlan(planId: string, planName: string) {
    const isUpgrade = this.isUpgrade(planId);
    const action = isUpgrade ? 'fazer upgrade' : 'fazer downgrade';
    
    const confirmed = await this.popupService.confirm(`Deseja realmente ${action} para o plano ${planName}?`, {
      title: 'Alterar plano',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      tone: 'warning'
    });
    if (!confirmed) return;
    this.subscriptionService.changePlan(planId).subscribe({
      next: (response) => {
        if (response.success) {
          this.popupService.alert(`Plano alterado com sucesso para ${planName}!`, { title: 'Sucesso', tone: 'info' });
          this.loadSubscriptionData();
        } else {
          this.popupService.alert(response.message || 'Erro ao alterar plano', { title: 'Aviso', tone: 'warning' });
        }
      },
      error: (err) => {
        console.error('Error changing plan:', err);
        this.popupService.alert('Erro ao alterar plano. Por favor, tente novamente.', { title: 'Aviso', tone: 'warning' });
      }
    });
  }

  async cancelSubscription() {
    const confirmed = await this.popupService.confirm(
      'Tem certeza que deseja cancelar sua assinatura?\n\nVocê perderá acesso aos recursos do seu plano atual.',
      {
        title: 'Cancelar assinatura',
        confirmText: 'Cancelar assinatura',
        cancelText: 'Voltar',
        tone: 'danger'
      }
    );
    if (!confirmed) return;
    this.subscriptionService.cancelSubscription().subscribe({
      next: (response) => {
        if (response.success) {
          this.popupService.alert('Assinatura cancelada com sucesso.', { title: 'Sucesso', tone: 'info' });
          this.loadSubscriptionData();
        } else {
          this.popupService.alert(response.message || 'Erro ao cancelar assinatura', { title: 'Aviso', tone: 'warning' });
        }
      },
      error: (err) => {
        console.error('Error cancelling subscription:', err);
        this.popupService.alert('Erro ao cancelar assinatura. Por favor, tente novamente.', { title: 'Aviso', tone: 'warning' });
      }
    });
  }

  getProgressBarColor(percentage: number): string {
    if (percentage < 70) return '#4CAF50'; // Verde
    if (percentage < 90) return '#FF9800'; // Laranja
    return '#F44336'; // Vermelho
  }

  isCurrentPlan(planId: string): boolean {
    return this.currentSubscription?.plan_id === planId;
  }

  isUpgrade(planId: string): boolean {
    if (!this.currentSubscription) return true;
    
    const currentPlan = this.currentSubscription.subscription_plans;
    const targetPlan = this.availablePlans.find(p => p.id === planId);
    
    if (!targetPlan) return false;
    
    return targetPlan.price_monthly > currentPlan.price_monthly;
  }

  getPlanActionText(planId: string): string {
    if (this.isCurrentPlan(planId)) {
      return 'Plano Atual';
    }
    return this.isUpgrade(planId) ? 'Fazer Upgrade' : 'Fazer Downgrade';
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'status-active',
      'suspended': 'status-suspended',
      'cancelled': 'status-cancelled',
      'expired': 'status-expired'
    };
    return statusMap[status] || '';
  }

  getStatusText(status: string): string {
    const statusTextMap: { [key: string]: string } = {
      'active': 'Ativo',
      'suspended': 'Suspenso',
      'cancelled': 'Cancelado',
      'expired': 'Expirado'
    };
    return statusTextMap[status] || status;
  }
}
