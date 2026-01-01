import { Injectable, Type } from '@angular/core';
import { ComponentMetadata } from './component-base.interface';

/**
 * Central registry for all website components
 * Maps component types to their Angular component classes and metadata
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentRegistryService {
  private registry = new Map<string, {
    component: Type<any>;
    metadata: ComponentMetadata;
  }>();

  constructor() {
    // Components will be registered during initialization
  }

  /**
   * Register a component with its metadata
   */
  register(componentType: string, component: Type<any>, metadata: ComponentMetadata): void {
    this.registry.set(componentType, { component, metadata });
  }

  /**
   * Get component class by type
   */
  getComponent(componentType: string): Type<any> | undefined {
    return this.registry.get(componentType)?.component;
  }

  /**
   * Get component metadata by type
   */
  getMetadata(componentType: string): ComponentMetadata | undefined {
    return this.registry.get(componentType)?.metadata;
  }

  /**
   * Get all registered component types
   */
  getAllTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get all component metadata for the component library
   */
  getAllMetadata(): ComponentMetadata[] {
    return Array.from(this.registry.values()).map(entry => entry.metadata);
  }

  /**
   * Check if a component type is registered
   */
  has(componentType: string): boolean {
    return this.registry.has(componentType);
  }

  /**
   * Get components by category
   */
  getByCategory(category: string): ComponentMetadata[] {
    return this.getAllMetadata().filter(meta => meta.category === category);
  }
}
