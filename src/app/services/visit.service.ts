import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Visit, VisitProperty, VisitEvaluation, VisitWithDetails } from '../models/visit.model';
import { HeaderConfig } from '../models/company.model';
import { PaginatedResponse, PaginationParams } from '../models/pagination.model';

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

  // ====== Visit Properties Management ======

  async getVisitWithDetails(visitId: string): Promise<VisitWithDetails | null> {
    // Get base visit data
    const visit = await this.getById(visitId);
    if (!visit) return null;

    // Get properties
    const properties = await this.getVisitProperties(visitId);

    // Get evaluations
    const evaluations = await this.getVisitEvaluations(visitId);

    // Get related names
    let client_name, broker_name, broker_creci, broker_phone, owner_name;
    let company_name, company_creci, company_address, company_phone, company_logo_url;

    // Get company information
    const { data: company } = await this.supabase
      .from('companies')
      .select('name, creci, address, phone, logo_url, header_config')
      .eq('id', visit.company_id)
      .single();
    
    if (company) {
      company_name = company.name;
      company_creci = company.creci;
      company_address = company.address;
      company_phone = company.phone;
      // Prioritize logo from header_config (settings), fallback to logo_url
      const headerConfig = company.header_config as HeaderConfig | null;
      company_logo_url = headerConfig?.logoUrl || company.logo_url;
    }

    if (visit.client_id) {
      const { data: client } = await this.supabase
        .from('clients')
        .select('name')
        .eq('id', visit.client_id)
        .single();
      client_name = client?.name;
    }

    if (visit.broker_id) {
      const { data: broker } = await this.supabase
        .from('users')
        .select('name, email, creci, phone')
        .eq('id', visit.broker_id)
        .single();
      broker_name = broker?.name || broker?.email;
      broker_creci = broker?.creci;
      broker_phone = broker?.phone;
    }

    if (visit.owner_id) {
      const { data: owner } = await this.supabase
        .from('clients')
        .select('name')
        .eq('id', visit.owner_id)
        .single();
      owner_name = owner?.name;
    }

    return {
      ...visit,
      properties,
      evaluations,
      client_name,
      broker_name,
      broker_creci,
      broker_phone,
      owner_name,
      company_name,
      company_creci,
      company_address,
      company_phone,
      company_logo_url
    } as VisitWithDetails;
  }

  async getVisitProperties(visitId: string): Promise<VisitProperty[]> {
    const { data, error } = await this.supabase
      .from('visit_properties')
      .select('*')
      .eq('visit_id', visitId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as VisitProperty[];
  }

  async addVisitProperty(property: VisitProperty): Promise<VisitProperty> {
    const { data, error } = await this.supabase
      .from('visit_properties')
      .insert(property)
      .select()
      .single();

    if (error) throw error;
    return data as VisitProperty;
  }

  async updateVisitProperty(id: string, updates: Partial<VisitProperty>): Promise<VisitProperty> {
    const { data, error } = await this.supabase
      .from('visit_properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VisitProperty;
  }

  async deleteVisitProperty(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('visit_properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ====== Visit Evaluations Management ======

  async getVisitEvaluations(visitId: string): Promise<VisitEvaluation[]> {
    const { data, error } = await this.supabase
      .from('visit_evaluations')
      .select('*')
      .eq('visit_id', visitId);

    if (error) throw error;
    return data as VisitEvaluation[];
  }

  async addVisitEvaluation(evaluation: VisitEvaluation): Promise<VisitEvaluation> {
    const { data, error } = await this.supabase
      .from('visit_evaluations')
      .insert(evaluation)
      .select()
      .single();

    if (error) throw error;
    return data as VisitEvaluation;
  }

  async updateVisitEvaluation(id: string, updates: Partial<VisitEvaluation>): Promise<VisitEvaluation> {
    const { data, error } = await this.supabase
      .from('visit_evaluations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VisitEvaluation;
  }

  async deleteVisitEvaluation(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('visit_evaluations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get visits with comprehensive filters and optional pagination
   * Supports 9 filters: search, status, dateFrom, dateTo, client, broker, owner, propertyCode, imobiliaria
   * If no page/limit params, returns all visits matching filters
   */
  async findPaginated(filters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    client?: string;
    broker?: string;
    owner?: string;
    propertyCode?: string;
    imobiliaria?: string;
  } & PaginationParams): Promise<PaginatedResponse<Visit> | Visit[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Check if pagination is requested
    const isPaginated = filters.page !== undefined || filters.limit !== undefined;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Build query
    let query = this.supabase
      .from('visits')
      .select('*', { count: 'exact' })
      .eq('company_id', filters.imobiliaria || user.company_id);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
      query = query.gte('visit_date', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('visit_date', filters.dateTo);
    }

    if (filters.client) {
      query = query.eq('client_id', filters.client);
    }

    if (filters.broker) {
      query = query.eq('broker_id', filters.broker);
    }

    if (filters.owner) {
      query = query.eq('owner_id', filters.owner);
    }

    if (filters.propertyCode) {
      query = query.eq('property_id', filters.propertyCode);
    }

    // Text search across notes
    if (filters.search) {
      query = query.ilike('notes', `%${filters.search}%`);
    }

    // Apply ordering
    query = query
      .order('visit_date', { ascending: false })
      .order('visit_time', { ascending: false });

    // Apply pagination if requested
    if (isPaginated) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // If pagination not requested, return all data
    if (!isPaginated) {
      return data as Visit[];
    }

    // Return paginated response
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Visit[],
      total,
      page,
      totalPages
    };
  }
}
