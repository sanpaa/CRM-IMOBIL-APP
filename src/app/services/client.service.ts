import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Client } from '../models/client.model';
import { Observable, from } from 'rxjs';
import { PaginatedResponse, PaginationParams } from '../models/pagination.model';

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

  async getFiltered(filters: {
    status?: string;
    assignedUserId?: string;
    searchTerm?: string;
  }): Promise<Client[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = this.supabase
      .from('clients')
      .select('*')
      .eq('company_id', user.company_id);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.assignedUserId) {
      query = query.eq('assigned_user_id', filters.assignedUserId);
    }

    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%,cpf.ilike.%${filters.searchTerm}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data as Client[];
  }

  async getClientsNeedingReminder(days: number): Promise<Client[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('clients')
      .select('*')
      .eq('company_id', user.company_id)
      .lt('last_status_change', cutoffDate.toISOString())
      .neq('status', 'cliente')
      .order('last_status_change', { ascending: true });

    if (error) throw error;
    return data as Client[];
  }

  /**
   * Get clients with comprehensive filters and pagination
   * Supports 7 filters: search, name, email, phone, companyId, createdAfter, createdBefore
   */
  async findPaginated(filters: {
    search?: string;
    name?: string;
    email?: string;
    phone?: string;
    companyId?: string;
    createdAfter?: string;
    createdBefore?: string;
    status?: string;
    assignedUserId?: string;
  } & PaginationParams): Promise<PaginatedResponse<Client>> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Build query for data with count
    let query = this.supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('company_id', filters.companyId || user.company_id);

    // Apply specific field filters
    if (filters.name) {
      query = query.ilike('name', `%${filters.name}%`);
    }

    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }

    if (filters.phone) {
      query = query.ilike('phone', `%${filters.phone}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.assignedUserId) {
      query = query.eq('assigned_user_id', filters.assignedUserId);
    }

    if (filters.createdAfter) {
      query = query.gte('created_at', filters.createdAfter);
    }

    if (filters.createdBefore) {
      query = query.lte('created_at', filters.createdBefore);
    }

    // General search across multiple fields
    // Note: Supabase properly escapes parameters, preventing SQL injection
    if (filters.search) {
      // Basic input validation: limit length and remove null bytes
      const sanitizedSearch = filters.search.slice(0, 100).replace(/\0/g, '');
      query = query.or(`name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%,phone.ilike.%${sanitizedSearch}%,cpf.ilike.%${sanitizedSearch}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Client[],
      total,
      page,
      totalPages
    };
  }
}
