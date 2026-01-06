export interface Visit {
  id: string;
  company_id: string;
  client_id?: string;
  property_id?: string;
  user_id?: string;
  broker_id?: string;
  owner_id?: string;
  visit_date: string;
  visit_time: string;
  status?: string;
  notes?: string;
  created_at: string;
}

export interface VisitProperty {
  id?: string;
  visit_id?: string;
  property_reference?: string;
  full_address?: string;
  development?: string;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parking_spaces?: number;
  total_area?: number;
  built_area?: number;
  suggested_sale_value?: number;
  created_at?: string;
}

export type InterestLevel = 'DESCARTOU' | 'INTERESSOU' | 'INTERESSOU_E_ASSINOU_PROPOSTA';

export interface VisitEvaluation {
  id?: string;
  visit_id?: string;
  property_id?: string;
  conservation_state?: number;
  location_rating?: number;
  property_value_rating?: number;
  interest_level?: InterestLevel;
  created_at?: string;
}

export interface VisitWithDetails extends Visit {
  properties?: VisitProperty[];
  evaluations?: VisitEvaluation[];
  client_name?: string;
  broker_name?: string;
  broker_creci?: string;
  broker_phone?: string;
  owner_name?: string;
  company_name?: string;
  company_creci?: string;
  company_address?: string;
  company_phone?: string;
  company_logo_url?: string;
}
