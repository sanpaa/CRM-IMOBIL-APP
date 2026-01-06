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

  async uploadDocument(file: File, propertyId: string): Promise<string> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Validate file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt) {
      throw new Error(`Arquivo "${file.name}" não possui extensão válida`);
    }

    const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.company_id}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from('property-documents')
      .upload(filePath, file);

    if (error) throw error;
    
    // Validate upload was successful
    if (!data || !data.path) {
      throw new Error(`Falha ao fazer upload do arquivo "${file.name}"`);
    }

    const { data: urlData } = this.supabase.storage
      .from('property-documents')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async uploadDocuments(files: File[], propertyId: string): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadDocument(file, propertyId));
    return Promise.all(uploadPromises);
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

  /**
   * Get properties by owner ID
   * Note: Field name changed from 'owner_client_id' to 'owner_id' 
   * to align with the new owners table structure
   */
  async getByOwner(ownerId: string): Promise<Property[]> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
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

  async getFiltered(filters: {
    type?: string;
    city?: string;
    sold?: boolean;
    featured?: boolean;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Property[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = this.supabase
      .from('properties')
      .select('*')
      .eq('company_id', user.company_id);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.sold !== undefined) {
      query = query.eq('sold', filters.sold);
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,street.ilike.%${filters.searchTerm}%,neighborhood.ilike.%${filters.searchTerm}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data as Property[];
  }
}
