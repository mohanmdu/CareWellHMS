import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { NotificationService } from '../../../shared/services/notification.service';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { PHARMACY_RETURN_TYPE_LABELS, PharmacyReturn } from './pharmacy-return.model';
import { SALES_RETURN_PRINT_STYLES } from './sales-return-print-styles';

export interface SalesReturnPrintDialogData {
  pharmacyReturn: PharmacyReturn;
}

/**
 * Dot Matrix Sales Return receipt - serves both the immediate acknowledgment
 * slip printed right after submit (status PENDING) and later read-only
 * reopens from the Approval queue / Sales Return Report (status APPROVED).
 */
@Component({
  selector: 'app-sales-return-print-dialog',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './sales-return-print-dialog.component.html',
  styleUrl: './sales-return-print-dialog.component.scss'
})
export class SalesReturnPrintDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SalesReturnPrintDialogComponent>);
  private readonly data = inject<SalesReturnPrintDialogData>(MAT_DIALOG_DATA);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('printContent') printContent?: ElementRef<HTMLElement>;

  readonly pharmacyReturn = this.data.pharmacyReturn;
  readonly returnTypeLabels = PHARMACY_RETURN_TYPE_LABELS;
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({
      next: (settings) => this.clinicSettings.set(settings),
      error: () => {}
    });
  }

  get returnDate(): string {
    return this.pharmacyReturn.approvedAt ?? this.pharmacyReturn.submittedAt;
  }

  get signedBy(): string | null {
    return this.pharmacyReturn.approvedBy ?? this.pharmacyReturn.submittedBy;
  }

  get amountInWords(): string {
    return numberToWords(this.pharmacyReturn.totalAmount);
  }

  print(): void {
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
          <title>Return #${this.pharmacyReturn.id}</title>
          <style>${SALES_RETURN_PRINT_STYLES}</style>
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
