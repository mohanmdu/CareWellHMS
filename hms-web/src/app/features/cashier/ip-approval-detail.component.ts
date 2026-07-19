import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PAYMENT_MODE_OPTIONS, PaymentRequest } from '../ip-admission/payment-request/payment-request.model';
import { PaymentRequestService } from '../ip-admission/payment-request/payment-request.service';

/** Payment Mode Selection (PDF screen 5): "Appointments for Cashier Approval" voucher grid + payment mode dropdown. */
@Component({
  selector: 'app-ip-approval-detail',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatFormFieldModule, MatProgressBarModule, MatSelectModule, PageHeaderComponent],
  templateUrl: './ip-approval-detail.component.html',
  styleUrl: './ip-approval-detail.component.scss'
})
export class IpApprovalDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly notification = inject(NotificationService);

  private readonly requestId = Number(this.route.snapshot.paramMap.get('id'));
  readonly paymentModeOptions = PAYMENT_MODE_OPTIONS;

  request = signal<PaymentRequest | null>(null);
  loading = signal(true);
  submitting = signal(false);
  paymentMode: string = PAYMENT_MODE_OPTIONS[0];

  constructor() {
    this.paymentRequestService.get(this.requestId).subscribe({
      next: (request) => {
        this.request.set(request);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the payment request.');
      }
    });
  }

  submit(): void {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.paymentRequestService.approve(this.requestId, this.paymentMode).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/cashier/ip-approvals', this.requestId, 'receipt']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.error(err.error?.message ?? 'Failed to approve the payment request.');
      }
    });
  }
}
