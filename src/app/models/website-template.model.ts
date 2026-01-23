export interface WebsiteTemplate {
  id: string;
  name: string;
  page_type: 'home' | 'properties' | 'property-detail' | 'about' | 'contact' | 'custom';
  html?: string;
  css?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
}
