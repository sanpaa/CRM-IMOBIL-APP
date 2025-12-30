export interface Client {
  id: string;
  company_id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  origin?: string;
  status?: string;
  notes?: string;
  assigned_user_id?: string;
  created_at: string;
  updated_at: string;
}
