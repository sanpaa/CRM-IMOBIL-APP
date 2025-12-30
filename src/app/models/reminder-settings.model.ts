export interface ReminderSettings {
  id: string;
  company_id: string;
  days_without_change: number;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  created_at: string;
  updated_at: string;
}
