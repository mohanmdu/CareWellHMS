import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ExpiredReportEntry } from './pharmacy-statement-report.model';
import { PharmacyStatementReportService } from './pharmacy-statement-report.service';
import { SALES_GST_REPORT_PRINT_STYLES } from './sales-gst-report-print-styles';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Blank From/To defaults server-side to "already expired or expiring within
 * 3 months" (see PharmacyStatementReportService.expiredReport) - entering an
 * explicit range overrides that default instead.
 */
@Component({
  selector: 'app-expired-report',
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
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './expired-report.component.html',
  styleUrl: './expired-report.component.scss'
})
export class ExpiredReportComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = [
    'productName',
    'manufacturerName',
    'supplierName',
    'batch',
    'quantity',
    'purchasePrice',
    'mrp',
    'totalAmountSp',
    'totalAmountPp',
    'expiryDate'
  ];

  entries = signal<ExpiredReportEntry[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);

  readonly totalQuantity = computed(() => this.entries().reduce((sum, e) => sum + e.quantity, 0));
  readonly totalAmountSp = computed(() => this.entries().reduce((sum, e) => sum + e.totalAmountSp, 0));
  readonly totalAmountPp = computed(() => this.entries().reduce((sum, e) => sum + e.totalAmountPp, 0));

  constructor() {
    this.find();
  }

  find(): void {
    this.loading.set(true);
    this.service.expiredReport(toIsoDate(this.fromDate()), toIsoDate(this.toDate())).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Expired Report.');
      }
    });
  }

  isExpiredOrNear(entry: ExpiredReportEntry): boolean {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() + 3);
    return new Date(entry.expiryDate) <= cutoff;
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
          <title>Expired Report</title>
          <style>${SALES_GST_REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
