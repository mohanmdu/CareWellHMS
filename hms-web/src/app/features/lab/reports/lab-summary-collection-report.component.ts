import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LAB_PAYMENT_MODE_LABELS } from '../requisitions/lab-requisition.model';
import { LabCollectionReport, LabCollectionReportRow } from './lab-collection-report.model';
import { LabCollectionReportService } from './lab-collection-report.service';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const EMPTY_REPORT: LabCollectionReport = {
  rows: [],
  totals: { invoiceAmount: 0, doctorReferralAmount: 0, discountAmount: 0, receiptAmount: 0, refundAmount: 0, totalCollectionAmount: 0 }
};

/**
 * Summary Collection Report: every billed (APPROVED) LabRequisition in the
 * date range, Lab and Investigations mixed together with no type filter -
 * the combined view, vs. the Lab Detail / Investigation Detail reports
 * which split by requisitionType.
 */
@Component({
  selector: 'app-lab-summary-collection-report',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    EmptyStateComponent
  ],
  templateUrl: './lab-summary-collection-report.component.html',
  styleUrl: './lab-summary-collection-report.component.scss'
})
export class LabSummaryCollectionReportComponent {
  private readonly service = inject(LabCollectionReportService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly paymentModeLabels = LAB_PAYMENT_MODE_LABELS;

  fromDate: Date | null = new Date();
  toDate: Date | null = new Date();

  appliedFrom = signal<Date | null>(new Date());
  appliedTo = signal<Date | null>(new Date());

  report = signal<LabCollectionReport>(EMPTY_REPORT);
  loading = signal(false);
  searched = signal(false);

  constructor() {
    this.search();
  }

  paymentModeLabel(mode: string | null): string {
    return mode ? (this.paymentModeLabels as Record<string, string>)[mode] ?? mode : '—';
  }

  search(): void {
    this.appliedFrom.set(this.fromDate);
    this.appliedTo.set(this.toDate);
    this.loading.set(true);
    this.service.getSummary(toIsoDate(this.fromDate), toIsoDate(this.toDate)).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the summary collection report.');
      }
    });
  }

  viewInvoice(row: LabCollectionReportRow): void {
    this.router.navigate(['/lab/billing', row.requisitionId, 'receipt']);
  }
}
