import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicConfig } from '../models/public.model';

/**
 * Fetches the hospital's public branding/config once per app render (server
 * or browser) and applies it - theme colors as CSS custom properties, page
 * title, meta description, favicon - before the rest of the app renders, so
 * SSR output already reflects the hospital's own branding for crawlers.
 */
@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);

  readonly config = signal<PublicConfig | null>(null);

  async load(): Promise<void> {
    try {
      const config = await firstValueFrom(this.http.get<PublicConfig>(`${environment.apiBaseUrl}/public/config`));
      this.config.set(config);
      this.apply(config);
    } catch {
      // Public site should still render (with fallback styling) if the API is briefly unavailable.
    }
  }

  private apply(config: PublicConfig): void {
    const root = this.document.documentElement;
    if (config.themePrimaryColor) {
      root.style.setProperty('--theme-primary', config.themePrimaryColor);
    }
    if (config.themeSecondaryColor) {
      root.style.setProperty('--theme-secondary', config.themeSecondaryColor);
    }
    if (config.seoDefaultTitle) {
      this.titleService.setTitle(config.seoDefaultTitle);
    } else if (config.name) {
      this.titleService.setTitle(config.name);
    }
    if (config.seoDefaultDescription) {
      this.meta.updateTag({ name: 'description', content: config.seoDefaultDescription });
    }
    if (config.faviconUrl) {
      const link: HTMLLinkElement =
        this.document.querySelector('link[rel="icon"]') ?? this.document.createElement('link');
      link.setAttribute('rel', 'icon');
      link.setAttribute('href', config.faviconUrl);
      if (!link.parentNode) {
        this.document.head.appendChild(link);
      }
    }
  }
}
