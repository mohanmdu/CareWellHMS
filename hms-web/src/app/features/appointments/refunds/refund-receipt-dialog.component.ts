import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../shared/services/notification.service';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { RECEIPT_PRINT_STYLES } from '../../../shared/receipt/receipt-print-styles';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { RefundReceiptEntry } from './refund.model';

export interface RefundReceiptDialogData {
  refund: RefundReceiptEntry;
}

/**
 * Read-only refund receipt viewer - opened both right after confirming a
 * refund (PaymentRefundComponent) and when clicking a Refund No/Invoice No
 * link in RefundReportComponent (passing the already-loaded row, no extra
 * API call needed since RefundReceiptEntry carries every field the receipt
 * needs). A refund is immutable once created, so this only ever has
 * Print/Done actions - no editing.
 */
@Component({
  selector: 'app-refund-receipt-dialog',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './refund-receipt-dialog.component.html',
  styleUrl: './refund-receipt-dialog.component.scss'
})
export class RefundReceiptDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RefundReceiptDialogComponent>);
  private readonly data = inject<RefundReceiptDialogData>(MAT_DIALOG_DATA);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('receiptContent') receiptContent?: ElementRef<HTMLElement>;

  readonly refund = this.data.refund;
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({
      next: (settings) => this.clinicSettings.set(settings),
      // Non-critical - the receipt just renders without branding if this fails.
      error: () => {}
    });
  }

  get amountInWords(): string {
    return numberToWords(this.refund.refundAmount);
  }

  /** Same standalone-popup print pattern as AppointmentBillingDialogComponent.print(). */
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
          <title>Refund Receipt</title>
          <style>${RECEIPT_PRINT_STYLES}</style>
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
