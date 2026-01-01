import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { ComponentInitializerService } from './shared/website-components/component-initializer.service';

/**
 * Initialize website components
 */
function initializeComponents(componentInitializer: ComponentInitializerService) {
  return () => {
    componentInitializer.initializeComponents();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeComponents,
      deps: [ComponentInitializerService],
      multi: true
    }
  ]
};
