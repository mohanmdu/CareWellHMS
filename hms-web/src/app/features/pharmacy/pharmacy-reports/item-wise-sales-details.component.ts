import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyBillPrintDialogComponent } from '../pharmacy-billing/pharmacy-bill-print-dialog.component';
import { PharmacySaleService } from '../pharmacy-billing/pharmacy-sale.service';
import { ItemWiseSalesDetail, ItemWiseSalesSummary } from './pharmacy-statement-report.model';
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

/** Level 1 (grouped by product+batch) with Level 2 (patient breakdown) inline-expanded - both already fetched together, no extra query on expand. */
@Component({
  selector: 'app-item-wise-sales-details',
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
  templateUrl: './item-wise-sales-details.component.html',
  styleUrl: './item-wise-sales-details.component.scss'
})
export class ItemWiseSalesDetailsComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly saleService = inject(PharmacySaleService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  summaries = signal<ItemWiseSalesSummary[]>([]);
  loading = signal(false);
  expandedKeys = signal<Set<string>>(new Set());

  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(null);
  drugName = '';

  constructor() {
    this.getDetails();
  }

  keyFor(summary: ItemWiseSalesSummary): string {
    return summary.productName + '|' + summary.batch;
  }

  isExpanded(summary: ItemWiseSalesSummary): boolean {
    return this.expandedKeys().has(this.keyFor(summary));
  }

  toggle(summary: ItemWiseSalesSummary): void {
    const expanded = new Set(this.expandedKeys());
    const key = this.keyFor(summary);
    if (expanded.has(key)) {
      expanded.delete(key);
    } else {
      expanded.add(key);
    }
    this.expandedKeys.set(expanded);
  }

  get totalSaleQty(): number {
    return this.summaries().reduce((sum, s) => sum + s.saleQty, 0);
  }

  get totalNetAmount(): number {
    return this.summaries().reduce((sum, s) => sum + s.netAmount, 0);
  }

  getDetails(): void {
    this.loading.set(true);
    this.service.itemWiseSalesSummary(toIsoDate(this.fromDate()), toIsoDate(this.toDate()), this.drugName.trim() || undefined).subscribe({
      next: (summaries) => {
        this.summaries.set(summaries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load Item Wise Sales Details.');
      }
    });
  }

  viewBill(detail: ItemWiseSalesDetail): void {
    this.saleService.get(detail.saleId).subscribe({
      next: (sale) => this.dialog.open(PharmacyBillPrintDialogComponent, { width: '900px', maxWidth: '95vw', data: { sale } }),
      error: () => this.notification.error('Failed to load the bill.')
    });
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
          <title>Item Wise Sales Details</title>
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
