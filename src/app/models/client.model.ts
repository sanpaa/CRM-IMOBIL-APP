export interface Client {
  id: string;
  company_id: string;
  name: string;
  cpf?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  origin?: string;
  status?: string;
  interest?: string;
  notes?: string;
  assigned_user_id?: string;
  last_status_change?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  company_id: string;
  user_id?: string;
  note: string;
  created_at: string;
}
