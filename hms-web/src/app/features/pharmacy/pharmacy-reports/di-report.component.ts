import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyBillPrintDialogComponent } from '../pharmacy-billing/pharmacy-bill-print-dialog.component';
import { PharmacySaleService } from '../pharmacy-billing/pharmacy-sale.service';
import { SALES_GST_REPORT_PRINT_STYLES } from './sales-gst-report-print-styles';
import { DI_REPORT_TYPE_LABELS, DI_REPORT_TYPES, DiReportEntry, DrugScheduleFilterType } from './pharmacy-statement-report.model';
import { PharmacyStatementReportService } from './pharmacy-statement-report.service';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Schedule/Schedule-H/H1 register - filtered by Product.scheduleType, Bill No opens the bill print dialog. */
@Component({
  selector: 'app-di-report',
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
    MatSelectModule,
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './di-report.component.html',
  styleUrl: './di-report.component.scss'
})
export class DiReportComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly saleService = inject(PharmacySaleService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = [
    'billNumber',
    'date',
    'registrationNumber',
    'patientName',
    'drName',
    'manufacturerName',
    'productName',
    'qtyIssued',
    'mrp',
    'batchNo',
    'expiryDate',
    'pharmacistSign'
  ];

  readonly types = DI_REPORT_TYPES;
  readonly typeLabels = DI_REPORT_TYPE_LABELS;

  entries = signal<DiReportEntry[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);
  type: DrugScheduleFilterType | null = null;
  nameOrMobile = '';
  patientId: number | null = null;

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service
      .diReport(
        toIsoDate(this.fromDate()),
        toIsoDate(this.toDate()),
        this.type ?? undefined,
        this.patientId ?? undefined,
        this.nameOrMobile.trim() || undefined
      )
      .subscribe({
        next: (entries) => {
          this.entries.set(entries);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to load the DI Report.');
        }
      });
  }

  viewBill(entry: DiReportEntry): void {
    this.saleService.get(entry.saleId).subscribe({
      next: (sale) => this.dialog.open(PharmacyBillPrintDialogComponent, { width: '900px', maxWidth: '95vw', data: { sale } }),
      error: () => this.notification.error('Failed to load the bill.')
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
          <title>DI Report</title>
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
