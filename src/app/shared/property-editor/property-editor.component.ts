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
    }
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
    return value !== undefined && value !== null ? value : field.defaultValue;
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
}
