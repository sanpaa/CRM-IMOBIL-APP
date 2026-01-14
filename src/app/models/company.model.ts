export interface Company {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  creci?: string;
  address?: string;
  logo_url?: string;
  active: boolean;
  custom_domain?: string;
  website_enabled?: boolean;
  website_published?: boolean;
  header_config?: HeaderConfig;
  footer_config?: FooterConfig;
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
  header_config?: HeaderConfig;
  footer_config?: FooterConfig;
  show_properties_count?: boolean;
  contact_form_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeaderConfig {
  companyName?: string;
  logoUrl?: string;              // URL da logo
  showLogo: boolean;             // Mostrar/esconder logo
  showMenu: boolean;             // Mostrar/esconder menu de navegação
  phone?: string;
  navigation?: Array<{ label: string; link: string }>;
  backgroundColor?: string;
  textColor?: string;
}

export interface FooterConfig {
  companyName: string;           // Nome da empresa (FIXO)
  description?: string;          // Descrição abaixo do nome (editável)
  logoUrl?: string;              // URL da logo
  showLogo: boolean;             // Mostrar/esconder logo
  
  // Informações de contato
  address?: string;
  phone?: string;
  email?: string;
  
  // Redes sociais (só aparecem se tiverem valor)
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  
  // Links rápidos (editável)
  quickLinks?: FooterLink[];
  
  // Serviços (editável)
  services?: FooterLink[];
  
  showCopyright: boolean;        // Mostrar/esconder copyright
  backgroundColor?: string;
  textColor?: string;
}

export interface FooterLink {
  label: string;
  route: string;
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
