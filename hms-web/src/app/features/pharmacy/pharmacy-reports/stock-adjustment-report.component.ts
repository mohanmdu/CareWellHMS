import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyLocation } from '../pharmacy-billing/pharmacy-location.model';
import { PharmacyLocationService } from '../pharmacy-billing/pharmacy-location.service';
import { PharmacyStockTransaction } from '../stock-adjustment/stock-adjustment.model';
import { StockAdjustmentService } from '../stock-adjustment/stock-adjustment.service';
import { STOCK_ADJUSTMENT_REPORT_PRINT_STYLES } from './stock-adjustment-report-print-styles';

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Two grids - Stock Adjustment (type SM) and Intern Receipt (type IR) - filtered by Location + date range. */
@Component({
  selector: 'app-stock-adjustment-report',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    EmptyStateComponent
  ],
  templateUrl: './stock-adjustment-report.component.html',
  styleUrl: './stock-adjustment-report.component.scss'
})
export class StockAdjustmentReportComponent {
  private readonly service = inject(StockAdjustmentService);
  private readonly locationService = inject(PharmacyLocationService);
  private readonly notification = inject(NotificationService);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  readonly displayedColumns = ['productName', 'batch', 'typeCode', 'quantity', 'locationName', 'updatedBy', 'updatedAt'];

  locations = signal<PharmacyLocation[]>([]);
  adjustments = signal<PharmacyStockTransaction[]>([]);
  internalReceipts = signal<PharmacyStockTransaction[]>([]);
  loading = signal(false);

  fromDate = signal<Date | null>(new Date());
  toDate = signal<Date | null>(new Date());
  locationId: number | null = null;

  constructor() {
    this.locationService.list().subscribe({ next: (locations) => this.locations.set(locations), error: () => {} });
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    const from = toIsoDate(this.fromDate());
    const to = toIsoDate(this.toDate());
    const locationId = this.locationId ?? undefined;

    this.service.search('STOCK_ADJUSTMENT', locationId, from, to).subscribe({
      next: (entries) => this.adjustments.set(entries),
      error: () => this.notification.error('Failed to load the Stock Adjustment grid.')
    });
    this.service.search('INTERNAL_RECEIPT', locationId, from, to).subscribe({
      next: (entries) => {
        this.internalReceipts.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Intern Receipt grid.');
      }
    });
  }

  typeCode(transaction: PharmacyStockTransaction): string {
    return transaction.transactionType === 'STOCK_ADJUSTMENT' ? 'SM' : 'IR';
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
          <title>Stock Adjustment Report</title>
          <style>${STOCK_ADJUSTMENT_REPORT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
