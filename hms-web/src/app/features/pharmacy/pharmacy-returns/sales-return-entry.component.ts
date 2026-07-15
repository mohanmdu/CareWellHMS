import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { InvoiceSearchComponent } from '../../../shared/ui/invoice-search/invoice-search.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import {
  PHARMACY_RETURN_TYPES,
  PHARMACY_RETURN_TYPE_LABELS,
  PharmacyReturnInvoice,
  PharmacyReturnInvoiceItem,
  PharmacyReturnType,
  PharmacyReturnWorkingItem
} from './pharmacy-return.model';
import { PharmacyReturnWorkflowService } from './pharmacy-return.service';
import { SalesReturnPrintDialogComponent } from './sales-return-print-dialog.component';

/**
 * "Sales Return by Invoice": search an invoice, pick Return Qty per sold
 * line and add it to a running Sales Return Entry summary, then Submit.
 * Submitting only persists a PENDING return and prints an acknowledgment
 * slip - stock is not credited here; that happens when the return is later
 * approved from Sales Return Approval (PharmacyReturnService.approve).
 */
@Component({
  selector: 'app-sales-return-entry',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    PageHeaderComponent,
    InvoiceSearchComponent
  ],
  templateUrl: './sales-return-entry.component.html',
  styleUrl: './sales-return-entry.component.scss'
})
export class SalesReturnEntryComponent {
  private readonly returnService = inject(PharmacyReturnWorkflowService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly summaryColumns = ['productName', 'batch', 'quantity', 'mrp', 'netAmount', 'cancel'];
  readonly itemColumns = [
    'productName',
    'productTypeName',
    'batch',
    'expiryDate',
    'manufacturerName',
    'quantitySold',
    'returnQty',
    'mrp',
    'sgstPercent',
    'cgstPercent',
    'action'
  ];
  readonly returnTypes = PHARMACY_RETURN_TYPES;
  readonly returnTypeLabels = PHARMACY_RETURN_TYPE_LABELS;

  invoice = signal<PharmacyReturnInvoice | null>(null);
  workingItems = signal<PharmacyReturnWorkingItem[]>([]);
  submitting = signal(false);

  returnQtyInputs: Record<number, number> = {};
  returnType: PharmacyReturnType = 'CASH';
  remarks = '';

  totalAmount = computed(() => this.workingItems().reduce((sum, item) => sum + item.netAmount, 0));

  onInvoiceFound(invoice: PharmacyReturnInvoice): void {
    this.invoice.set(invoice);
    this.returnQtyInputs = {};
    this.workingItems.set([]);
    this.returnType = 'CASH';
    this.remarks = '';
  }

  returnLine(item: PharmacyReturnInvoiceItem): void {
    const qty = this.returnQtyInputs[item.saleItemId] ?? 0;
    if (qty <= 0 || qty > item.remainingQty) {
      this.notification.error(`Enter a Return Qty between 1 and ${item.remainingQty} for ${item.productName}.`);
      return;
    }
    const netAmount = (item.netAmount / item.quantitySold) * qty;
    const workingItem: PharmacyReturnWorkingItem = {
      saleItemId: item.saleItemId,
      productName: item.productName,
      batch: item.batch,
      mrp: item.mrp,
      quantity: qty,
      netAmount
    };
    this.workingItems.update((items) => [...items.filter((i) => i.saleItemId !== item.saleItemId), workingItem]);
  }

  removeWorkingItem(saleItemId: number): void {
    this.workingItems.update((items) => items.filter((i) => i.saleItemId !== saleItemId));
  }

  submit(): void {
    const invoice = this.invoice();
    if (!invoice || this.workingItems().length === 0) {
      return;
    }
    this.submitting.set(true);
    this.returnService
      .submit({
        saleId: invoice.saleId,
        returnType: this.returnType,
        remarks: this.remarks.trim() || null,
        items: this.workingItems().map((item) => ({ saleItemId: item.saleItemId, quantity: item.quantity }))
      })
      .subscribe({
        next: (pharmacyReturn) => {
          this.submitting.set(false);
          this.dialog.open(SalesReturnPrintDialogComponent, { width: '640px', maxWidth: '95vw', data: { pharmacyReturn } });
          this.reset();
        },
        error: (err) => {
          this.submitting.set(false);
          this.notification.error(err.error?.message ?? 'Failed to submit the return.');
        }
      });
  }

  reset(): void {
    this.invoice.set(null);
    this.workingItems.set([]);
    this.returnQtyInputs = {};
    this.returnType = 'CASH';
    this.remarks = '';
  }
}
