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
  // Populated data for display
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  property?: {
    id: string;
    title: string;
    type: string;
    price: number;
    city?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
