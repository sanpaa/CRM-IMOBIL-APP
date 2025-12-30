export interface Notification {
  id: string;
  company_id: string;
  user_id?: string;
  title?: string;
  message?: string;
  read: boolean;
  created_at: string;
}
