import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { RECEIPT_PRINT_STYLES } from '../../../shared/receipt/receipt-print-styles';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { LAB_PAYMENT_MODE_LABELS, LabPaymentMode, LabRequisition } from './lab-requisition.model';
import { LabRequisitionService } from './lab-requisition.service';

/** Read-only print receipt (screen 6 of 6) - reuses the shared .receipt styles/numberToWords/RECEIPT_PRINT_STYLES already built for Appointment/OP billing receipts. */
@Component({
  selector: 'app-lab-receipt',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './lab-receipt.component.html',
  styleUrl: './lab-receipt.component.scss'
})
export class LabReceiptComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(LabRequisitionService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  private readonly requisitionId = Number(this.route.snapshot.paramMap.get('id'));

  readonly paymentModeLabels = LAB_PAYMENT_MODE_LABELS;

  @ViewChild('receiptContent') receiptContent?: ElementRef<HTMLElement>;

  loading = signal(true);
  requisition = signal<LabRequisition | null>(null);
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
    this.service.getById(this.requisitionId).subscribe({
      next: (requisition) => {
        this.requisition.set(requisition);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the receipt.');
      }
    });
  }

  get amountInWords(): string {
    const r = this.requisition();
    return r?.paidAmount ? numberToWords(r.paidAmount) : '';
  }

  paymentModeLabel(mode: string | null): string {
    return mode ? this.paymentModeLabels[mode as LabPaymentMode] : '—';
  }

  back(): void {
    this.router.navigate(['/lab/billing']);
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
          <title>Lab Receipt</title>
          <style>${RECEIPT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }
}
