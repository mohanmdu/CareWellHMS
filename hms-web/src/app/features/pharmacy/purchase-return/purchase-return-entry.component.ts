import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { Supplier } from '../inventory-master/suppliers/supplier.model';
import { SupplierService } from '../inventory-master/suppliers/supplier.service';
import {
  PHARMACY_PURCHASE_RETURN_TYPES,
  PHARMACY_PURCHASE_RETURN_TYPE_LABELS,
  PharmacyPurchaseReturnEligibleItem,
  PharmacyPurchaseReturnType,
  PurchaseReturnWorkingItem
} from './purchase-return.model';
import { PurchaseReturnPrintDialogComponent } from './purchase-return-print-dialog.component';
import { PurchaseReturnService } from './purchase-return.service';

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
 * Purchase Return - single-step (immediate), unlike Sales Return's
 * PENDING/APPROVED workflow: Confirm decrements stock right away and opens
 * the printable receipt, no separate approval module (see plan Context).
 */
@Component({
  selector: 'app-purchase-return-entry',
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
    MatSelectModule,
    MatTableModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './purchase-return-entry.component.html',
  styleUrl: './purchase-return-entry.component.scss'
})
export class PurchaseReturnEntryComponent {
  private readonly service = inject(PurchaseReturnService);
  private readonly supplierService = inject(SupplierService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly entryColumns = ['productName', 'batch', 'quantity', 'productPrice', 'netAmount', 'remove'];
  readonly stockColumns = [
    'invoiceNo',
    'productName',
    'productTypeName',
    'batch',
    'purchaseQty',
    'quantityOnHand',
    'productPrice',
    'mrp',
    'returnQty',
    'action'
  ];
  readonly returnTypes = PHARMACY_PURCHASE_RETURN_TYPES;
  readonly returnTypeLabels = PHARMACY_PURCHASE_RETURN_TYPE_LABELS;

  suppliers = signal<Supplier[]>([]);
  stockRows = signal<PharmacyPurchaseReturnEligibleItem[]>([]);
  workingItems = signal<PurchaseReturnWorkingItem[]>([]);
  loading = signal(false);
  submitting = signal(false);
  searched = signal(false);

  returnQtyInputs: Record<number, number> = {};
  returnType: PharmacyPurchaseReturnType = 'NORMAL';
  supplierId: number | null = null;
  drugName = '';
  fromDate = signal<Date | null>(null);
  toDate = signal<Date | null>(new Date());
  remarks = '';

  totalAmount = computed(() => this.workingItems().reduce((sum, item) => sum + item.netAmount, 0));

  constructor() {
    this.supplierService.list().subscribe({ next: (suppliers) => this.suppliers.set(suppliers), error: () => {} });
  }

  getStock(): void {
    this.loading.set(true);
    this.service
      .eligibleStock(this.supplierId ?? undefined, this.drugName.trim() || undefined, toIsoDate(this.fromDate()), toIsoDate(this.toDate()))
      .subscribe({
        next: (rows) => {
          this.loading.set(false);
          this.searched.set(true);
          this.stockRows.set(rows);
          this.returnQtyInputs = {};
        },
        error: () => {
          this.loading.set(false);
          this.notification.error('Failed to fetch stock.');
        }
      });
  }

  returnLine(row: PharmacyPurchaseReturnEligibleItem): void {
    const qty = this.returnQtyInputs[row.stockId] ?? 0;
    if (qty <= 0 || qty > row.quantityOnHand) {
      this.notification.error(`Enter a Return Qty between 1 and ${row.quantityOnHand} for ${row.productName}.`);
      return;
    }
    const workingItem: PurchaseReturnWorkingItem = {
      stockId: row.stockId,
      productName: row.productName,
      batch: row.batch,
      productPrice: row.productPrice,
      quantity: qty,
      netAmount: (row.productPrice ?? 0) * qty
    };
    this.workingItems.update((items) => [...items.filter((i) => i.stockId !== row.stockId), workingItem]);
  }

  removeWorkingItem(stockId: number): void {
    this.workingItems.update((items) => items.filter((i) => i.stockId !== stockId));
  }

  confirm(): void {
    if (!this.supplierId || this.workingItems().length === 0) {
      return;
    }
    this.submitting.set(true);
    this.service
      .create({
        supplierId: this.supplierId,
        returnType: this.returnType,
        remarks: this.remarks.trim() || null,
        items: this.workingItems().map((item) => ({ stockId: item.stockId, quantity: item.quantity }))
      })
      .subscribe({
        next: (purchaseReturn) => {
          this.submitting.set(false);
          this.dialog.open(PurchaseReturnPrintDialogComponent, { width: '720px', maxWidth: '95vw', data: { purchaseReturn } });
          this.reset();
        },
        error: (err) => {
          this.submitting.set(false);
          this.notification.error(err.error?.message ?? 'Failed to confirm the purchase return.');
        }
      });
  }

  reset(): void {
    this.workingItems.set([]);
    this.stockRows.set([]);
    this.returnQtyInputs = {};
    this.searched.set(false);
    this.remarks = '';
  }
}
