import { DatePipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../../shared/services/notification.service';
import { RECEIPT_PRINT_STYLES } from '../../../../shared/receipt/receipt-print-styles';
import { ClinicSettings } from '../../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../../masters-admin/clinic-settings/clinic-settings.service';
import { PurchaseOrder } from './purchase-order.model';

export interface PoPrintDialogData {
  purchaseOrder: PurchaseOrder;
}

/**
 * Read-only print view of a raised/approved PO - same document at two
 * states: titled "Quotation Form" while PENDING_APPROVAL, "Purchase Order"
 * once APPROVED (same poNumber throughout), matching the legacy behavior.
 */
@Component({
  selector: 'app-po-print-dialog',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './po-print-dialog.component.html',
  styleUrl: './po-print-dialog.component.scss'
})
export class PoPrintDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PoPrintDialogComponent>);
  private readonly data = inject<PoPrintDialogData>(MAT_DIALOG_DATA);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('printContent') printContent?: ElementRef<HTMLElement>;

  readonly purchaseOrder = this.data.purchaseOrder;
  readonly title = this.purchaseOrder.status === 'PENDING_APPROVAL' ? 'Quotation Form' : 'Purchase Order';
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({
      next: (settings) => this.clinicSettings.set(settings),
      error: () => {}
    });
  }

  print(): void {
    const content = this.printContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${this.title}</title>
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
