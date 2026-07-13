import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../shared/services/notification.service';
import { numberToWords } from '../../shared/receipt/number-to-words';
import { RECEIPT_PRINT_STYLES } from '../../shared/receipt/receipt-print-styles';
import { ClinicSettings } from '../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../masters-admin/clinic-settings/clinic-settings.service';
import { PAYMENT_MODE_LABELS } from '../appointments/booking/appointment.model';
import { OpDirectBillingReceipt } from './op-direct-billing.model';

export interface OpDirectBillingReceiptDialogData {
  receipt: OpDirectBillingReceipt;
}

/**
 * Printable OP Direct Billing receipt, shown right after Submit - also
 * offers quick navigation to Appointments (which surfaces a "Direct
 * Billing" tab for these entries - see AppointmentListComponent),
 * Collection Report, and Refund & Report, the three screens this invoice
 * appears in.
 */
@Component({
  selector: 'app-op-direct-billing-receipt-dialog',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './op-direct-billing-receipt-dialog.component.html',
  styleUrl: './op-direct-billing-receipt-dialog.component.scss'
})
export class OpDirectBillingReceiptDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<OpDirectBillingReceiptDialogComponent>);
  private readonly data = inject<OpDirectBillingReceiptDialogData>(MAT_DIALOG_DATA);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  @ViewChild('receiptContent') receiptContent?: ElementRef<HTMLElement>;

  readonly receipt = this.data.receipt;
  readonly paymentModeLabels = PAYMENT_MODE_LABELS;
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({
      next: (settings) => this.clinicSettings.set(settings),
      error: () => {}
    });
  }

  get amountInWords(): string {
    return numberToWords(this.receipt.totalAmount);
  }

  print(): void {
    const content = this.receiptContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the receipt.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>${RECEIPT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }

  goTo(path: string): void {
    this.dialogRef.close();
    this.router.navigateByUrl(path);
  }

  close(): void {
    this.dialogRef.close();
  }
}
