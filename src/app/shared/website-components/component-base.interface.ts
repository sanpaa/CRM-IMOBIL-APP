/**
 * Base interface for all website components
 * Components implement this to support both CRM edit mode and public display
 */
export interface WebsiteComponentBase {
  /**
   * Indicates if component is in edit mode (CRM) or display mode (public site)
   */
  editMode: boolean;

  /**
   * Component configuration data
   */
  config: any;

  /**
   * Component style configuration
   */
  style?: ComponentStyle;

  /**
   * Section ID for tracking
   */
  sectionId?: string;
}

/**
 * Component style configuration
 */
export interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  customCss?: string;
}

/**
 * Configuration field types for auto-generating property editors
 */
export type ConfigFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'color'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'image-url'
  | 'link'
  | 'array'
  | 'object';

/**
 * Configuration schema field definition
 */
export interface ConfigSchemaField {
  key: string;
  label: string;
  type: ConfigFieldType;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
  required?: boolean;
  
  // For array/object types
  fields?: ConfigSchemaField[];
}

/**
 * Component configuration schema
 * Used to auto-generate property editor panels
 */
export interface ComponentConfigSchema {
  fields: ConfigSchemaField[];
  styleFields?: ConfigSchemaField[];
}

/**
 * Component metadata for the component library
 */
export interface ComponentMetadata {
  type: string;
  label: string;
  icon: string;
  category: 'navigation' | 'content' | 'properties' | 'forms' | 'media' | 'layout';
  description: string;
  schema: ComponentConfigSchema;
  defaultConfig: any;
  defaultStyle?: ComponentStyle;
}
