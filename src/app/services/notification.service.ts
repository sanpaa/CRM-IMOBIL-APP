import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Notification } from '../models/notification.model';
import { AuthenticationError } from '../models/errors/auth-error';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<Notification[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new AuthenticationError();

    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async getUnread(): Promise<Notification[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new AuthenticationError();

    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async markAllAsRead(): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new AuthenticationError();

    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
  }

  async create(notification: Partial<Notification>): Promise<Notification> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new AuthenticationError();

    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        ...notification,
        company_id: user.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  }

  subscribeToNotifications(callback: (notification: Notification) => void) {
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) return;

    return this.supabase.client
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }
}
