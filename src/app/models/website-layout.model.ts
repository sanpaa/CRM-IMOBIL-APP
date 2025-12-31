export interface WebsiteLayout {
  id: string;
  company_id: string;
  name: string;
  page_type: 'home' | 'properties' | 'property-detail' | 'about' | 'contact' | 'custom';
  slug?: string;
  is_active: boolean;
  is_default: boolean;
  layout_config: LayoutConfig;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
}

export interface LayoutConfig {
  sections: LayoutSection[];
}

export interface LayoutSection {
  id: string;
  type: ComponentType;
  order: number;
  config?: any;
  style?: ComponentStyle;
}

export type ComponentType = 
  | 'header'
  | 'footer'
  | 'hero'
  | 'property-grid'
  | 'property-card'
  | 'search-bar'
  | 'contact-form'
  | 'testimonials'
  | 'about-section'
  | 'stats-section'
  | 'team-section'
  | 'map-section'
  | 'text-block'
  | 'image-gallery'
  | 'video-section'
  | 'cta-button'
  | 'divider'
  | 'spacer';

export interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  customCss?: string;
}
