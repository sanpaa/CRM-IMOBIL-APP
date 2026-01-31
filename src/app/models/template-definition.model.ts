export type SectionType = 'header' | 'hero' | 'features' | 'imoveis' | 'cta' | 'footer';

export interface TemplateTheme {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
  fontTitle: string;
  fontBody: string;
}

export interface TemplateSection {
  type: SectionType;
  variant?: string;
  config?: Record<string, any>;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  preview: string;
  theme: TemplateTheme;
  sections: TemplateSection[];
}
