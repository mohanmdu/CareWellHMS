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
import { GrnViewDialogComponent } from '../purchase-management/grn/grn-view-dialog.component';
import { PurchaseGstEntry } from './pharmacy-statement-report.model';
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

/** Approved-GRN GST breakdown - Invoice No reopens the existing GrnViewDialogComponent (no new detail view needed). */
@Component({
  selector: 'app-purchase-gst-report',
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
  templateUrl: './purchase-gst-report.component.html',
  styleUrl: './purchase-gst-report.component.scss'
})
export class PurchaseGstReportComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['invoiceNo', 'drugDetails', 'purchaseAmount', 'sgstPercent', 'sgstAmount', 'cgstPercent', 'cgstAmount', 'netAmount'];

  entries = signal<PurchaseGstEntry[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);
  gstPercent: number | null = null;

  readonly gstPercentOptions = computed(() => {
    const rates = new Set<number>();
    for (const entry of this.entries()) {
      rates.add((entry.sgstPercent ?? 0) + (entry.cgstPercent ?? 0));
    }
    return Array.from(rates).sort((a, b) => a - b);
  });

  readonly totalAmount = computed(() => this.entries().reduce((sum, entry) => sum + entry.netAmount, 0));

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.purchaseGst(toIsoDate(this.fromDate()), toIsoDate(this.toDate()), this.gstPercent ?? undefined).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Purchase GST Report.');
      }
    });
  }

  viewGrn(entry: PurchaseGstEntry): void {
    this.dialog.open(GrnViewDialogComponent, { width: '960px', maxWidth: '95vw', data: { grnId: entry.grnId } });
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase GST Report</title>
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
