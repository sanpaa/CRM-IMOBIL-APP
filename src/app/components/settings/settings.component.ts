import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderSettingsService } from '../../services/reminder-settings.service';
import { AuthService } from '../../services/auth.service';
import { ReminderSettings } from '../../models/reminder-settings.model';
import { PopupService } from '../../shared/services/popup.service';
import { GoogleCalendarService, GoogleCalendarStatus } from 'src/app/services/google-calendar.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings: ReminderSettings | null = null;
  formData: any = {};
  saving = false;
  calendarStatus: GoogleCalendarStatus | null = null;
  calendarLoading = false;
  calendarConnecting = false;
  calendarDisconnecting = false;
  calendarIdOverride = '';
  calendarIdSaving = false;

  constructor(
    private reminderSettingsService: ReminderSettingsService,
    public authService: AuthService,
    private popupService: PopupService,
    private googleCalendarService: GoogleCalendarService
  ) {}

  async ngOnInit() {
    await Promise.all([this.loadSettings(), this.loadCalendarStatus()]);
    this.loadCalendarPreference();
  }

  async loadSettings() {
    try {
      this.settings = await this.reminderSettingsService.getSettings();
      if (this.settings) {
        this.formData = { ...this.settings };
      } else {
        this.resetForm();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.resetForm();
    }
  }

  resetForm() {
    this.formData = {
      days_without_change: 15,
      email_enabled: true,
      sms_enabled: false,
      whatsapp_enabled: false,
      contact_email: '',
      contact_phone: '',
      contact_whatsapp: ''
    };
  }

  async saveSettings() {
    if (!this.authService.isAdmin()) {
      this.popupService.alert('Apenas administradores podem alterar as configurações', { title: 'Aviso', tone: 'warning' });
      return;
    }

    this.saving = true;
    try {
      await this.reminderSettingsService.createOrUpdate(this.formData);
      this.popupService.alert('Configurações salvas com sucesso!', { title: 'Sucesso', tone: 'info' });
      await this.loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      this.popupService.alert('Erro ao salvar configurações', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.saving = false;
    }
  }

  async loadCalendarStatus() {
    this.calendarLoading = true;
    try {
      this.calendarStatus = await this.googleCalendarService.getStatus();
    } catch (error) {
      console.error('Error loading Google Calendar status:', error);
      this.calendarStatus = null;
    } finally {
      this.calendarLoading = false;
    }
  }

  loadCalendarPreference() {
    this.calendarIdOverride = this.googleCalendarService.getCalendarIdOverride() || '';
  }

  async saveCalendarPreference() {
    this.calendarIdSaving = true;
    try {
      this.googleCalendarService.setCalendarIdOverride(this.calendarIdOverride);
      this.popupService.alert('Preferencia de calendario salva.', { title: 'Sucesso', tone: 'info' });
    } catch (error) {
      console.error('Error saving calendar preference:', error);
      this.popupService.alert('Erro ao salvar preferencia de calendario.', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.calendarIdSaving = false;
    }
  }

  async connectGoogleCalendar() {
    if (!this.authService.isAdmin()) {
      this.popupService.alert('Apenas administradores podem conectar o Google Agenda.', { title: 'Aviso', tone: 'warning' });
      return;
    }

    this.calendarConnecting = true;
    try {
      const response = await this.googleCalendarService.connect();
      const authUrl = response.authUrl || response.authorizationUrl || response.url;
      if (!authUrl) {
        this.popupService.alert('Nao foi possivel iniciar a conexao. Contate o suporte.', { title: 'Aviso', tone: 'warning' });
        return;
      }
      window.open(authUrl, '_blank', 'noopener');
      this.popupService.alert('Finalize a conexao na nova aba e depois clique em "Atualizar status".', {
        title: 'Conectar Google Agenda',
        tone: 'info'
      });
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      this.popupService.alert('Erro ao iniciar conexao com o Google Agenda.', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.calendarConnecting = false;
    }
  }

  async reconnectGoogleCalendar() {
    if (!this.authService.isAdmin()) {
      this.popupService.alert('Apenas administradores podem conectar o Google Agenda.', { title: 'Aviso', tone: 'warning' });
      return;
    }

    const confirmed = await this.popupService.confirm('Deseja trocar a conta conectada do Google Agenda?', {
      title: 'Trocar Conta',
      confirmText: 'Continuar',
      cancelText: 'Cancelar'
    });
    if (!confirmed) return;

    this.calendarConnecting = true;
    try {
      const response = await this.googleCalendarService.connect();
      const authUrl = response.authUrl || response.authorizationUrl || response.url;
      if (!authUrl) {
        this.popupService.alert('Nao foi possivel iniciar a conexao. Contate o suporte.', { title: 'Aviso', tone: 'warning' });
        return;
      }
      window.open(authUrl, '_blank', 'noopener');
      this.popupService.alert('Finalize a conexao na nova aba e depois clique em "Atualizar status".', {
        title: 'Trocar Conta',
        tone: 'info'
      });
    } catch (error) {
      console.error('Error reconnecting Google Calendar:', error);
      this.popupService.alert('Erro ao trocar conta do Google Agenda.', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.calendarConnecting = false;
    }
  }

  async disconnectGoogleCalendar() {
    if (!this.authService.isAdmin()) {
      this.popupService.alert('Apenas administradores podem desconectar o Google Agenda.', { title: 'Aviso', tone: 'warning' });
      return;
    }

    const confirmed = await this.popupService.confirm('Deseja realmente desconectar o Google Agenda?', {
      title: 'Desconectar Google Agenda',
      confirmText: 'Desconectar',
      cancelText: 'Cancelar',
      tone: 'danger'
    });
    if (!confirmed) return;

    this.calendarDisconnecting = true;
    try {
      await this.googleCalendarService.disconnect();
      this.popupService.alert('Google Agenda desconectado.', { title: 'Sucesso', tone: 'info' });
      await this.loadCalendarStatus();
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      this.popupService.alert('Erro ao desconectar o Google Agenda.', { title: 'Aviso', tone: 'warning' });
    } finally {
      this.calendarDisconnecting = false;
    }
  }
}
