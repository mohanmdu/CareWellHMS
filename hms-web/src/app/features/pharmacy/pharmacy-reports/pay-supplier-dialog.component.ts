import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SUPPLIER_PAY_MODES, SupplierPaymentRequest } from './supplier-payment.model';

export interface PaySupplierDialogData {
  title: string;
  defaultAmount: number;
  maxAmount?: number;
}

/**
 * Shared Amount/Mode/Transaction ID/Any Info form reused for Pay All, Pay
 * Selected, and Make Pay - same "one dialog, multiple entry points" shape as
 * PayNowDialogComponent (Pharmacy Due Report).
 */
@Component({
  selector: 'app-pay-supplier-dialog',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './pay-supplier-dialog.component.html',
  styleUrl: './pay-supplier-dialog.component.scss'
})
export class PaySupplierDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PaySupplierDialogComponent, SupplierPaymentRequest>);
  readonly data = inject<PaySupplierDialogData>(MAT_DIALOG_DATA);

  readonly payModes = SUPPLIER_PAY_MODES;

  form: SupplierPaymentRequest = {
    amount: this.data.defaultAmount,
    payMode: 'Cash',
    transactionId: null,
    remarks: null
  };

  get isValid(): boolean {
    const amount = this.form.amount ?? 0;
    if (amount <= 0) {
      return false;
    }
    return this.data.maxAmount === undefined || amount <= this.data.maxAmount;
  }

  payNow(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close(this.form);
  }
}
