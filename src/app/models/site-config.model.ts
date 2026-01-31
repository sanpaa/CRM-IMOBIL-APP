export interface SiteConfig {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  whatsapp: string;
  whatsappLink?: string;
  heroTitle: string;
  heroText: string;
  heroSubtitle?: string;
  aboutText: string;
  contactText: string;
  footerTagline?: string;
  footerText?: string;
  footerLinksTitle?: string;
  footerBadge?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  linkedin?: string;
}

export interface SimpleSiteLayoutConfig {
  version: number;
  templateId: string;
  config: SiteConfig;
}
