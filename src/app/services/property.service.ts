import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getAll(): Promise<Property[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Property[];
  }

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Property;
  }

  async create(property: Partial<Property>): Promise<Property> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('properties')
      .insert({
        ...property,
        company_id: user.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Property;
  }

  async update(id: string, updates: Partial<Property>): Promise<Property> {
    const { data, error } = await this.supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Property;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getByOwner(ownerId: string): Promise<Property[]> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('owner_client_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Property[];
  }

  async getByStatus(status: string): Promise<Property[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('company_id', user.company_id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Property[];
  }
}
