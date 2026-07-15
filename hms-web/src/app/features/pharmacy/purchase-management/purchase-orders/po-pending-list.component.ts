import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PoApproveDialogComponent } from './po-approve-dialog.component';
import { PoPrintDialogComponent } from './po-print-dialog.component';
import { PurchaseOrderListEntry } from './purchase-order.model';
import { PurchaseOrderService } from './purchase-order.service';

/**
 * "Quotation Report" - POs raised and awaiting approval. Clicking View opens
 * PoApproveDialogComponent (editable Order Qty), Approving there calls the
 * approve endpoint and refreshes this list.
 */
@Component({
  selector: 'app-po-pending-list',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatProgressBarModule, MatTableModule, EmptyStateComponent],
  templateUrl: './po-pending-list.component.html',
  styleUrl: './po-pending-list.component.scss'
})
export class PoPendingListComponent {
  private readonly service = inject(PurchaseOrderService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['poNumber', 'supplierName', 'createdAt', 'createdBy', 'actions'];

  entries = signal<PurchaseOrderListEntry[]>([]);
  loading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list('PENDING_APPROVAL').subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load pending purchase orders.');
      }
    });
  }

  view(entry: PurchaseOrderListEntry): void {
    this.service.get(entry.id).subscribe({
      next: (purchaseOrder) => {
        this.dialog
          .open(PoApproveDialogComponent, { width: '640px', maxWidth: '95vw', data: { purchaseOrder } })
          .afterClosed()
          .subscribe((approvals) => {
            if (!approvals) {
              return;
            }
            this.service.approve(entry.id, { items: approvals }).subscribe({
              next: (approved) => {
                this.notification.success('Purchase order approved.');
                this.refresh();
                this.dialog.open(PoPrintDialogComponent, {
                  width: '720px',
                  maxWidth: '95vw',
                  data: { purchaseOrder: approved }
                });
              },
              error: (err) => this.notification.error(err.error?.message ?? 'Failed to approve purchase order.')
            });
          });
      },
      error: () => this.notification.error('Failed to load purchase order.')
    });
  }

  cancel(entry: PurchaseOrderListEntry): void {
    this.confirmDialog
      .confirm({
        title: `Cancel PO #${entry.poNumber}?`,
        message: 'This purchase order will be cancelled and removed from the pending list. This cannot be undone.',
        confirmLabel: 'Cancel PO',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.cancel(entry.id).subscribe({
          next: () => {
            this.notification.success('Purchase order cancelled.');
            this.refresh();
          },
          error: () => this.notification.error('Failed to cancel purchase order.')
        });
      });
  }
}
