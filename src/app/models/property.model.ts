export interface Property {
  id: string;
  company_id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking?: number;
  image_url?: string;
  image_urls?: string[];
  video_urls?: string[];
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  contact: string;
  featured?: boolean;
  sold?: boolean;
  created_at: string;
  updated_at: string;
}
