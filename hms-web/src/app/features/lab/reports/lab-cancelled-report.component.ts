import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LabCancelledReportRow } from './lab-collection-report.model';
import { LabCollectionReportService } from './lab-collection-report.service';

/**
 * Cancelled Report: every LabRequisition cancelled while still PENDING (see
 * LabRequisitionService.cancel()) - Invoice No is always blank here since a
 * cancelled requisition never reaches approve(), where invoiceNumber is
 * assigned. No date/filter row, unlike the other Lab reports - matches the
 * reference, which shows a static table only.
 */
@Component({
  selector: 'app-lab-cancelled-report',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './lab-cancelled-report.component.html',
  styleUrl: './lab-cancelled-report.component.scss'
})
export class LabCancelledReportComponent {
  private readonly service = inject(LabCollectionReportService);
  private readonly notification = inject(NotificationService);

  rows = signal<LabCancelledReportRow[]>([]);
  loading = signal(true);

  constructor() {
    this.service.getCancelled().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the cancelled report.');
      }
    });
  }
}
