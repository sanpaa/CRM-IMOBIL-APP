export interface WhatsAppConnection {
  id?: string;
  company_id: string;
  user_id: string;
  phone_number?: string;
  is_connected: boolean;
  qr_code?: string;
  session_data?: any;
  last_connected_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WhatsAppMessage {
  id?: string;
  connection_id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  is_group: boolean;
  contact_name?: string;
}

export interface WhatsAppConnectionStatus {
  is_connected: boolean;
  phone_number?: string;
  qr_code?: string;
  status: 'disconnected' | 'qr_ready' | 'connected' | 'connecting' | 'authenticating';
  message?: string;
}
