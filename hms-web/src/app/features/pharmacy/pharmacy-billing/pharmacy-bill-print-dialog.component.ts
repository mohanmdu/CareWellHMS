import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../shared/services/notification.service';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { PharmacyBillingType, PharmacySale } from './pharmacy-sale.model';
import { PHARMACY_BILL_PRINT_STYLES } from './pharmacy-bill-print-styles';

export interface PharmacyBillPrintDialogData {
  sale: PharmacySale;
}

/** Dot Matrix bill print, matching the legacy PCMC Pharmacy reference layout exactly. */
@Component({
  selector: 'app-pharmacy-bill-print-dialog',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './pharmacy-bill-print-dialog.component.html',
  styleUrl: './pharmacy-bill-print-dialog.component.scss'
})
export class PharmacyBillPrintDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PharmacyBillPrintDialogComponent>);
  private readonly data = inject<PharmacyBillPrintDialogData>(MAT_DIALOG_DATA);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('printContent') printContent?: ElementRef<HTMLElement>;

  readonly sale = this.data.sale;
  readonly invoiceTitle = (billingType: PharmacyBillingType) => (billingType === 'CASH' ? 'Cash Invoice' : 'Credit Invoice');
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({
      next: (settings) => this.clinicSettings.set(settings),
      error: () => {}
    });
  }

  get amountInWords(): string {
    return numberToWords(this.sale.amountPaid);
  }

  print(): void {
    const content = this.printContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the bill.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill #${this.sale.billNumber}</title>
          <style>${PHARMACY_BILL_PRINT_STYLES}</style>
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
