import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LabRequisitionListRow } from './lab-requisition.model';
import { LabRequisitionService } from './lab-requisition.service';

/** Lab & X-Ray/Scan Billing (screen 4 of 6): pending requisitions awaiting Approve/Cancel. */
@Component({
  selector: 'app-lab-billing-worklist',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './lab-billing-worklist.component.html',
  styleUrl: './lab-billing-worklist.component.scss'
})
export class LabBillingWorklistComponent {
  private readonly service = inject(LabRequisitionService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  rows = signal<LabRequisitionListRow[]>([]);
  loading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.getPending().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the lab billing worklist.');
      }
    });
  }

  approve(row: LabRequisitionListRow): void {
    this.router.navigate(['/lab/billing', row.id, 'invoice']);
  }

  cancel(row: LabRequisitionListRow): void {
    this.confirmDialog
      .confirm({
        title: `Cancel this requisition?`,
        message: `${row.patientName}'s pending Labtest requisition will be cancelled.`,
        confirmLabel: 'Cancel Requisition',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.cancel(row.id).subscribe({
          next: () => {
            this.notification.success('Requisition cancelled.');
            this.refresh();
          },
          error: () => this.notification.error('Failed to cancel the requisition.')
        });
      });
  }
}
