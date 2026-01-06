export type UserRole = 'admin' | 'gestor' | 'corretor';

export interface User {
  id: string;
  company_id: string;
  name: string;
  email: string;
  role: UserRole;
  creci?: string;
  phone?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
