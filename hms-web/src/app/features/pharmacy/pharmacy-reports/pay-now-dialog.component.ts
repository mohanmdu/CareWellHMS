import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PHARMACY_PAY_MODES, PharmacySaleListEntry, PharmacySalePaymentRequest } from '../pharmacy-billing/pharmacy-sale.model';

export interface PayNowDialogData {
  entry: PharmacySaleListEntry;
}

@Component({
  selector: 'app-pay-now-dialog',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './pay-now-dialog.component.html',
  styleUrl: './pay-now-dialog.component.scss'
})
export class PayNowDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PayNowDialogComponent, PharmacySalePaymentRequest>);
  readonly data = inject<PayNowDialogData>(MAT_DIALOG_DATA);

  readonly payModes = PHARMACY_PAY_MODES;

  form: PharmacySalePaymentRequest = {
    amount: this.data.entry.balanceAmount,
    discountAmount: 0,
    remarks: null,
    payMode: 'Cash'
  };

  get isValid(): boolean {
    const amount = this.form.amount ?? 0;
    const discount = this.form.discountAmount ?? 0;
    return amount + discount > 0 && amount + discount <= this.data.entry.balanceAmount;
  }

  payNow(): void {
    if (!this.isValid) {
      return;
    }
    this.dialogRef.close(this.form);
  }
}
