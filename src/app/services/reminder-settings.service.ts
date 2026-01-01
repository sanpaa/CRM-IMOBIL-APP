import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ReminderSettings } from '../models/reminder-settings.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderSettingsService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getSettings(): Promise<ReminderSettings | null> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('reminder_settings')
      .select('*')
      .eq('company_id', user.company_id)
      .maybeSingle();

    if (error) throw error;
    return data as ReminderSettings | null;
  }

  async createOrUpdate(settings: Partial<ReminderSettings>): Promise<ReminderSettings> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const existingSettings = await this.getSettings();

    if (existingSettings) {
      const { data, error } = await this.supabase
        .from('reminder_settings')
        .update(settings)
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (error) throw error;
      return data as ReminderSettings;
    } else {
      const { data, error } = await this.supabase
        .from('reminder_settings')
        .insert({
          ...settings,
          company_id: user.company_id
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReminderSettings;
    }
  }
}
