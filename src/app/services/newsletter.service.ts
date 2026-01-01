import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  company_id: string;
  source?: string;
  active?: boolean;
  metadata?: any;
  subscribed_at?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Subscribe to newsletter
   */
  async subscribe(email: string, companyId: string, source: string = 'website'): Promise<any> {
    try {
      const { data, error } = await this.supabase.client
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          company_id: companyId,
          source: source,
          active: true
        })
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          return {
            success: false,
            message: 'Este email já está cadastrado na newsletter'
          };
        }
        throw error;
      }

      return {
        success: true,
        message: 'Inscrição realizada com sucesso! Obrigado por se inscrever.',
        data
      };
    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error);
      return {
        success: false,
        message: 'Erro ao realizar inscrição. Tente novamente mais tarde.',
        error
      };
    }
  }

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribe(email: string, companyId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.client
        .from('newsletter_subscribers')
        .update({ active: false })
        .eq('email', email.toLowerCase().trim())
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Você foi descadastrado da newsletter com sucesso.',
        data
      };
    } catch (error: any) {
      console.error('Error unsubscribing from newsletter:', error);
      return {
        success: false,
        message: 'Erro ao realizar descadastro.',
        error
      };
    }
  }

  /**
   * Get all subscribers for a company (Admin only)
   */
  async getSubscribers(companyId: string, activeOnly: boolean = true): Promise<NewsletterSubscriber[]> {
    try {
      let query = this.supabase.client
        .from('newsletter_subscribers')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting newsletter subscribers:', error);
      return [];
    }
  }

  /**
   * Get subscriber count for a company
   */
  async getSubscriberCount(companyId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase.client
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('active', true);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting subscriber count:', error);
      return 0;
    }
  }

  /**
   * Check if email is already subscribed
   */
  async isSubscribed(email: string, companyId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.client
        .from('newsletter_subscribers')
        .select('id, active')
        .eq('email', email.toLowerCase().trim())
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;

      return data?.active === true;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Update subscriber metadata
   */
  async updateMetadata(subscriberId: string, metadata: any): Promise<any> {
    try {
      const { data, error } = await this.supabase.client
        .from('newsletter_subscribers')
        .update({ metadata })
        .eq('id', subscriberId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating subscriber metadata:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete subscriber permanently (Admin only)
   */
  async deleteSubscriber(subscriberId: string): Promise<any> {
    try {
      const { error } = await this.supabase.client
        .from('newsletter_subscribers')
        .delete()
        .eq('id', subscriberId);

      if (error) throw error;

      return { success: true, message: 'Subscriber deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting subscriber:', error);
      return { success: false, error };
    }
  }

  /**
   * Export subscribers to CSV (Admin only)
   */
  async exportToCSV(companyId: string): Promise<string> {
    try {
      const subscribers = await this.getSubscribers(companyId, false);

      if (subscribers.length === 0) {
        return '';
      }

      // CSV Header
      const headers = ['Email', 'Source', 'Active', 'Subscribed At'];
      const csvRows = [headers.join(',')];

      // CSV Rows
      subscribers.forEach(sub => {
        const row = [
          sub.email,
          sub.source || 'website',
          sub.active ? 'Yes' : 'No',
          sub.subscribed_at || ''
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      return '';
    }
  }
}
