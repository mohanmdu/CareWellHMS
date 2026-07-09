import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { InvoiceCancelDialogComponent } from './invoice-cancel-dialog.component';
import { Invoice } from './invoice.model';
import { InvoiceService } from './invoice.service';

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  DRAFT: 'neutral',
  PAID: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'warning'
};

/**
 * Replaces the legacy Receipts/CashierOPBillingInvoicePrint.jsp and the
 * per-department duplicate print JSPs (migration doc §4.1) - a PAID invoice
 * IS the receipt here, viewed inline (expandable table row) rather than a
 * separate print-only page.
 */
@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    DecimalPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent {
  private readonly service = inject(InvoiceService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['invoiceNumber', 'patient', 'total', 'status', 'actions'];
  readonly statusTone = STATUS_TONE;

  invoices = signal<Invoice[]>([]);
  loading = signal(false);
  expandedInvoiceId = signal<number | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load invoices.');
      }
    });
  }

  toggle(invoice: Invoice): void {
    this.expandedInvoiceId.set(this.expandedInvoiceId() === invoice.id ? null : invoice.id);
  }

  pay(invoice: Invoice): void {
    if (invoice.id === null) {
      return;
    }
    this.service.pay(invoice.id).subscribe({
      next: () => {
        this.notification.success('Invoice marked as paid.');
        this.refresh();
      },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to mark invoice paid.')
    });
  }

  cancel(invoice: Invoice): void {
    if (invoice.id === null) {
      return;
    }
    this.dialog
      .open(InvoiceCancelDialogComponent, { width: '420px' })
      .afterClosed()
      .subscribe((reason: string | undefined) => {
        if (!reason || invoice.id === null) {
          return;
        }
        this.service.cancel(invoice.id, reason).subscribe({
          next: () => {
            this.notification.success('Invoice cancelled.');
            this.refresh();
          },
          error: () => this.notification.error('Failed to cancel invoice.')
        });
      });
  }
}
