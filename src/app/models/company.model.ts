export interface Company {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  active: boolean;
  custom_domain?: string;
  website_enabled?: boolean;
  website_published?: boolean;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  company_id: string;
  name: string;
  logo?: string;
  whatsapp?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  primary_color?: string;
  secondary_color?: string;
  layout_config?: any;
  theme_config?: ThemeConfig;
  social_links?: SocialLinks;
  business_hours?: BusinessHours;
  header_image?: string;
  footer_text?: string;
  show_properties_count?: boolean;
  contact_form_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  headerStyle?: 'modern' | 'classic' | 'minimal';
  fontFamily?: string;
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}
