export interface Deal {
  id: string;
  company_id: string;
  client_id?: string;
  property_id?: string;
  user_id?: string;
  proposed_value?: number;
  status?: string;
  created_at: string;
  closed_at?: string;
}
