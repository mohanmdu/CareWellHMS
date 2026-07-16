import { Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PharmacyStockService } from '../pharmacy-billing/pharmacy-stock.service';
import { StockBalanceEntry } from '../pharmacy-billing/pharmacy-stock.model';

/**
 * Closing Stock = Opening Stock - Sale Qty + Return Qty + Intern Receipt +/-
 * Stock Adjustment, computed server-side per product (see
 * PharmacyStockBalanceService) - not a live read of quantityOnHand.
 */
@Component({
  selector: 'app-stock-balance-report',
  standalone: true,
  imports: [MatProgressBarModule, MatTableModule, EmptyStateComponent],
  templateUrl: './stock-balance-report.component.html',
  styleUrl: './stock-balance-report.component.scss'
})
export class StockBalanceReportComponent {
  private readonly stockService = inject(PharmacyStockService);
  private readonly notification = inject(NotificationService);

  readonly displayedColumns = [
    'productName',
    'openingStock',
    'saleQty',
    'returnQty',
    'internReceiptQty',
    'stockAdjustmentQty',
    'closingStock'
  ];

  entries = signal<StockBalanceEntry[]>([]);
  loading = signal(false);

  constructor() {
    this.loading.set(true);
    this.stockService.balanceReport().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the Stock Balance Report.');
      }
    });
  }
}
