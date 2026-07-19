import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { numberToWords } from '../../shared/receipt/number-to-words';
import { RECEIPT_PRINT_STYLES } from '../../shared/receipt/receipt-print-styles';
import { ClinicSettings } from '../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../masters-admin/clinic-settings/clinic-settings.service';
import { AdmissionService } from '../ip-admission/admissions/admission.service';
import { IpBillingService } from '../ip-admission/ip-billing/ip-billing.service';
import { PaymentRequest } from '../ip-admission/payment-request/payment-request.model';
import { PaymentRequestService } from '../ip-admission/payment-request/payment-request.service';

const PAYMENT_MODE_BUCKETS: { label: string; modes: string[] }[] = [
  { label: 'Cash', modes: ['Cash'] },
  { label: 'Credit/Debit Card', modes: ['Credit Card', 'Debit Card'] },
  { label: 'UPI Payment', modes: ['Google Pay', 'Phone Pe', 'Paytm'] },
  { label: 'Others', modes: ['Demand Draft', 'Cheque'] }
];

/** Printable Advance Receipt (PDF screen 6) - shown right after a cashier approves a payment request. */
@Component({
  selector: 'app-advance-receipt',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './advance-receipt.component.html',
  styleUrl: './advance-receipt.component.scss'
})
export class AdvanceReceiptComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly admissionService = inject(AdmissionService);
  private readonly billingService = inject(IpBillingService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('receiptContent') receiptContent?: ElementRef<HTMLElement>;

  private readonly requestId = Number(this.route.snapshot.paramMap.get('id'));
  readonly paymentModeBuckets = PAYMENT_MODE_BUCKETS;

  request = signal<PaymentRequest | null>(null);
  totalAmountDue = signal(0);
  balanceDue = signal(0);
  loading = signal(true);
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });

    this.paymentRequestService.get(this.requestId).subscribe({
      next: (request) => {
        this.request.set(request);
        forkJoin({
          admission: this.admissionService.get(request.admissionId),
          ledger: this.billingService.getLedger(request.admissionId)
        }).subscribe({
          next: ({ admission, ledger }) => {
            const advanceBefore = (admission.advanceAmount ?? 0) - request.amount;
            this.totalAmountDue.set(Math.max(ledger.netTotal - advanceBefore, 0));
            this.balanceDue.set(Math.max(ledger.netTotal - (admission.advanceAmount ?? 0), 0));
            this.loading.set(false);
          },
          error: () => this.loading.set(false)
        });
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the receipt.');
      }
    });
  }

  get amountInWords(): string {
    return numberToWords(this.request()?.amount ?? 0);
  }

  isModeTicked(bucket: { modes: string[] }): boolean {
    const mode = this.request()?.paymentMode;
    return !!mode && bucket.modes.includes(mode);
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
          <title>Advance Receipt</title>
          <style>${RECEIPT_PRINT_STYLES}</style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }

  goToBilling(): void {
    const admissionId = this.request()?.admissionId;
    if (admissionId === undefined) {
      return;
    }
    this.router.navigate(['/ip/admissions', admissionId, 'billing']);
  }
}
