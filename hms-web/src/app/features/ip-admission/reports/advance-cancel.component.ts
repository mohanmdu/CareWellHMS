import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { CancellationRequestRow } from '../payment-request/payment-request.model';
import { PaymentRequestService } from '../payment-request/payment-request.service';

/** Advance Cancel (PDF: "CANCELLATION/REFUND SEARCH INPUT" -> "...REQUESTS"): reverses an approved cashier request (Cancel or Convert to Credit). */
@Component({
  selector: 'app-advance-cancel',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './advance-cancel.component.html',
  styleUrl: './advance-cancel.component.scss'
})
export class AdvanceCancelComponent {
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly promptDialog = inject(PromptDialogService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notification = inject(NotificationService);

  uhid = '';
  loading = signal(false);
  searched = signal(false);
  rows = signal<CancellationRequestRow[]>([]);
  successMessage = signal<string | null>(null);

  search(): void {
    const uhid = this.uhid.trim();
    if (!uhid) {
      return;
    }
    this.successMessage.set(null);
    this.loading.set(true);
    this.paymentRequestService.searchCancellable(uhid).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to search for cancellation/refund requests.');
      }
    });
  }

  cancel(row: CancellationRequestRow): void {
    this.promptDialog
      .prompt({
        title: 'Cancellation Request',
        fields: [{ key: 'reason', label: 'Please enter the reason to cancel', type: 'textarea', required: true }],
        confirmLabel: 'OK'
      })
      .subscribe((values) => {
        if (!values) {
          return;
        }
        this.processCancellation(row.id, values['reason'] as string, 'Cancellation Request has been processed successfully.');
      });
  }

  convertToCredit(row: CancellationRequestRow): void {
    this.confirmDialog
      .confirm({
        title: 'Convert to Credit',
        message: `Convert this amount of ${row.amount} to patient credit instead of cancelling it outright?`,
        confirmLabel: 'Convert'
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.processCancellation(row.id, 'Converted to Credit', 'Conversion to Credit has been processed successfully.');
      });
  }

  private processCancellation(id: number, reason: string, successMessage: string): void {
    this.paymentRequestService.cancel(id, reason).subscribe({
      next: () => {
        this.uhid = '';
        this.rows.set([]);
        this.searched.set(false);
        this.successMessage.set(successMessage);
      },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to process the request.')
    });
  }
}
