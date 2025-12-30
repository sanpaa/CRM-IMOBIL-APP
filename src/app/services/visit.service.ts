import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Visit } from '../models/visit.model';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<Visit[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('visits')
      .select('*')
      .eq('company_id', user.company_id)
      .order('visit_date', { ascending: true })
      .order('visit_time', { ascending: true });

    if (error) throw error;
    return data as Visit[];
  }

  async getById(id: string): Promise<Visit | null> {
    const { data, error } = await this.supabase
      .from('visits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Visit;
  }

  async create(visit: Partial<Visit>): Promise<Visit> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('visits')
      .insert({
        ...visit,
        company_id: user.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Visit;
  }

  async update(id: string, updates: Partial<Visit>): Promise<Visit> {
    const { data, error } = await this.supabase
      .from('visits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Visit;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('visits')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getByUser(userId: string): Promise<Visit[]> {
    const { data, error } = await this.supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId)
      .order('visit_date', { ascending: true })
      .order('visit_time', { ascending: true });

    if (error) throw error;
    return data as Visit[];
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Visit[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('visits')
      .select('*')
      .eq('company_id', user.company_id)
      .gte('visit_date', startDate)
      .lte('visit_date', endDate)
      .order('visit_date', { ascending: true })
      .order('visit_time', { ascending: true });

    if (error) throw error;
    return data as Visit[];
  }
}
