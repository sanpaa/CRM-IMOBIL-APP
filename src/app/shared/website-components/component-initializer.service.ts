import { Injectable } from '@angular/core';
import { ComponentRegistryService } from './component-registry.service';

// Import all components
import { HeroComponent } from './hero/hero.component';
import { HeaderComponent } from './header/header.component';
import { PropertyGridComponent } from './property-grid/property-grid.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { TextBlockComponent } from './text-block/text-block.component';
import { FooterComponent } from './footer/footer.component';
import { DividerComponent } from './divider/divider.component';
import { SpacerComponent } from './spacer/spacer.component';
import { FAQComponent } from './faq/faq.component';
import { FeaturesGridComponent } from './features-grid/features-grid.component';
import { NewsletterComponent } from './newsletter/newsletter.component';
import { MortgageCalculatorComponent } from './mortgage-calculator/mortgage-calculator.component';
import { CustomCodeComponent } from './custom-code/custom-code.component';
import { StatsSectionComponent } from './stats-section/stats-section.component';
import { AboutSectionComponent } from './about-section/about-section.component';
import { CtaButtonComponent } from './cta-button/cta-button.component';

// Import all metadata
import { HERO_METADATA } from './hero/hero.metadata';
import { HEADER_METADATA } from './header/header.metadata';
import { PROPERTY_GRID_METADATA } from './property-grid/property-grid.metadata';
import { SEARCH_BAR_METADATA } from './search-bar/search-bar.metadata';
import { TEXT_BLOCK_METADATA } from './text-block/text-block.metadata';
import { FOOTER_METADATA } from './footer/footer.metadata';
import { DIVIDER_METADATA } from './divider/divider.metadata';
import { SPACER_METADATA } from './spacer/spacer.metadata';
import { FAQ_METADATA } from './faq/faq.metadata';
import { FEATURES_GRID_METADATA } from './features-grid/features-grid.metadata';
import { NEWSLETTER_METADATA } from './newsletter/newsletter.metadata';
import { MORTGAGE_CALCULATOR_METADATA } from './mortgage-calculator/mortgage-calculator.metadata';
import { CUSTOM_CODE_METADATA } from './custom-code/custom-code.metadata';
import { STATS_SECTION_METADATA } from './stats-section/stats-section.metadata';
import { ABOUT_SECTION_METADATA } from './about-section/about-section.metadata';
import { CTA_BUTTON_METADATA } from './cta-button/cta-button.metadata';

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
    this.registry.register('search-bar', SearchBarComponent, SEARCH_BAR_METADATA);
    this.registry.register('property-grid', PropertyGridComponent, PROPERTY_GRID_METADATA);
    this.registry.register('text-block', TextBlockComponent, TEXT_BLOCK_METADATA);
    this.registry.register('footer', FooterComponent, FOOTER_METADATA);
    this.registry.register('divider', DividerComponent, DIVIDER_METADATA);
    this.registry.register('spacer', SpacerComponent, SPACER_METADATA);
    
    // Register content components
    this.registry.register('faq', FAQComponent, FAQ_METADATA);
    this.registry.register('features-grid', FeaturesGridComponent, FEATURES_GRID_METADATA);
    this.registry.register('newsletter', NewsletterComponent, NEWSLETTER_METADATA);
    this.registry.register('mortgage-calculator', MortgageCalculatorComponent, MORTGAGE_CALCULATOR_METADATA);
    this.registry.register('stats-section', StatsSectionComponent, STATS_SECTION_METADATA);
    this.registry.register('about-section', AboutSectionComponent, ABOUT_SECTION_METADATA);
    this.registry.register('cta-button', CtaButtonComponent, CTA_BUTTON_METADATA);
    
    // Register advanced components
    this.registry.register('custom-code', CustomCodeComponent, CUSTOM_CODE_METADATA);

    console.log(`✅ Registered ${this.registry.getAllTypes().length} website components`);
  }

  /**
   * Get all registered component types
   */
  getRegisteredTypes(): string[] {
    return this.registry.getAllTypes();
  }
}
