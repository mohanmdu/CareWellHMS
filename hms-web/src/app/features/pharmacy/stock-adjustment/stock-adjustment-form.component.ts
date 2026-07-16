import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { DrugBatchSearchComponent } from '../../../shared/ui/drug-batch-search/drug-batch-search.component';
import { PharmacyStock } from '../pharmacy-billing/pharmacy-stock.model';
import {
  PHARMACY_STOCK_TRANSACTION_TYPES,
  PHARMACY_STOCK_TRANSACTION_TYPE_LABELS,
  PharmacyStockTransactionType,
  StockAdjustmentWorkingItem
} from './stock-adjustment.model';
import { StockAdjustmentService } from './stock-adjustment.service';

/**
 * Shared "Internal Receipt / Stock Matching" form - one screen with a
 * Select Return Type dropdown covering both Internal Receipt and Stock
 * Adjustment (see PharmacyStockTransaction's class doc). Reused as-is by
 * both the plain Stock Adjustment page (locationId left unset, defaults to
 * "Main Store") and Stock Adjustment by Location (locationId locked to
 * whichever department tile was picked) - satisfying the legacy spec's own
 * "must repeat the same business logic" instruction literally.
 */
@Component({
  selector: 'app-stock-adjustment-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    DrugBatchSearchComponent
  ],
  templateUrl: './stock-adjustment-form.component.html',
  styleUrl: './stock-adjustment-form.component.scss'
})
export class StockAdjustmentFormComponent {
  private readonly service = inject(StockAdjustmentService);
  private readonly notification = inject(NotificationService);

  readonly locationId = input.required<number>();
  readonly locationName = input<string | null>(null);

  readonly itemColumns = ['productName', 'batch', 'productTypeName', 'quantity', 'cancel'];
  readonly transactionTypes = PHARMACY_STOCK_TRANSACTION_TYPES;
  readonly transactionTypeLabels = PHARMACY_STOCK_TRANSACTION_TYPE_LABELS;

  transactionType: PharmacyStockTransactionType = 'INTERNAL_RECEIPT';
  items = signal<StockAdjustmentWorkingItem[]>([]);
  reason = '';
  saving = signal(false);

  selectedStock: PharmacyStock | null = null;
  quantity: number | null = null;

  onBatchSelected(stock: PharmacyStock): void {
    this.selectedStock = stock;
    this.quantity = null;
  }

  addItem(): void {
    const stock = this.selectedStock;
    if (!stock || !this.quantity) {
      return;
    }
    this.items.update((items) => [
      ...items,
      {
        stockId: stock.id,
        productName: stock.productName,
        productTypeName: stock.productTypeName,
        batch: stock.batch,
        quantity: this.quantity!
      }
    ]);
    this.selectedStock = null;
    this.quantity = null;
  }

  removeItem(index: number): void {
    this.items.set(this.items().filter((_, i) => i !== index));
  }

  confirm(): void {
    const items = this.items();
    if (items.length === 0) {
      return;
    }
    this.saving.set(true);
    let remaining = items.length;
    let failed = false;
    items.forEach((item) => {
      this.service
        .create({
          stockId: item.stockId,
          transactionType: this.transactionType,
          quantity: item.quantity,
          locationId: this.locationId(),
          reason: this.reason.trim() || null
        })
        .subscribe({
          next: () => {
            remaining -= 1;
            if (remaining === 0 && !failed) {
              this.saving.set(false);
              this.notification.success('Stock transaction saved.');
              this.reset();
            }
          },
          error: (err) => {
            failed = true;
            this.saving.set(false);
            this.notification.error(err.error?.message ?? 'Failed to save the stock transaction.');
          }
        });
    });
  }

  private reset(): void {
    this.items.set([]);
    this.reason = '';
    this.selectedStock = null;
    this.quantity = null;
  }
}
