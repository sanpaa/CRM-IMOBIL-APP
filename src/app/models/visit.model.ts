export interface Visit {
  id: string;
  company_id: string;
  client_id?: string;
  property_id?: string;
  user_id?: string;
  visit_date: string;
  visit_time: string;
  status?: string;
  notes?: string;
  created_at: string;
}
