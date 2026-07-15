import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { PHARMACY_RETURN_TYPE_LABELS, PharmacyReturn } from './pharmacy-return.model';

export interface SalesReturnApproveDialogData {
  pharmacyReturn: PharmacyReturn;
}

/**
 * Read-only detail + "Approve Return" confirmation - unlike PO approval,
 * return quantities are already fixed at submission time, so there's
 * nothing editable here, just a confirm/cancel gate before
 * PharmacyReturnService.approve() runs (which is what actually credits
 * stock back).
 */
@Component({
  selector: 'app-sales-return-approve-dialog',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatDialogModule, MatTableModule],
  templateUrl: './sales-return-approve-dialog.component.html',
  styleUrl: './sales-return-approve-dialog.component.scss'
})
export class SalesReturnApproveDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SalesReturnApproveDialogComponent, boolean>);
  private readonly data = inject<SalesReturnApproveDialogData>(MAT_DIALOG_DATA);

  readonly itemColumns = ['productName', 'batch', 'quantity', 'mrp', 'netAmount'];
  readonly returnTypeLabels = PHARMACY_RETURN_TYPE_LABELS;
  readonly pharmacyReturn = this.data.pharmacyReturn;

  approve(): void {
    this.dialogRef.close(true);
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
