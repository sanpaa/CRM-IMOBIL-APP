import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ClientNote } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientNoteService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async getByClientId(clientId: string): Promise<ClientNote[]> {
    const { data, error } = await this.supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ClientNote[];
  }

  async create(clientId: string, note: string): Promise<ClientNote> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('client_notes')
      .insert({
        client_id: clientId,
        company_id: user.company_id,
        user_id: user.id,
        note: note
      })
      .select()
      .single();

    if (error) throw error;
    return data as ClientNote;
  }

  // Notes are immutable - no update or delete methods
}
