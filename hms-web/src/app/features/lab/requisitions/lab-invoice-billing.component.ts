import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { LAB_PAYMENT_MODE_LABELS, LAB_PAYMENT_MODES, LabPaymentMode, LabRequisition } from './lab-requisition.model';
import { LabRequisitionService } from './lab-requisition.service';

/** Invoice Details + Billing Details (screen 5 of 6): approving a pending requisition takes payment, then routes to the receipt. */
@Component({
  selector: 'app-lab-invoice-billing',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatSelectModule],
  templateUrl: './lab-invoice-billing.component.html',
  styleUrl: './lab-invoice-billing.component.scss'
})
export class LabInvoiceBillingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(LabRequisitionService);
  private readonly notification = inject(NotificationService);

  private readonly requisitionId = Number(this.route.snapshot.paramMap.get('id'));

  readonly paymentModes = LAB_PAYMENT_MODES;
  readonly paymentModeLabels = LAB_PAYMENT_MODE_LABELS;

  loading = signal(true);
  saving = signal(false);
  requisition = signal<LabRequisition | null>(null);

  form: { paidAmount: number; discountAmount: number; paymentMode: LabPaymentMode | ''; remarks: string } = {
    paidAmount: 0,
    discountAmount: 0,
    paymentMode: '',
    remarks: ''
  };

  constructor() {
    this.service.getById(this.requisitionId).subscribe({
      next: (requisition) => {
        this.requisition.set(requisition);
        this.form.paidAmount = requisition.totalAmount;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the invoice.');
      }
    });
  }

  get isValid(): boolean {
    return this.form.paidAmount >= 0 && !!this.form.paymentMode;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    this.saving.set(true);
    this.service
      .approve(this.requisitionId, {
        paidAmount: this.form.paidAmount,
        discountAmount: this.form.discountAmount,
        paymentMode: this.form.paymentMode as LabPaymentMode,
        remarks: this.form.remarks.trim() || null
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/lab/billing', this.requisitionId, 'receipt']);
        },
        error: (err) => {
          this.saving.set(false);
          this.notification.error(err.error?.message ?? 'Failed to record the billing.');
        }
      });
  }
}
