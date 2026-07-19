import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ssrApiUrlInterceptor } from './core/ssr-api-url.interceptor';
import { SiteConfigService } from './core/services/site-config.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([ssrApiUrlInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (siteConfig: SiteConfigService) => () => siteConfig.load(),
      deps: [SiteConfigService],
      multi: true
    }
  ]
};
