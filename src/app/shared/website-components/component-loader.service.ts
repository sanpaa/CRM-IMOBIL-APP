import { Injectable, ComponentRef, ViewContainerRef, Type, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { ComponentRegistryService } from './component-registry.service';
import { LayoutSection } from '../../models/website-layout.model';

/**
 * Service for dynamically loading and rendering website components
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentLoaderService {
  constructor(
    private registry: ComponentRegistryService,
    private injector: EnvironmentInjector
  ) {}

  /**
   * Load a component into a container
   */
  loadComponent(
    container: ViewContainerRef,
    section: LayoutSection,
    editMode: boolean = false
  ): ComponentRef<any> | null {
    const componentType = this.registry.getComponent(section.type);
    
    if (!componentType) {
      console.warn(`Component type '${section.type}' not found in registry`);
      return null;
    }

    // Clear the container
    container.clear();

    // Create the component
    const componentRef = container.createComponent(componentType, {
      environmentInjector: this.injector
    });

    // Set component inputs
    const instance = componentRef.instance;
    instance.editMode = editMode;
    instance.config = section.config || {};
    instance.style = section.style;
    instance.sectionId = section.id;

    // Trigger change detection
    componentRef.changeDetectorRef.detectChanges();

    return componentRef;
  }

  /**
   * Load multiple components into a container
   */
  loadComponents(
    container: ViewContainerRef,
    sections: LayoutSection[],
    editMode: boolean = false
  ): ComponentRef<any>[] {
    container.clear();
    
    return sections
      .sort((a, b) => a.order - b.order)
      .map(section => this.loadComponent(container, section, editMode))
      .filter(ref => ref !== null) as ComponentRef<any>[];
  }

  /**
   * Update a component's configuration
   */
  updateComponent(
    componentRef: ComponentRef<any>,
    section: LayoutSection
  ): void {
    const instance = componentRef.instance;
    instance.config = section.config || {};
    instance.style = section.style;
    componentRef.changeDetectorRef.detectChanges();
  }
}
