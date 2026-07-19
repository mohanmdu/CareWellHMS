import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { AdmissionReportRow } from '../ip-billing/ip-billing.model';
import { IpBillingService } from '../ip-billing/ip-billing.service';
import { REPORT_PRINT_STYLES } from './report-print-styles';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Admission Report (PDF: "ADMISSION DETAILS") - per-admission billing snapshot with a Payment Type filter and a "View Bill" drill-down. */
@Component({
  selector: 'app-admission-report',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    EmptyStateComponent
  ],
  templateUrl: './admission-report.component.html',
  styleUrl: './admission-report.component.scss'
})
export class AdmissionReportComponent {
  private readonly billingService = inject(IpBillingService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  rows = signal<AdmissionReportRow[]>([]);
  loading = signal(false);
  searched = signal(false);

  // Plain (non-signal) filter state: ngModel's two-way binding assigns via a
  // plain `=`, which would silently replace a WritableSignal with a raw value.
  fromDate: Date | null = null;
  toDate: Date | null = null;
  paymentType: 'ALL' | 'CASH' | 'CLAIM' = 'ALL';

  totals = computed(() => {
    const rows = this.rows();
    return {
      invoiceAmount: rows.reduce((sum, r) => sum + r.invoiceAmount, 0),
      amountPaid: rows.reduce((sum, r) => sum + r.amountPaid, 0)
    };
  });

  constructor() {
    this.search();
  }

  wardAndRoom(row: AdmissionReportRow): string {
    if (!row.roomNumber) {
      return 'Pending assignment';
    }
    return row.roomTypeName ? `${row.roomTypeName} - ${row.roomNumber}` : row.roomNumber;
  }

  search(): void {
    this.loading.set(true);
    this.billingService
      .getAdmissionReport(toIsoDate(this.fromDate), toIsoDate(this.toDate), this.paymentType)
      .subscribe({
        next: (rows) => {
          this.rows.set(rows);
          this.loading.set(false);
          this.searched.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the admission report.');
        }
      });
  }

  viewBill(row: AdmissionReportRow): void {
    this.router.navigate(['/ip/reports/admission', row.admissionId, 'bill']);
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Admission Details</title>
          <style>${REPORT_PRINT_STYLES}</style>
        </head>
        <body>
          <h1>Admission Details</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
