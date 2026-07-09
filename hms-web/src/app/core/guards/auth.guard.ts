import { CanActivateFn } from '@angular/router';

/**
 * Route gating is currently DISABLED to match the backend's auth being
 * disabled for local testing (see SecurityConfig.java). Login/logout still
 * work cosmetically (AuthService, the login screen), they just aren't
 * required to reach any route. Revert this to the isAuthenticated() check
 * below when backend auth is re-enabled - do this before any environment
 * other than a single developer's machine.
 *
 * export const authGuard: CanActivateFn = () => {
 *   const auth = inject(AuthService);
 *   const router = inject(Router);
 *   if (auth.isAuthenticated()) {
 *     return true;
 *   }
 *   return router.parseUrl('/login');
 * };
 */
export const authGuard: CanActivateFn = () => true;
