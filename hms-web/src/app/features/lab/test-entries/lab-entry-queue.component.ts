import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LabTestEntryListRow } from './lab-test-entry.model';
import { LabTestEntryService } from './lab-test-entry.service';

/**
 * Lab Entry Queue & Report / Lab Draft Report: one reusable list, filtered
 * by whichever statuses the route declares in its `data` (NEW+DRAFT for the
 * general queue, DRAFT only for the dedicated Draft Report nav item) - both
 * screens share an identical layout in the reference, differing only in
 * which statuses are included.
 */
@Component({
  selector: 'app-lab-entry-queue',
  standalone: true,
  imports: [DatePipe, FormsModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './lab-entry-queue.component.html',
  styleUrl: './lab-entry-queue.component.scss'
})
export class LabEntryQueueComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(LabTestEntryService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  private readonly statuses: string[] = this.route.snapshot.data['statuses'] ?? ['NEW', 'DRAFT'];
  readonly title: string = this.route.snapshot.data['title'] ?? 'Lab Entry Queue & Report';

  fromDate: Date | null = null;
  toDate: Date | null = null;
  loading = signal(false);
  rows = signal<LabTestEntryListRow[]>([]);

  readonly filteredRows = computed(() => {
    const from = this.fromDate;
    const to = this.toDate;
    if (!from && !to) {
      return this.rows();
    }
    return this.rows().filter((row) => {
      const requested = new Date(row.requestedTime);
      if (from && requested < from) {
        return false;
      }
      if (to && requested > to) {
        return false;
      }
      return true;
    });
  });

  constructor() {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.service.getQueue(this.statuses).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the lab entry queue.');
      }
    });
  }

  view(row: LabTestEntryListRow): void {
    this.router.navigate(['/lab/test-entries', row.id]);
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) {
      return 'just now';
    }
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}
