export interface ActivityLog {
  id: string;
  company_id: string;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  description?: string;
  user_id?: string;
  created_at: string;
}
