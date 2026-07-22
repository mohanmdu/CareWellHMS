import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ClinicSettingsService } from '../../features/masters-admin/clinic-settings/clinic-settings.service';
import { getVisibleNavGroups } from '../package-config';

/**
 * App-wide shell: responsive sidenav + top toolbar, replacing the flat
 * always-visible header/nav in the pre-redesign AppComponent. Rendered as
 * the layout component for every authenticated route (see app.routes.ts);
 * the login screen sits outside it.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly clinicSettingsService = inject(ClinicSettingsService);

  readonly navGroups = getVisibleNavGroups();

  // Footer only renders when a client has actually set custom footer text -
  // ThemeService already applies header/footer colors at bootstrap regardless,
  // so an unconfigured deployment shows no footer at all (today's look).
  readonly footerText = toSignal(
    this.clinicSettingsService.get().pipe(
      map((settings) => settings.footerText),
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  readonly isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: this.breakpointObserver.isMatched(Breakpoints.Handset) }
  );

  readonly sidenavOpened = signal(true);

  constructor() {
    effect(() => {
      this.sidenavOpened.set(!this.isHandset());
    }, { allowSignalWrites: true });
  }

  toggleSidenav(): void {
    this.sidenavOpened.update((opened) => !opened);
  }

  closeOnMobileNav(): void {
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
