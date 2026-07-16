import { DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
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
import { PharmacyReturnWorkflowService } from '../pharmacy-returns/pharmacy-return.service';
import { SalesReturnPrintDialogComponent } from '../pharmacy-returns/sales-return-print-dialog.component';
import { SalesGstEntry, SalesReturnGstEntry } from './pharmacy-statement-report.model';
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
 * Dual grid - Sales GST and Sales Return GST. Sales Invoice No opens the
 * bill print dialog; Sales Return's Invoice No opens the return's own
 * receipt (more correct than reopening the original sale bill).
 */
@Component({
  selector: 'app-sales-gst-report',
  standalone: true,
  imports: [
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
  templateUrl: './sales-gst-report.component.html',
  styleUrl: './sales-gst-report.component.scss'
})
export class SalesGstReportComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly saleService = inject(PharmacySaleService);
  private readonly returnService = inject(PharmacyReturnWorkflowService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly salesColumns = ['patientName', 'invoiceNo', 'drugDetails', 'sgstPercent', 'sgstAmount', 'cgstPercent', 'cgstAmount', 'mrp'];
  readonly returnColumns = ['patientName', 'invoiceNo', 'drugDetails', 'sgstPercent', 'sgstAmount', 'cgstPercent', 'cgstAmount', 'mrp'];

  sales = signal<SalesGstEntry[]>([]);
  returns = signal<SalesReturnGstEntry[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);
  gstPercent: number | null = null;

  readonly gstPercentOptions = computed(() => {
    const rates = new Set<number>();
    for (const entry of this.sales()) {
      rates.add((entry.sgstPercent ?? 0) + (entry.cgstPercent ?? 0));
    }
    return Array.from(rates).sort((a, b) => a - b);
  });

  readonly totalSale = computed(() => this.sales().reduce((sum, entry) => sum + entry.netAmount, 0));
  readonly totalReturn = computed(() => this.returns().reduce((sum, entry) => sum + entry.netAmount, 0));
  readonly netAmount = computed(() => this.totalSale() - this.totalReturn());

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const from = toIsoDate(this.fromDate());
    const to = toIsoDate(this.toDate());
    const gst = this.gstPercent ?? undefined;

    this.service.salesGst(from, to, gst).subscribe({
      next: (entries) => this.sales.set(entries),
      error: () => this.notification.error('Failed to load the Sales GST Report.')
    });
    this.service.salesReturnGst(from, to, gst).subscribe({
      next: (entries) => {
        this.returns.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Sales Return GST Report.');
      }
    });
  }

  viewBill(entry: SalesGstEntry): void {
    this.saleService.get(entry.saleId).subscribe({
      next: (sale) => this.dialog.open(PharmacyBillPrintDialogComponent, { width: '900px', maxWidth: '95vw', data: { sale } }),
      error: () => this.notification.error('Failed to load the bill.')
    });
  }

  viewReturn(entry: SalesReturnGstEntry): void {
    this.returnService.get(entry.returnId).subscribe({
      next: (pharmacyReturn) => this.dialog.open(SalesReturnPrintDialogComponent, { width: '640px', maxWidth: '95vw', data: { pharmacyReturn } }),
      error: () => this.notification.error('Failed to load the return.')
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
          <title>Sales GST Report</title>
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
