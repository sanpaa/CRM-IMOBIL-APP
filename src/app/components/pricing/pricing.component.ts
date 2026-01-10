import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PricingPlan, PlanFeature } from '../../models/pricing-plan.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  plans: PricingPlan[] = [];
  allFeatures: { name: string; description?: string; tooltip?: string }[] = [];

  ngOnInit() {
    this.initializePlans();
    this.initializeFeatures();
  }

  private initializePlans() {
    this.plans = [
      {
        id: 'prime',
        name: 'Prime',
        displayName: 'Prime',
        price: 247,
        yearlyPrice: 2964,
        monthlyEquivalent: 247,
        description: 'Ideal para imobiliárias iniciantes que buscam organização',
        users: 2,
        additionalUserPrice: 57,
        freeTrainings: 0,
        activationFee: 197,
        trainingPrice: 999,
        features: [
          { name: 'users', included: true, value: '2 usuários' },
          { name: 'service_management', included: true },
          { name: 'lead_transfer', included: false },
          { name: 'mobile_app', included: true },
          { name: 'landing_page', included: false },
          { name: 'online_training', included: false, value: 'Pago (R$ 999)' },
          { name: 'blog', included: false },
          { name: 'vip_support', included: false },
          { name: 'customer_success', included: false },
          { name: 'api_access', included: false },
          { name: 'client_portal', included: false }
        ]
      },
      {
        id: 'k',
        name: 'K',
        displayName: 'K',
        price: 397,
        yearlyPrice: 4764,
        monthlyEquivalent: 397,
        isPopular: true,
        description: 'Perfeito para imobiliárias em crescimento',
        users: 5,
        additionalUserPrice: 37,
        freeTrainings: 1,
        activationFee: 197,
        trainingPrice: 999,
        features: [
          { name: 'users', included: true, value: '5 usuários' },
          { name: 'service_management', included: true },
          { name: 'lead_transfer', included: true },
          { name: 'mobile_app', included: true },
          { name: 'landing_page', included: true },
          { name: 'online_training', included: true, value: '1 treinamento gratuito' },
          { name: 'blog', included: true },
          { name: 'vip_support', included: false },
          { name: 'customer_success', included: false },
          { name: 'api_access', included: true },
          { name: 'client_portal', included: true }
        ]
      },
      {
        id: 'k2',
        name: 'K2',
        displayName: 'K2',
        price: 697,
        yearlyPrice: 8364,
        monthlyEquivalent: 697,
        description: 'Solução completa para imobiliárias estruturadas',
        users: 12,
        additionalUserPrice: 27,
        freeTrainings: 2,
        activationFee: 197,
        trainingPrice: 999,
        features: [
          { name: 'users', included: true, value: '12 usuários' },
          { name: 'service_management', included: true },
          { name: 'lead_transfer', included: true },
          { name: 'mobile_app', included: true },
          { name: 'landing_page', included: true },
          { name: 'online_training', included: true, value: '2 treinamentos gratuitos' },
          { name: 'blog', included: true },
          { name: 'vip_support', included: true },
          { name: 'customer_success', included: true },
          { name: 'api_access', included: true },
          { name: 'client_portal', included: true }
        ]
      }
    ];
  }

  private initializeFeatures() {
    this.allFeatures = [
      { 
        name: 'users', 
        description: 'Quantidade de usuários',
        tooltip: 'Número de usuários inclusos no plano. Usuários adicionais podem ser contratados separadamente.'
      },
      { 
        name: 'service_management', 
        description: 'Gestão de atendimentos',
        tooltip: 'Sistema completo para gerenciar o relacionamento com leads e clientes'
      },
      { 
        name: 'lead_transfer', 
        description: 'Transferência automática de leads',
        tooltip: 'Distribuição inteligente de leads entre os corretores da equipe'
      },
      { 
        name: 'mobile_app', 
        description: 'Aplicativo mobile',
        tooltip: 'Acesso completo ao CRM através de aplicativo móvel'
      },
      { 
        name: 'landing_page', 
        description: 'Landing page integrada',
        tooltip: 'Páginas de captura otimizadas para conversão de leads'
      },
      { 
        name: 'online_training', 
        description: 'Treinamento online',
        tooltip: 'Capacitação completa para aproveitar todos os recursos do sistema'
      },
      { 
        name: 'blog', 
        description: 'Blog institucional',
        tooltip: 'Plataforma de conteúdo integrada para estratégias de marketing'
      },
      { 
        name: 'vip_support', 
        description: 'Suporte VIP',
        tooltip: 'Atendimento prioritário com tempo de resposta reduzido'
      },
      { 
        name: 'customer_success', 
        description: 'Customer Success dedicado',
        tooltip: 'Especialista exclusivo para acompanhar o crescimento do seu negócio'
      },
      { 
        name: 'api_access', 
        description: 'Acesso à API de imóveis',
        tooltip: 'Integração com sistemas externos através de API REST'
      },
      { 
        name: 'client_portal', 
        description: 'Portal do cliente',
        tooltip: 'Portal personalizado para corretores e clientes acessarem informações'
      }
    ];
  }

  getFeatureValue(plan: PricingPlan, featureName: string): PlanFeature | undefined {
    return plan.features.find(f => f.name === featureName);
  }

  getFeatureDescription(featureName: string): string {
    const feature = this.allFeatures.find(f => f.name === featureName);
    return feature?.description || featureName;
  }

  getFeatureTooltip(featureName: string): string {
    const feature = this.allFeatures.find(f => f.name === featureName);
    return feature?.tooltip || '';
  }

  scrollToComparison() {
    const element = document.getElementById('comparison-table');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  contactExpert() {
    // In a real scenario, this would open a contact form or chat
    window.location.href = 'mailto:contato@crmimobiliario.com.br?subject=Consulta sobre planos';
  }
}
