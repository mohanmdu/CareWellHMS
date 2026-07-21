import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PreAuthorizationRequest } from '../pre-authorization/pre-authorization-request.model';
import { PreAuthorizationRequestService } from '../pre-authorization/pre-authorization-request.service';

type DecisionStatus = '' | 'APPROVED' | 'REJECTED';

interface DecisionForm {
  claimAmountApproved: number | null;
  decidedDate: Date | null;
  status: DecisionStatus;
  reason: string;
}

function toIsoDate(date: Date | null): string | undefined {
  if (!date) {
    return undefined;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Insurance Approval Queue: every PENDING pre-authorization request awaiting
 * a decision. "Edit" toggles to "Hide" and expands an inline panel below the
 * row to record the decision - Approved requires a Claim Amount Approved,
 * Rejected doesn't. The Type column always reads "Pre-Authorization Pending"
 * (this system only ever raises Pre-Authorization requests - see
 * PreAuthorizationRequestService/module docs; there's no separate
 * "Enhancement" request type here). Once decided, the request is no longer
 * PENDING so it drops off this list on refresh.
 */
@Component({
  selector: 'app-insurance-approval-queue',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    EmptyStateComponent
  ],
  templateUrl: './insurance-approval-queue.component.html',
  styleUrl: './insurance-approval-queue.component.scss'
})
export class InsuranceApprovalQueueComponent {
  private readonly requestService = inject(PreAuthorizationRequestService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  loading = signal(false);
  submitting = signal(false);
  requests = signal<PreAuthorizationRequest[]>([]);

  editingId = signal<number | null>(null);
  form: DecisionForm = { claimAmountApproved: null, decidedDate: new Date(), status: '', reason: '' };

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.requestService.getPending().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the insurance approval queue.');
      }
    });
  }

  startEdit(request: PreAuthorizationRequest): void {
    this.editingId.set(request.id);
    this.form = { claimAmountApproved: null, decidedDate: new Date(), status: '', reason: '' };
  }

  hideEdit(): void {
    this.editingId.set(null);
  }

  get canConfirm(): boolean {
    if (!this.form.status || !this.form.decidedDate) {
      return false;
    }
    if (this.form.status === 'APPROVED') {
      return this.form.claimAmountApproved !== null && this.form.claimAmountApproved >= 0;
    }
    return true;
  }

  confirmUpdate(request: PreAuthorizationRequest): void {
    if (request.id === null || !this.canConfirm) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: 'Update Status',
        message: 'Are you sure you want to Update Status?',
        confirmLabel: 'OK'
      })
      .subscribe((confirmed) => {
        if (!confirmed || request.id === null) {
          return;
        }
        const decidedDate = toIsoDate(this.form.decidedDate);
        if (!decidedDate) {
          return;
        }
        this.submitting.set(true);
        const decision$ =
          this.form.status === 'APPROVED'
            ? this.requestService.approve(request.id, {
                approvedAmount: this.form.claimAmountApproved ?? 0,
                reason: this.form.reason || null,
                decidedDate
              })
            : this.requestService.reject(request.id, { reason: this.form.reason || null, decidedDate });
        decision$.subscribe({
          next: () => {
            this.submitting.set(false);
            this.editingId.set(null);
            this.notification.success('Status updated.');
            this.refresh();
          },
          error: (err) => {
            this.submitting.set(false);
            this.notification.error(err.error?.message ?? 'Failed to update the status.');
          }
        });
      });
  }
}
