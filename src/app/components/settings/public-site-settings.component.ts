import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { HeaderConfig, FooterConfig, FooterLink } from '../../models/company.model';
import { PopupService } from '../../shared/services/popup.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';

@Component({
  selector: 'app-public-site-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './public-site-settings.component.html',
  styleUrls: ['./public-site-settings.component.scss']
})
export class PublicSiteSettingsComponent implements OnInit {
  companyId: string | null = null;
  saving = false;
  saved = false;
  
  // Header Config
  headerConfig: HeaderConfig = {
    logoUrl: '',
    showLogo: false,
    showMenu: true,
    backgroundColor: '#ffffff',
    textColor: '#333333'
  };
  
  // Footer Config
  footerConfig: FooterConfig = {
    companyName: '',
    description: '',
    logoUrl: '',
    showLogo: false,
    address: '',
    phone: '',
    email: '',
    instagram: '',
    facebook: '',
    whatsapp: '',
    quickLinks: [],
    services: [],
    showCopyright: true,
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff'
  };
  
  // Temporary fields for adding links
  newQuickLink: FooterLink = { label: '', route: '' };
  newService: FooterLink = { label: '', route: '' };

  constructor(
    private companyService: CompanyService,
    public authService: AuthService,
    private popupService: PopupService
  ) {}

  async ngOnInit() {
    const companyId = localStorage.getItem('company_id');
    // Validate company_id is not null, 'null', or 'undefined'
    if (!companyId || companyId === 'null' || companyId === 'undefined') {
      console.error('🔴 Company ID inválido ou não encontrado no localStorage!');
      this.popupService.alert('Erro: Sessão inválida. Faça login novamente.', { title: 'Aviso', tone: 'warning' });
      return;
    }
    
    this.companyId = companyId;
    console.log('🟢 Company ID do localStorage:', this.companyId);
    
    await this.loadSettings();
  }

  async loadSettings() {
    try {
      console.log('🟢 Carregando configurações da empresa:', this.companyId);
      
      const company = await this.companyService.getById(this.companyId!);
      
      if (!company) {
        console.error('🔴 Empresa não encontrada!');
        return;
      }
      
      console.log('🟢 Empresa carregada:', company.name);
      
      // Carregar header_config se existir
      if (company.header_config) {
        console.log('🟢 Header config encontrado:', company.header_config);
        this.headerConfig = company.header_config as any;
      }
      
      // Carregar footer_config se existir
      if (company.footer_config) {
        console.log('🟢 Footer config encontrado:', company.footer_config);
        this.footerConfig = company.footer_config as any;
      } else {
        // Valores default se não existir
        this.footerConfig.companyName = company.name;
        this.footerConfig.email = company.email || '';
        this.footerConfig.phone = company.phone || '';
      }
      
      console.log('✅ Configurações carregadas com sucesso!');
    } catch (error) {
      console.error('🔴 Error loading settings:', error);
      this.popupService.alert('Erro ao carregar configurações: ' + error, { title: 'Aviso', tone: 'warning' });
    }
  }

  async saveSettings() {
    if (!this.companyId) {
      console.error('🔴 Company ID não encontrado!');
      this.popupService.alert('Erro: Company ID não encontrado', { title: 'Aviso', tone: 'warning' });
      return;
    }
    
    this.saving = true;
    try {
      console.log('🟢 Salvando configurações...');
      console.log('🟢 Company ID:', this.companyId);
      console.log('🟢 Header Config:', this.headerConfig);
      console.log('🟢 Footer Config:', this.footerConfig);
      
      const success = await this.companyService.updateStoreSettings(this.companyId, {
        header_config: this.headerConfig,
        footer_config: this.footerConfig
      });
      
      if (success) {
        console.log('✅ Configurações salvas com sucesso!');
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.popupService.alert('Erro ao salvar configurações', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.saving = false;
    }
  }

  // Quick Links Management
  addQuickLink() {
    if (this.newQuickLink.label && this.newQuickLink.route) {
      this.footerConfig.quickLinks = this.footerConfig.quickLinks || [];
      this.footerConfig.quickLinks.push({ ...this.newQuickLink });
      this.newQuickLink = { label: '', route: '' };
    }
  }

  removeQuickLink(index: number) {
    this.footerConfig.quickLinks?.splice(index, 1);
  }

  // Services Management
  addService() {
    if (this.newService.label && this.newService.route) {
      this.footerConfig.services = this.footerConfig.services || [];
      this.footerConfig.services.push({ ...this.newService });
      this.newService = { label: '', route: '' };
    }
  }

  removeService(index: number) {
    this.footerConfig.services?.splice(index, 1);
  }
}
