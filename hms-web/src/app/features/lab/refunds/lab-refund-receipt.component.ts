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
import { LabRefundReceiptEntry } from './lab-refund.model';
import { LabRefundService } from './lab-refund.service';

/** Read-only refund print receipt - reuses the same shared .receipt styles as lab-receipt.component. */
@Component({
  selector: 'app-lab-refund-receipt',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './lab-refund-receipt.component.html',
  styleUrl: './lab-refund-receipt.component.scss'
})
export class LabRefundReceiptComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(LabRefundService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  private readonly refundId = Number(this.route.snapshot.paramMap.get('id'));

  @ViewChild('receiptContent') receiptContent?: ElementRef<HTMLElement>;

  loading = signal(true);
  refund = signal<LabRefundReceiptEntry | null>(null);
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });
    this.service.get(this.refundId).subscribe({
      next: (refund) => {
        this.refund.set(refund);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the refund receipt.');
      }
    });
  }

  get amountInWords(): string {
    const r = this.refund();
    return r ? numberToWords(r.refundAmount) : '';
  }

  back(): void {
    this.router.navigate(['/lab/refunds']);
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
}
