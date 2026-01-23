import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutSection } from '../../models/website-layout.model';
import { ComponentRegistryService } from '../website-components/component-registry.service';
import { ConfigSchemaField, ComponentMetadata } from '../website-components/component-base.interface';

/**
 * Auto-generated property editor for website components
 * Generates form fields based on component metadata schemas
 */
@Component({
  selector: 'app-property-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-editor.component.html',
  styleUrls: ['./property-editor.component.scss']
})
export class PropertyEditorComponent implements OnInit, OnChanges {
  @Input() section!: LayoutSection;
  @Output() configChange = new EventEmitter<any>();
  @Output() styleChange = new EventEmitter<any>();

  metadata: ComponentMetadata | undefined;
  configFields: ConfigSchemaField[] = [];
  styleFields: ConfigSchemaField[] = [];
  activeTab: 'content' | 'style' | 'responsive' = 'content';

  constructor(private registry: ComponentRegistryService) {}

  ngOnInit(): void {
    this.loadMetadata();
  }

  ngOnChanges(): void {
    this.loadMetadata();
  }

  private loadMetadata(): void {
    if (!this.section) return;
    
    this.metadata = this.registry.getMetadata(this.section.type);
    if (this.metadata) {
      this.configFields = this.metadata.schema.fields || [];
      this.styleFields = this.metadata.schema.styleFields || [];
      this.activeTab = 'content';
    }
  }

  setTab(tab: 'content' | 'style' | 'responsive') {
    this.activeTab = tab;
  }

  updateConfig(key: string, value: any): void {
    if (!this.section.config) {
      this.section.config = {};
    }
    this.section.config[key] = value;
    this.configChange.emit(this.section.config);
  }

  updateStyle(key: string, value: any): void {
    if (!this.section.style) {
      this.section.style = {};
    }
    (this.section.style as any)[key] = value;
    this.styleChange.emit(this.section.style);
  }

  getConfigValue(key: string): any {
    return this.section.config?.[key];
  }

  getStyleValue(key: string): any {
    return (this.section.style as any)?.[key];
  }

  getFieldValue(field: ConfigSchemaField, isStyle: boolean = false): any {
    const value = isStyle ? this.getStyleValue(field.key) : this.getConfigValue(field.key);
    let finalValue = value !== undefined && value !== null ? value : field.defaultValue;
    
    if (field.type === 'array' && !Array.isArray(finalValue)) {
      finalValue = [];
    }

    // Fix: input type="color" doesn't accept "transparent", convert to white
    if (field.type === 'color' && (finalValue === 'transparent' || !finalValue)) {
      finalValue = '#ffffff';
    }
    
    return finalValue;
  }

  onFieldChange(field: ConfigSchemaField, event: any, isStyle: boolean = false): void {
    let value: any;

    switch (field.type) {
      case 'checkbox':
        value = event.target.checked;
        break;
      case 'number':
        value = parseFloat(event.target.value);
        break;
      default:
        value = event.target.value;
    }

    if (isStyle) {
      this.updateStyle(field.key, value);
    } else {
      this.updateConfig(field.key, value);
    }
  }

  trackByKey(index: number, field: ConfigSchemaField): string {
    return field.key;
  }

  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Normalize options to always return array of objects with label and value
   */
  normalizeOptions(options: Array<{ label: string; value: any }> | string[] | undefined): Array<{ label: string; value: any }> {
    if (!options) return [];
    
    // Se já é um array de objetos, retorna como está
    if (options.length > 0 && typeof options[0] === 'object' && 'label' in options[0]) {
      return options as Array<{ label: string; value: any }>;
    }
    
    // Se é array de strings, converte para array de objetos
    return (options as string[]).map(opt => ({
      label: opt,
      value: opt
    }));
  }

  /**
   * Get schema fields for array items
   */
  getArraySchemaFields(field: ConfigSchemaField): Array<{ key: string; label: string; type: string }> {
    if (!field.schema) return [];
    return Object.keys(field.schema).map(key => ({
      key,
      label: field.schema![key].label || key,
      type: field.schema![key].type || 'text'
    }));
  }

  /**
   * Add new item to array
   */
  addArrayItem(field: ConfigSchemaField): void {
    const currentValue = this.getFieldValue(field) || [];
    const newItem: any = {};
    
    // Initialize with empty values based on schema
    if (field.schema) {
      Object.keys(field.schema).forEach(key => {
        newItem[key] = '';
      });
    }
    
    this.updateConfig(field.key, [...currentValue, newItem]);
  }

  /**
   * Remove item from array
   */
  removeArrayItem(field: ConfigSchemaField, index: number): void {
    const currentValue = this.getFieldValue(field) || [];
    const newValue = currentValue.filter((_: any, i: number) => i !== index);
    this.updateConfig(field.key, newValue);
  }

  /**
   * Update specific field in array item
   */
  updateArrayItem(field: ConfigSchemaField, index: number, subKey: string, value: any): void {
    const currentValue = this.getFieldValue(field) || [];
    const newValue = [...currentValue];
    newValue[index] = { ...newValue[index], [subKey]: value };
    this.updateConfig(field.key, newValue);
  }

  onArrayItemInput(field: ConfigSchemaField): void {
    const currentValue = this.getFieldValue(field) || [];
    this.updateConfig(field.key, currentValue);
  }
}
