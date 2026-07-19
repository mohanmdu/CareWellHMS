import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { AdvanceReportRow } from '../payment-request/payment-request.model';
import { PaymentRequestService } from '../payment-request/payment-request.service';
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

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** Advance Report (PDF: "ADVANCE REPORT") - every approved cashier request (Advance/Final Settlement/Due Amount) over a date range. */
@Component({
  selector: 'app-advance-report',
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
    EmptyStateComponent
  ],
  templateUrl: './advance-report.component.html',
  styleUrl: './advance-report.component.scss'
})
export class AdvanceReportComponent {
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  clinicSettings = signal<ClinicSettings | null>(null);
  rows = signal<AdvanceReportRow[]>([]);
  loading = signal(false);
  searched = signal(false);

  fromDate: Date | null = this.firstOfMonth();
  toDate: Date | null = new Date();

  totals = computed(() => {
    const rows = this.rows();
    return {
      advanceAmount: rows.reduce((sum, r) => sum + r.advanceAmount, 0),
      finalSettlementAmount: rows.reduce((sum, r) => sum + r.finalSettlementAmount, 0),
      dueAmountPaid: rows.reduce((sum, r) => sum + r.dueAmountPaid, 0),
      total: rows.reduce((sum, r) => sum + r.total, 0)
    };
  });

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
    this.search();
  }

  private firstOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  search(): void {
    this.loading.set(true);
    this.paymentRequestService.getAdvanceReport(toIsoDate(this.fromDate), toIsoDate(this.toDate)).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the advance report.');
      }
    });
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
          <title>Advance Report</title>
          <style>${REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }

  exportCsv(): void {
    const rows = this.rows();
    if (rows.length === 0) {
      return;
    }
    const header = [
      'S.No',
      'Patient UHID',
      'Patient Name',
      'Gender',
      'IPID',
      'Approved By',
      'Approved Date',
      'Advance Amount',
      'Final Settlement',
      'Due Amount Paid',
      'Total'
    ];
    const lines = [header.map(csvCell).join(',')];
    rows.forEach((row, index) => {
      lines.push(
        [
          csvCell(index + 1),
          csvCell(row.patientUhid),
          csvCell(row.patientName),
          csvCell(row.patientGender),
          csvCell(row.admissionNumber),
          csvCell(row.approvedBy),
          csvCell(row.approvedAt),
          csvCell(row.advanceAmount),
          csvCell(row.finalSettlementAmount),
          csvCell(row.dueAmountPaid),
          csvCell(row.total)
        ].join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `advance-report-${toIsoDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
