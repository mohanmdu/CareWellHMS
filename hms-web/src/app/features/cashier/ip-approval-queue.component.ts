import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PaymentRequest } from '../ip-admission/payment-request/payment-request.model';
import { PaymentRequestService } from '../ip-admission/payment-request/payment-request.service';

/** IP Approval Queue (PDF screen 4): pending Advance/Final Settlement/Due Amount requests awaiting a cashier's payment mode selection. */
@Component({
  selector: 'app-ip-approval-queue',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatProgressBarModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './ip-approval-queue.component.html',
  styleUrl: './ip-approval-queue.component.scss'
})
export class IpApprovalQueueComponent {
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly router = inject(Router);

  requests = signal<PaymentRequest[]>([]);
  loading = signal(true);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.paymentRequestService.listPending().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  view(request: PaymentRequest): void {
    this.router.navigate(['/cashier/ip-approvals', request.id]);
  }
}
