import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ActivityLog } from '../models/activity-log.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<ActivityLog[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('activity_logs')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data as ActivityLog[];
  }

  async getByEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
    const { data, error } = await this.supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ActivityLog[];
  }

  async create(log: Partial<ActivityLog>): Promise<ActivityLog> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('activity_logs')
      .insert({
        ...log,
        company_id: user.company_id,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as ActivityLog;
  }

  async logAction(
    entityType: string,
    entityId: string,
    action: string,
    description: string
  ): Promise<void> {
    await this.create({
      entity_type: entityType,
      entity_id: entityId,
      action: action,
      description: description
    });
  }
}
