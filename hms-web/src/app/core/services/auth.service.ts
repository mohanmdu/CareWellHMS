import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'hms_auth';

/**
 * Interim auth for local development, matching the backend's interim HTTP
 * Basic SecurityConfig (see hms-api com.pms.config.SecurityConfig). Replace
 * with a JWT-based flow per the migration plan's Phase 1 auth task once the
 * backend exposes a token endpoint - this is a starting point, not the
 * final design.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal<boolean>(!!sessionStorage.getItem(STORAGE_KEY));

  isAuthenticated() {
    return this.authenticated();
  }

  login(username: string, password: string): void {
    const encoded = btoa(`${username}:${password}`);
    sessionStorage.setItem(STORAGE_KEY, encoded);
    this.authenticated.set(true);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.authenticated.set(false);
  }

  getBasicAuthHeader(): string | null {
    const encoded = sessionStorage.getItem(STORAGE_KEY);
    return encoded ? `Basic ${encoded}` : null;
  }
}
