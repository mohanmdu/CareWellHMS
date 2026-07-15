import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PoPrintDialogComponent } from './po-print-dialog.component';
import { PurchaseOrderListEntry } from './purchase-order.model';
import { PurchaseOrderService } from './purchase-order.service';

/** "Approved PO Entries" - POs that have gone through approval, View reopens the read-only print view. */
@Component({
  selector: 'app-po-approved-list',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatProgressBarModule, MatTableModule, EmptyStateComponent],
  templateUrl: './po-approved-list.component.html',
  styleUrl: './po-approved-list.component.scss'
})
export class PoApprovedListComponent {
  private readonly service = inject(PurchaseOrderService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['poNumber', 'supplierName', 'createdAt', 'createdBy', 'actions'];

  entries = signal<PurchaseOrderListEntry[]>([]);
  loading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list('APPROVED').subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load approved purchase orders.');
      }
    });
  }

  view(entry: PurchaseOrderListEntry): void {
    this.service.get(entry.id).subscribe({
      next: (purchaseOrder) => {
        this.dialog.open(PoPrintDialogComponent, { width: '720px', maxWidth: '95vw', data: { purchaseOrder } });
      },
      error: () => this.notification.error('Failed to load purchase order.')
    });
  }
}
