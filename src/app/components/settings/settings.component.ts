import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderSettingsService } from '../../services/reminder-settings.service';
import { AuthService } from '../../services/auth.service';
import { ReminderSettings } from '../../models/reminder-settings.model';

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
    public authService: AuthService
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
      alert('Apenas administradores podem alterar as configurações');
      return;
    }

    this.saving = true;
    try {
      await this.reminderSettingsService.createOrUpdate(this.formData);
      alert('Configurações salvas com sucesso!');
      await this.loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações');
    } finally {
      this.saving = false;
    }
  }
}
