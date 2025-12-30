import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Deal } from '../models/deal.model';

@Injectable({
  providedIn: 'root'
})
export class DealService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<Deal[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('deals')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Deal[];
  }

  async getById(id: string): Promise<Deal | null> {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Deal;
  }

  async create(deal: Partial<Deal>): Promise<Deal> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('deals')
      .insert({
        ...deal,
        company_id: user.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Deal;
  }

  async update(id: string, updates: Partial<Deal>): Promise<Deal> {
    const { data, error } = await this.supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Deal;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getByStatus(status: string): Promise<Deal[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('deals')
      .select('*')
      .eq('company_id', user.company_id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Deal[];
  }

  async getByUser(userId: string): Promise<Deal[]> {
    const { data, error } = await this.supabase
      .from('deals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Deal[];
  }
}
