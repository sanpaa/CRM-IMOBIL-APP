import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomainManagementService } from '../../services/domain-management.service';
import { AuthService } from '../../services/auth.service';
import { CustomDomain, DomainVerification } from '../../models/custom-domain.model';

@Component({
  selector: 'app-domain-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domain-settings.component.html',
  styleUrls: ['./domain-settings.component.scss']
})
export class DomainSettingsComponent implements OnInit {
  domains: CustomDomain[] = [];
  loading = false;
  saving = false;
  
  showAddDomainForm = false;
  newDomain = {
    domain: '',
    subdomain: ''
  };
  
  selectedDomain: CustomDomain | null = null;
  dnsInstructions: DomainVerification | null = null;
  
  constructor(
    private domainService: DomainManagementService,
    public authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadDomains();
  }

  async loadDomains() {
    this.loading = true;
    try {
      const user = this.authService.getCurrentUser();
      if (user?.company_id) {
        this.domains = await this.domainService.getDomains(user.company_id);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
      alert('Erro ao carregar domínios');
    } finally {
      this.loading = false;
    }
  }

  async addDomain() {
    const validation = this.domainService.validateDomainFormat(this.newDomain.domain);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    this.saving = true;
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.company_id) return;

      const domain = await this.domainService.addDomain({
        company_id: user.company_id,
        domain: this.newDomain.domain,
        subdomain: this.newDomain.subdomain || undefined,
        is_primary: this.domains.length === 0
      });

      this.domains.push(domain);
      this.showAddDomainForm = false;
      this.newDomain = { domain: '', subdomain: '' };
      
      alert('Domínio adicionado com sucesso! Configure os registros DNS.');
      this.showDnsInstructions(domain);
    } catch (error: any) {
      console.error('Error adding domain:', error);
      if (error.message?.includes('duplicate')) {
        alert('Este domínio já está cadastrado');
      } else {
        alert('Erro ao adicionar domínio');
      }
    } finally {
      this.saving = false;
    }
  }

  async verifyDomain(domain: CustomDomain) {
    if (domain.is_subdomain_auto) {
      // Automatic subdomains are always verified and active
      alert('Subdomínio automático já está ativo!');
      return;
    }

    if (!confirm('Confirme que você já:\n1. Configurou os registros DNS no seu provedor\n2. Aguardou a propagação DNS (pode levar até 48h)\n\nDeseja marcar como verificado?')) {
      return;
    }

    try {
      const verified = await this.domainService.verifyDomain(domain.id);
      if (verified) {
        alert('Domínio marcado como verificado! Agora você pode ativá-lo.');
        await this.loadDomains();
      } else {
        alert('Não foi possível verificar o domínio.');
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      alert('Erro ao verificar domínio');
    }
  }

  async setPrimary(domain: CustomDomain) {
    if (!confirm('Deseja definir este domínio como principal?')) {
      return;
    }

    try {
      const user = this.authService.getCurrentUser();
      if (!user?.company_id) return;

      await this.domainService.setPrimaryDomain(domain.id, user.company_id);
      alert('Domínio principal atualizado!');
      await this.loadDomains();
    } catch (error) {
      console.error('Error setting primary domain:', error);
      alert('Erro ao definir domínio principal');
    }
  }

  async activateDomain(domain: CustomDomain) {
    if (domain.is_subdomain_auto) {
      alert('Subdomínios automáticos já estão ativos!');
      return;
    }

    if (!confirm('Confirme que você:\n1. Adicionou este domínio no painel do Netlify/Vercel\n2. O DNS já foi propagado\n3. O domínio está acessível\n\nDeseja ativar este domínio?')) {
      return;
    }

    try {
      await this.domainService.activateDomain(domain.id);
      alert('Domínio ativado! SSL será fornecido automaticamente pelo Netlify/Vercel.');
      await this.loadDomains();
    } catch (error: any) {
      console.error('Error activating domain:', error);
      alert(error.message || 'Erro ao ativar domínio');
    }
  }

  async deleteDomain(domain: CustomDomain) {
    if (!confirm(`Tem certeza que deseja remover o domínio ${domain.domain}?`)) {
      return;
    }

    try {
      await this.domainService.deleteDomain(domain.id);
      this.domains = this.domains.filter(d => d.id !== domain.id);
      alert('Domínio removido com sucesso!');
    } catch (error) {
      console.error('Error deleting domain:', error);
      alert('Erro ao remover domínio');
    }
  }

  showDnsInstructions(domain: CustomDomain) {
    this.selectedDomain = domain;
    this.dnsInstructions = this.domainService.getDnsInstructions(domain);
  }

  closeDnsInstructions() {
    this.selectedDomain = null;
    this.dnsInstructions = null;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: '⏳',
      verified: '✅',
      active: '🟢',
      failed: '❌',
      disabled: '⚪'
    };
    return icons[status] || '❓';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      verified: 'Verificado',
      active: 'Ativo',
      failed: 'Falhou',
      disabled: 'Desabilitado'
    };
    return labels[status] || status;
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copiado para a área de transferência!');
    }).catch(err => {
      console.error('Error copying to clipboard:', err);
    });
  }
}
