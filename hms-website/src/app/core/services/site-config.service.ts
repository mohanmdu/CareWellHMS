import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CornerRadiusStyle, PublicConfig } from '../models/public.model';

/** Mirrors hms-web's ThemeService CORNER_RADIUS_MAP, collapsed to this app's single --radius token. */
const CORNER_RADIUS_PX: Record<CornerRadiusStyle, string> = {
  SQUARE: '2px',
  ROUNDED: '8px',
  PILL: '999px'
};

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
    if (config.themeTertiaryColor) {
      root.style.setProperty('--theme-tertiary', config.themeTertiaryColor);
    }
    if (config.fontFamily) {
      root.style.setProperty('--font-body', config.fontFamily);
    }
    if (config.headerBackgroundColor) {
      root.style.setProperty('--theme-header-bg', config.headerBackgroundColor);
    }
    if (config.footerBackgroundColor) {
      root.style.setProperty('--theme-footer-bg', config.footerBackgroundColor);
    }
    root.style.setProperty('--radius', CORNER_RADIUS_PX[config.cornerRadiusStyle ?? 'ROUNDED']);
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
