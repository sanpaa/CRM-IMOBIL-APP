import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Visit, VisitProperty, VisitEvaluation, VisitWithDetails } from '../models/visit.model';

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
    let client_name, broker_name, owner_name;

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
        .select('name, email')
        .eq('id', visit.broker_id)
        .single();
      broker_name = broker?.name || broker?.email;
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
      owner_name
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
}
