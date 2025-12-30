export interface Company {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  active: boolean;
  created_at: string;
}
