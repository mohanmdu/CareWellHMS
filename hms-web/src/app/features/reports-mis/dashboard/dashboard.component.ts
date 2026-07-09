import { Component, inject, signal } from '@angular/core';
import { Dashboard } from './dashboard.model';
import { DashboardService } from './dashboard.service';

/**
 * Replaces the legacy DashBoardDetailsBean dashboard (migration doc §4.6) -
 * a read-only cross-module summary, not a print/export view (the legacy app
 * has no server-side report engine; see doc §6.2 for the recommended
 * POI/OpenPDF addition when real reports are built).
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private readonly service = inject(DashboardService);

  dashboard = signal<Dashboard | null>(null);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.service.get().subscribe({
      next: (dashboard) => this.dashboard.set(dashboard),
      error: () => this.errorMessage.set('Failed to load dashboard.')
    });
  }
}
