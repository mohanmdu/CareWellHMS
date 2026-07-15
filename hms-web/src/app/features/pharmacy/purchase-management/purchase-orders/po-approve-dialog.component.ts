import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { PurchaseOrder } from './purchase-order.model';

export interface PoApproveDialogData {
  purchaseOrder: PurchaseOrder;
}

/**
 * Approve-PO dialog: read-only header, editable Order Qty per line (starts
 * at each item's raised totalQty), Approve hands the edited quantities back
 * to the caller. No Current Stock column - this app has no stock ledger
 * (see PurchaseOrder's class doc comment).
 */
@Component({
  selector: 'app-po-approve-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatTableModule],
  templateUrl: './po-approve-dialog.component.html',
  styleUrl: './po-approve-dialog.component.scss'
})
export class PoApproveDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PoApproveDialogComponent, { itemId: number; orderQty: number }[]>);
  private readonly data = inject<PoApproveDialogData>(MAT_DIALOG_DATA);

  readonly itemColumns = ['productName', 'productTypeName', 'orderQty'];
  readonly purchaseOrder = this.data.purchaseOrder;

  orderQtyByItemId: Record<number, number> = Object.fromEntries(
    this.purchaseOrder.items.map((item) => [item.id, item.orderQty ?? item.totalQty])
  );

  get isValid(): boolean {
    return this.purchaseOrder.items.every((item) => (this.orderQtyByItemId[item.id] ?? 0) > 0);
  }

  approve(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close(
      this.purchaseOrder.items.map((item) => ({ itemId: item.id, orderQty: this.orderQtyByItemId[item.id] }))
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}
