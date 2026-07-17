import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { InventoryReportEntry } from './pharmacy-statement-report.model';
import { PharmacyStatementReportService } from './pharmacy-statement-report.service';
import { SALES_GST_REPORT_PRINT_STYLES } from './sales-gst-report-print-styles';

const NEAR_EXPIRY_MONTHS = 3;
const LOW_QTY_THRESHOLD = 10;

/**
 * Live snapshot of every in-stock batch - no date filter (this is a
 * point-in-time stock view, not a transaction history) and no Location Name
 * filter (PharmacyStock has no location dimension; location is a tag on
 * transactions, not stock - same documented simplification as Purchase
 * Return Report's omitted Location filter).
 */
@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatProgressBarModule, MatTableModule, EmptyStateComponent],
  templateUrl: './inventory-report.component.html',
  styleUrl: './inventory-report.component.scss'
})
export class InventoryReportComponent {
  private readonly service = inject(PharmacyStatementReportService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = [
    'productId',
    'productName',
    'batch',
    'packing',
    'noPack',
    'quantity',
    'sellingPrice',
    'netAmountSp',
    'purchasePrice',
    'netAmountPp',
    'expiryDate'
  ];

  entries = signal<InventoryReportEntry[]>([]);
  loading = signal(false);

  readonly totalQuantity = computed(() => this.entries().reduce((sum, e) => sum + e.quantity, 0));
  readonly totalPackingQuantity = computed(() => this.entries().reduce((sum, e) => sum + e.noPack, 0));
  readonly totalAmountSp = computed(() => this.entries().reduce((sum, e) => sum + e.netAmountSp, 0));
  readonly totalAmountPp = computed(() => this.entries().reduce((sum, e) => sum + e.netAmountPp, 0));

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.inventoryReport().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Inventory Report.');
      }
    });
  }

  isLowQty(entry: InventoryReportEntry): boolean {
    return entry.quantity < LOW_QTY_THRESHOLD;
  }

  isNearExpiry(entry: InventoryReportEntry): boolean {
    if (!entry.expiryDate) {
      return false;
    }
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() + NEAR_EXPIRY_MONTHS);
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
          <title>Inventory Report</title>
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
