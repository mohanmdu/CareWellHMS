import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { ActivityLog } from './activity-log.model';
import { ActivityLogService } from './activity-log.service';

const STATUS_TONE: Partial<Record<string, StatusBadgeTone>> = {
  Success: 'success',
  Approved: 'success',
  Updated: 'info',
  Pending: 'warning',
  Cancelled: 'danger',
  Deleted: 'danger'
};

/** Activity Log Details (PDF: "View Details" drill-down from the IP/OP Billing Activity Log). */
@Component({
  selector: 'app-activity-log-detail',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatProgressBarModule, StatusBadgeComponent],
  templateUrl: './activity-log-detail.component.html',
  styleUrl: './activity-log-detail.component.scss'
})
export class ActivityLogDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly activityLogService = inject(ActivityLogService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly statusTone = STATUS_TONE;

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));
  entry = signal<ActivityLog | null>(null);
  loading = signal(true);

  constructor() {
    this.activityLogService.get(this.id).subscribe({
      next: (entry) => {
        this.entry.set(entry);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the activity log entry.');
        this.router.navigate(['/ip/reports/activity-log']);
      }
    });
  }

  back(): void {
    this.location.back();
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Activity Log Details</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 24px; }
            h1 { font-size: 1.25rem; margin: 0 0 16px; }
          </style>
        </head>
        <body>
          <h1>Activity Log Details</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
