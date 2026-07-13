import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../../shared/services/notification.service';
import { numberToWords } from '../../../shared/receipt/number-to-words';
import { RECEIPT_PRINT_STYLES } from '../../../shared/receipt/receipt-print-styles';
import { ClinicSettings } from '../../masters-admin/clinic-settings/clinic-settings.model';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { Appointment, PAYMENT_MODE_LABELS, PAYMENT_MODES, PaymentMode } from './appointment.model';
import { AppointmentService } from './appointment.service';

export interface AppointmentBillingDialogData {
  appointment: Appointment;
}

/**
 * Approving an appointment lands here instead of a bare status flip:
 * Invoice + Billing Details entry, then (on submit) a printable receipt -
 * matching the legacy two-screen approval flow. Submitting moves the
 * appointment straight to COMPLETED (AppointmentService.bill); closing
 * without submitting leaves it Pending (BOOKED), so there's no separate
 * "approved but unbilled" state.
 *
 * Also doubles as a read-only receipt viewer: if the appointment passed in
 * is already COMPLETED (e.g. opened via the Collection Report's Invoice No
 * link), the dialog skips straight to the receipt step instead of the
 * billing form - there's nothing left to bill.
 */
@Component({
  selector: 'app-appointment-billing-dialog',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './appointment-billing-dialog.component.html',
  styleUrl: './appointment-billing-dialog.component.scss'
})
export class AppointmentBillingDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AppointmentBillingDialogComponent, boolean>);
  private readonly data = inject<AppointmentBillingDialogData>(MAT_DIALOG_DATA);
  private readonly appointmentService = inject(AppointmentService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);

  @ViewChild('receiptContent') receiptContent?: ElementRef<HTMLElement>;

  readonly appointment = this.data.appointment;
  readonly paymentModes = PAYMENT_MODES;
  readonly paymentModeLabels = PAYMENT_MODE_LABELS;
  readonly today = new Date();

  step = signal<'billing' | 'receipt'>('billing');
  saving = signal(false);
  clinicSettings = signal<ClinicSettings | null>(null);
  billedAppointment = signal<Appointment | null>(null);
  nextInvoiceNumber = signal<number | null>(null);

  form = {
    paidAmount: this.appointment.invoicedAmount ?? 0,
    discountAmount: 0,
    doctorReferralAmount: 0,
    paymentMode: 'CASH' as PaymentMode,
    remarks: ''
  };

  constructor() {
    this.clinicSettingsService.get().subscribe({
      next: (settings) => this.clinicSettings.set(settings),
      // Non-critical for billing itself - the receipt just renders without branding if this fails.
      error: () => {}
    });
    if (this.appointment.status === 'COMPLETED') {
      this.billedAppointment.set(this.appointment);
      this.step.set('receipt');
    } else {
      this.appointmentService.getNextInvoiceNumber().subscribe({
        next: (invoiceNumber) => this.nextInvoiceNumber.set(invoiceNumber),
        // Non-critical - the Invoice No column just shows a placeholder if this fails.
        error: () => {}
      });
    }
  }

  get isValid(): boolean {
    return this.form.paidAmount >= 0 && !!this.form.paymentMode;
  }

  get amountInWords(): string {
    const billed = this.billedAppointment();
    return billed?.paidAmount ? numberToWords(billed.paidAmount) : '';
  }

  submit(): void {
    if (!this.appointment.id || !this.isValid) {
      return;
    }
    this.saving.set(true);
    this.appointmentService
      .bill(this.appointment.id, {
        paidAmount: this.form.paidAmount,
        discountAmount: this.form.discountAmount,
        doctorReferralAmount: this.form.doctorReferralAmount,
        paymentMode: this.form.paymentMode,
        remarks: this.form.remarks.trim() || null
      })
      .subscribe({
        next: (billed) => {
          this.saving.set(false);
          this.billedAppointment.set(billed);
          this.step.set('receipt');
        },
        error: (err) => {
          this.saving.set(false);
          this.notification.error(err.error?.message ?? 'Failed to record billing.');
        }
      });
  }

  /**
   * Prints the receipt in a standalone popup rather than the current page:
   * the receipt lives inside a MatDialog overlay (its own positioning/
   * transform stacking context), which fights a same-page "hide everything
   * except this element" print stylesheet - the content ends up
   * mis-positioned/clipped instead of filling the printed page. A fresh
   * popup window has no such interference.
   */
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

  close(): void {
    this.dialogRef.close(this.step() === 'receipt');
  }
}
