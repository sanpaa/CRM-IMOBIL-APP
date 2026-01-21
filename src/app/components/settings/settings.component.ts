import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderSettingsService } from '../../services/reminder-settings.service';
import { AuthService } from '../../services/auth.service';
import { ReminderSettings } from '../../models/reminder-settings.model';
import { PopupService } from '../../shared/services/popup.service';

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

  constructor(
    private reminderSettingsService: ReminderSettingsService,
    public authService: AuthService,
    private popupService: PopupService
  ) {}

  async ngOnInit() {
    await this.loadSettings();
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
}
