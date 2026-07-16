import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { NotificationService } from '../../../shared/services/notification.service';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { PHARMACY_PURCHASE_RETURN_TYPE_LABELS, PharmacyPurchaseReturn } from './purchase-return.model';
import { PURCHASE_RETURN_PRINT_STYLES_A4 } from './purchase-return-print-styles-a4';
import { PURCHASE_RETURN_PRINT_STYLES_DOT_MATRIX } from './purchase-return-print-styles-dot-matrix';
import { PURCHASE_RETURN_PRINT_STYLES_THERMAL } from './purchase-return-print-styles-thermal';

export interface PurchaseReturnPrintDialogData {
  purchaseReturn: PharmacyPurchaseReturn;
}

/**
 * Purchase Return Receipt - the first multi-format print in this app
 * (A4/Dot Matrix/Thermal); every other receipt here is Dot-Matrix-only.
 * Same content, three style constants, three print() methods each doing
 * the same popup-window print() dance as every other receipt dialog.
 */
@Component({
  selector: 'app-purchase-return-print-dialog',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './purchase-return-print-dialog.component.html',
  styleUrl: './purchase-return-print-dialog.component.scss'
})
export class PurchaseReturnPrintDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PurchaseReturnPrintDialogComponent>);
  private readonly data = inject<PurchaseReturnPrintDialogData>(MAT_DIALOG_DATA);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('printContent') printContent?: ElementRef<HTMLElement>;

  readonly purchaseReturn = this.data.purchaseReturn;
  readonly returnTypeLabels = PHARMACY_PURCHASE_RETURN_TYPE_LABELS;
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({
      next: (settings) => this.clinicSettings.set(settings),
      error: () => {}
    });
  }

  get amountInWords(): string {
    return numberToWords(this.purchaseReturn.totalAmount);
  }

  printA4(): void {
    this.print(PURCHASE_RETURN_PRINT_STYLES_A4);
  }

  printDotMatrix(): void {
    this.print(PURCHASE_RETURN_PRINT_STYLES_DOT_MATRIX);
  }

  printThermal(): void {
    this.print(PURCHASE_RETURN_PRINT_STYLES_THERMAL);
  }

  private print(styles: string): void {
    const content = this.printContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the return.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Return #${this.purchaseReturn.id}</title>
          <style>${styles}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }

  close(): void {
    this.dialogRef.close();
  }
}
