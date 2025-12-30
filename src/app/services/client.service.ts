import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Client } from '../models/client.model';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<Client[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
  }

  async getById(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Client;
  }

  async create(client: Partial<Client>): Promise<Client> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('clients')
      .insert({
        ...client,
        company_id: user.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Client;
  }

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await this.supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Client;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getByAssignedUser(userId: string): Promise<Client[]> {
    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('assigned_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
  }

  async getByStatus(status: string): Promise<Client[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('company_id', user.company_id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
  }
}
