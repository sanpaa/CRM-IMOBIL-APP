import { Injectable } from '@angular/core';
import { ComponentRegistryService } from './component-registry.service';

// Import all components
import { HeroComponent } from './hero/hero.component';
import { HeaderComponent } from './header/header.component';
import { PropertyGridComponent } from './property-grid/property-grid.component';
import { TextBlockComponent } from './text-block/text-block.component';
import { FooterComponent } from './footer/footer.component';
import { DividerComponent } from './divider/divider.component';
import { SpacerComponent } from './spacer/spacer.component';

// Import all metadata
import { HERO_METADATA } from './hero/hero.metadata';
import { HEADER_METADATA } from './header/header.metadata';
import { PROPERTY_GRID_METADATA } from './property-grid/property-grid.metadata';
import { TEXT_BLOCK_METADATA } from './text-block/text-block.metadata';
import { FOOTER_METADATA } from './footer/footer.metadata';
import { DIVIDER_METADATA } from './divider/divider.metadata';
import { SPACER_METADATA } from './spacer/spacer.metadata';

/**
 * Service to initialize and register all website components
 * This should be called during app initialization
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentInitializerService {
  constructor(private registry: ComponentRegistryService) {}

  /**
   * Register all components with the registry
   * Call this once during app initialization
   */
  initializeComponents(): void {
    // Register all components
    this.registry.register('header', HeaderComponent, HEADER_METADATA);
    this.registry.register('hero', HeroComponent, HERO_METADATA);
    this.registry.register('property-grid', PropertyGridComponent, PROPERTY_GRID_METADATA);
    this.registry.register('text-block', TextBlockComponent, TEXT_BLOCK_METADATA);
    this.registry.register('footer', FooterComponent, FOOTER_METADATA);
    this.registry.register('divider', DividerComponent, DIVIDER_METADATA);
    this.registry.register('spacer', SpacerComponent, SPACER_METADATA);

    console.log(`✅ Registered ${this.registry.getAllTypes().length} website components`);
  }

  /**
   * Get all registered component types
   */
  getRegisteredTypes(): string[] {
    return this.registry.getAllTypes();
  }
}
