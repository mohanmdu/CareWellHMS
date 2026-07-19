import { InjectionToken } from '@angular/core';

/**
 * Absolute origin used to resolve relative /api and /uploads URLs during SSR -
 * the Node render process has no browser location to resolve a relative URL
 * against. Only ever overridden server-side (see app.config.server.ts); the
 * browser keeps this empty and uses relative URLs through the reverse proxy.
 */
export const SERVER_API_ORIGIN = new InjectionToken<string>('SERVER_API_ORIGIN', {
  providedIn: 'root',
  factory: () => ''
});
