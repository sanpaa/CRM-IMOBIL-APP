import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  constructor(private supabase: SupabaseService) {}

  async getById(id: string): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Company;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }
}
