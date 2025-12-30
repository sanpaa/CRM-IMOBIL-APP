import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Owner } from '../models/owner.model';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<Owner[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('owners')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Owner[];
  }

  async getById(id: string): Promise<Owner | null> {
    const { data, error } = await this.supabase
      .from('owners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Owner;
  }

  async create(owner: Partial<Owner>): Promise<Owner> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('owners')
      .insert({
        ...owner,
        company_id: user.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Owner;
  }

  async update(id: string, updates: Partial<Owner>): Promise<Owner> {
    const { data, error } = await this.supabase
      .from('owners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Owner;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('owners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getByCpf(cpf: string): Promise<Owner | null> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('owners')
      .select('*')
      .eq('company_id', user.company_id)
      .eq('cpf', cpf)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data as Owner | null;
  }
}
