import { DatePipe, DecimalPipe, Location } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { CancelledAdmissionDetail } from '../ip-billing/ip-billing.model';
import { IpBillingService } from '../ip-billing/ip-billing.service';
import { REPORT_PRINT_STYLES } from './report-print-styles';

const REFUND_STATUS_TONE: Partial<Record<string, StatusBadgeTone>> = {
  Pending: 'warning',
  Completed: 'success',
  'Not Applicable': 'neutral'
};

/** Cancelled Admission Information (PDF: "View Details" drill-down from the Cancelled Admissions list). */
@Component({
  selector: 'app-cancelled-admission-detail',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatProgressBarModule, StatusBadgeComponent],
  templateUrl: './cancelled-admission-detail.component.html',
  styleUrl: './cancelled-admission-detail.component.scss'
})
export class CancelledAdmissionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly billingService = inject(IpBillingService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly refundStatusTone = REFUND_STATUS_TONE;

  private readonly admissionId = Number(this.route.snapshot.paramMap.get('id'));
  detail = signal<CancelledAdmissionDetail | null>(null);
  loading = signal(true);

  constructor() {
    this.billingService.getCancelledAdmissionDetail(this.admissionId).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the cancelled admission.');
        this.router.navigate(['/ip/reports/cancelled-admissions']);
      }
    });
  }

  back(): void {
    this.location.back();
  }

  close(): void {
    this.router.navigate(['/ip/reports/cancelled-admissions']);
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Cancellation Report</title>
          <style>${REPORT_PRINT_STYLES}</style>
        </head>
        <body>
          <h1>Cancellation Report</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
