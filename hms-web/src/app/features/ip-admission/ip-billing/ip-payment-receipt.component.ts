import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../../shared/services/notification.service';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { RECEIPT_PRINT_STYLES } from '../../../shared/receipt/receipt-print-styles';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { Admission } from '../admissions/admission.model';
import { AdmissionService } from '../admissions/admission.service';
import { IpPayment } from './ip-billing.model';
import { IpBillingService } from './ip-billing.service';

const PAYMENT_MODE_BUCKETS: { label: string; modes: string[] }[] = [
  { label: 'Cash', modes: ['Cash'] },
  { label: 'Credit/Debit Card', modes: ['Credit Card', 'Debit Card'] },
  { label: 'UPI Payment', modes: ['Google Pay', 'Phone Pe', 'Paytm'] },
  { label: 'Others', modes: ['Demand Draft', 'Cheque'] }
];

/**
 * Printable receipt for a single IP Billing payment - opened by clicking its
 * Invoice No on the Patient Billing Advice screen's Payments table. Mirrors
 * AdvanceReceiptComponent's letterhead/print pattern; there's no separate
 * "invoice" numbering in this schema so receiptNumber doubles as Invoice No.
 */
@Component({
  selector: 'app-ip-payment-receipt',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './ip-payment-receipt.component.html',
  styleUrl: './ip-payment-receipt.component.scss'
})
export class IpPaymentReceiptComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly admissionService = inject(AdmissionService);
  private readonly billingService = inject(IpBillingService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('receiptContent') receiptContent?: ElementRef<HTMLElement>;

  private readonly admissionId = Number(this.route.snapshot.paramMap.get('id'));
  private readonly paymentId = Number(this.route.snapshot.paramMap.get('paymentId'));
  readonly paymentModeBuckets = PAYMENT_MODE_BUCKETS;

  admission = signal<Admission | null>(null);
  payment = signal<IpPayment | null>(null);
  loading = signal(true);
  clinicSettings = signal<ClinicSettings | null>(null);

  constructor() {
    this.clinicSettingsService.get().subscribe({ next: (settings) => this.clinicSettings.set(settings), error: () => {} });

    forkJoin({
      admission: this.admissionService.get(this.admissionId),
      payments: this.billingService.listPayments(this.admissionId)
    }).subscribe({
      next: ({ admission, payments }) => {
        this.admission.set(admission);
        this.payment.set(payments.find((p) => p.id === this.paymentId) ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the receipt.');
      }
    });
  }

  get amountInWords(): string {
    return numberToWords(this.payment()?.netAmount ?? 0);
  }

  isModeTicked(bucket: { modes: string[] }): boolean {
    const mode = this.payment()?.paymentType;
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
          <title>Payment Receipt</title>
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
    this.router.navigate(['/ip/admissions', this.admissionId, 'billing']);
  }
}
