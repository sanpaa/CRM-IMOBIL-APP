import { ComponentType, ComponentStyle } from './website-layout.model';

export interface WebsiteComponent {
  id: string;
  company_id: string;
  name: string;
  component_type: ComponentType;
  config: ComponentConfig;
  style_config: ComponentStyle;
  is_reusable: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComponentConfig {
  [key: string]: any;
}

// Specific component configurations
export interface HeroConfig {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  buttonText?: string;
  buttonLink?: string;
  height?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
}

export interface PropertyGridConfig {
  limit?: number;
  showFeatured?: boolean;
  columns?: number;
  showFilters?: boolean;
  sortBy?: 'price' | 'date' | 'featured';
  propertyTypes?: string[];
}

export interface SearchBarConfig {
  fields?: ('type' | 'city' | 'priceRange' | 'bedrooms' | 'bathrooms')[];
  placeholder?: string;
  buttonText?: string;
  orientation?: 'horizontal' | 'vertical';
}

export interface ContactFormConfig {
  fields?: ('name' | 'email' | 'phone' | 'message' | 'subject')[];
  submitText?: string;
  showWhatsApp?: boolean;
  whatsappNumber?: string;
  emailTo?: string;
}

export interface TextBlockConfig {
  title?: string;
  content: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  maxWidth?: string;
}

export interface ImageGalleryConfig {
  images: GalleryImage[];
  layout?: 'grid' | 'carousel' | 'masonry';
  columns?: number;
  showCaptions?: boolean;
}

export interface GalleryImage {
  url: string;
  caption?: string;
  alt?: string;
}

export interface StatsConfig {
  stats: Stat[];
  layout?: 'horizontal' | 'grid';
}

export interface Stat {
  label: string;
  value: string | number;
  icon?: string;
}

export interface FAQConfig {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FeaturesGridConfig {
  title?: string;
  subtitle?: string;
  features: Feature[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface NewsletterConfig {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
}

export interface MortgageCalculatorConfig {
  title?: string;
  subtitle?: string;
  defaultInterestRate?: number;
  defaultTermYears?: number;
}
