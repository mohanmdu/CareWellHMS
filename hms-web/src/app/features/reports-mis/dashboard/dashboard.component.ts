import { Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../shared/services/notification.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatTileComponent } from '../../../shared/ui/stat-tile/stat-tile.component';
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
  imports: [MatProgressBarModule, PageHeaderComponent, StatTileComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly service = inject(DashboardService);
  private readonly notification = inject(NotificationService);

  dashboard = signal<Dashboard | null>(null);
  loading = signal(true);

  constructor() {
    this.service.get().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load dashboard.');
      }
    });
  }
}
