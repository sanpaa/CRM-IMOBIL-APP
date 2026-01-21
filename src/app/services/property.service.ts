import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Property } from '../models/property.model';
import { PaginatedResponse, PaginationParams } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  private mapFromDb(row: any): Property {
    const {
      area_privativa,
      area_construtiva,
      area_terreno,
      total_area,
      built_area,
      dining_room,
      living_room,
      service_area,
      ...rest
    } = row || {};

    const resolvedAreaPrivativa = area_privativa ?? (rest as any).areaPrivativa ?? (rest as any).totalArea ?? (rest as any).area ?? total_area ?? null;
    const resolvedAreaConstrutiva = area_construtiva ?? (rest as any).areaConstrutiva ?? (rest as any).builtArea ?? built_area ?? null;
    const resolvedAreaTerreno = area_terreno ?? (rest as any).areaTerreno ?? null;
    const resolvedArea = (rest as any).area ?? total_area ?? area_privativa ?? null;

    return {
      ...(rest as Property),
      area: resolvedArea,
      areaPrivativa: resolvedAreaPrivativa,
      areaConstrutiva: resolvedAreaConstrutiva,
      areaTerreno: resolvedAreaTerreno,
      totalArea: total_area ?? (rest as any).totalArea ?? resolvedAreaPrivativa ?? null,
      builtArea: built_area ?? (rest as any).builtArea ?? resolvedAreaConstrutiva ?? null,
      diningRoom: dining_room ?? (rest as any).diningRoom ?? false,
      livingRoom: living_room ?? (rest as any).livingRoom ?? false,
      serviceArea: service_area ?? (rest as any).serviceArea ?? false
    };
  }

  private mapToDb(property: Partial<Property>): Record<string, unknown> {
    const {
      areaPrivativa,
      areaConstrutiva,
      areaTerreno,
      totalArea,
      builtArea,
      diningRoom,
      livingRoom,
      serviceArea,
      document_files,
      ...rest
    } = property as any;

    if (rest.owner_id === '') {
      rest.owner_id = null;
    }

    const resolvedAreaPrivativa = areaPrivativa ?? totalArea;
    const resolvedAreaConstrutiva = areaConstrutiva ?? builtArea;

    return {
      ...rest,
      ...(resolvedAreaPrivativa !== undefined ? { area_privativa: resolvedAreaPrivativa } : {}),
      ...(resolvedAreaConstrutiva !== undefined ? { area_construtiva: resolvedAreaConstrutiva } : {}),
      ...(areaTerreno !== undefined ? { area_terreno: areaTerreno } : {}),
      ...(diningRoom !== undefined ? { dining_room: diningRoom } : {}),
      ...(livingRoom !== undefined ? { living_room: livingRoom } : {}),
      ...(serviceArea !== undefined ? { service_area: serviceArea } : {})
    };
  }

  async getAll(): Promise<Property[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => this.mapFromDb(item));
  }

  async getById(id: string): Promise<Property | null> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? this.mapFromDb(data) : null;
  }

  async create(property: Partial<Property>): Promise<Property> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('properties')
      .insert({
        ...this.mapToDb(property),
        company_id: user.company_id
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDb(data);
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
      .update(this.mapToDb(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDb(data);
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
    return (data || []).map(item => this.mapFromDb(item));
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
    return (data || []).map(item => this.mapFromDb(item));
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
    return (data || []).map(item => this.mapFromDb(item));
  }

  /**
   * Get properties with comprehensive filters and pagination
   * Supports 16 filters:
   * - Location: state, neighborhood, city
   * - Property details: type, bedrooms, bathrooms, parking
   * - Area range: areaMin, areaMax
   * - Price range: priceMin, priceMax
   * - Boolean flags: sold, featured, furnished
   * - Status: status
   * - Text search: search (across title, description, street, neighborhood, city)
   * 
   * @param filters Object containing filter criteria and pagination params
   * @returns PaginatedResponse with data, total count, page number, and total pages
   */
  async findPaginated(filters: {
    type?: string;
    city?: string;
    state?: string;
    neighborhood?: string;
    bedrooms?: number;
    bathrooms?: number;
    parking?: number;
    areaMin?: number;
    areaMax?: number;
    priceMin?: number;
    priceMax?: number;
    sold?: boolean;
    featured?: boolean;
    furnished?: boolean;
    status?: string;
    search?: string;
  } & PaginationParams): Promise<PaginatedResponse<Property>> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    try {
      // Build query for data
      let query = this.supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('company_id', user.company_id);

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.state) {
        query = query.eq('state', filters.state);
      }

      if (filters.neighborhood) {
        query = query.eq('neighborhood', filters.neighborhood);
      }

      if (filters.bedrooms !== undefined) {
        query = query.eq('bedrooms', filters.bedrooms);
      }

      if (filters.bathrooms !== undefined) {
        query = query.eq('bathrooms', filters.bathrooms);
      }

      if (filters.parking !== undefined) {
        query = query.eq('parking', filters.parking);
      }

      if (filters.areaMin !== undefined) {
        query = query.gte('area_privativa', filters.areaMin);
      }

      if (filters.areaMax !== undefined) {
        query = query.lte('area_privativa', filters.areaMax);
      }

      if (filters.priceMin !== undefined) {
        query = query.gte('price', filters.priceMin);
      }

      if (filters.priceMax !== undefined) {
        query = query.lte('price', filters.priceMax);
      }

      if (filters.sold !== undefined) {
        query = query.eq('sold', filters.sold);
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters.furnished !== undefined) {
        query = query.eq('furnished', filters.furnished);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Text search across multiple fields including street
      // Note: Supabase properly escapes parameters, preventing SQL injection
      if (filters.search) {
        // Basic input validation: limit length and remove null bytes
        const sanitizedSearch = filters.search.slice(0, 100).replace(/\0/g, '');
        query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%,street.ilike.%${sanitizedSearch}%,neighborhood.ilike.%${sanitizedSearch}%,city.ilike.%${sanitizedSearch}%`);
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
        data: (data || []).map(item => this.mapFromDb(item)),
        total,
        page,
        totalPages
      };
    } catch (error) {
      // Fallback for offline mode with client-side filtering
      console.warn('Online query failed, attempting offline fallback:', error);
      
      const allProperties = await this.getAll();
      let filtered = allProperties;

      // Apply client-side filtering
      if (filters.type) {
        filtered = filtered.filter(p => p.type === filters.type);
      }
      if (filters.city) {
        filtered = filtered.filter(p => p.city === filters.city);
      }
      if (filters.state) {
        filtered = filtered.filter(p => p.state === filters.state);
      }
      if (filters.neighborhood) {
        filtered = filtered.filter(p => p.neighborhood === filters.neighborhood);
      }
      if (filters.bedrooms !== undefined) {
        filtered = filtered.filter(p => p.bedrooms === filters.bedrooms);
      }
      if (filters.bathrooms !== undefined) {
        filtered = filtered.filter(p => p.bathrooms === filters.bathrooms);
      }
      if (filters.parking !== undefined) {
        filtered = filtered.filter(p => p.parking === filters.parking);
      }
      if (filters.areaMin !== undefined) {
        filtered = filtered.filter(p => {
          const areaValue = p.areaPrivativa ?? p.area;
          return areaValue != null && areaValue >= (filters.areaMin as number);
        });
      }
      if (filters.areaMax !== undefined) {
        filtered = filtered.filter(p => {
          const areaValue = p.areaPrivativa ?? p.area;
          return areaValue != null && areaValue <= (filters.areaMax as number);
        });
      }
      if (filters.priceMin !== undefined) {
        filtered = filtered.filter(p => p.price >= (filters.priceMin as number));
      }
      if (filters.priceMax !== undefined) {
        filtered = filtered.filter(p => p.price <= (filters.priceMax as number));
      }
      if (filters.sold !== undefined) {
        filtered = filtered.filter(p => p.sold === filters.sold);
      }
      if (filters.featured !== undefined) {
        filtered = filtered.filter(p => p.featured === filters.featured);
      }
      if (filters.furnished !== undefined) {
        filtered = filtered.filter(p => p.furnished === filters.furnished);
      }
      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.title?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.street?.toLowerCase().includes(searchLower) ||
          p.neighborhood?.toLowerCase().includes(searchLower) ||
          p.city?.toLowerCase().includes(searchLower)
        );
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedData = filtered.slice(offset, offset + limit);

      return {
        data: paginatedData,
        total,
        page,
        totalPages
      };
    }
  }
}
